import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads';

let logPrefix = `${threadId}   `.substr(0, 3) + '  ';

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();

let worker = null;
let workerResolve = null;
let logBuffer = (workerData && workerData.logBuffer) ? workerData.logBuffer : new SharedArrayBuffer(0x100000 + 8);
let logIndexes = new Uint32Array(logBuffer, 0x100000, 2);
let logContent = new Uint8Array(logBuffer, 0, 0x100000);

export function getModule(program) {
    if (!(program in workerData.modules)) {
        throw Error(`Cannot find module ${program}`);
    }
    return workerData.modules[program];
}

export function prepareWorker(modules) {

    if (worker) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        worker = new Worker('./runner.mjs', {
            workerData: {
                modules: modules || workerData.modules,
                logBuffer: logBuffer,
            }
        });
        worker.on("message", exitCode => {
            if (exitCode === null) {
                log(`Child worker is ready`);
                resolve();
            } else {
                let f = workerResolve;
                workerResolve = null;
                if (f) {
                    f(exitCode);
                }
            }
        });
    });

}

export function terminateWorker() {
    if (worker) {
        worker.terminate();
    }
}

export function executeSync(program, args) {
    let exitIndication = new Int32Array(new SharedArrayBuffer(4));
    exitIndication[0] = 0x7FFFFFFF;
    worker.postMessage([program, args, exitIndication]);
    Atomics.wait(exitIndication, 0, 0x7FFFFFFF);
    return exitIndication[0];
}

export function execute(program, args) {
    return new Promise(resolve => {
        workerResolve = resolve;
        worker.postMessage([program, args, null]);
    });
}

export function log(text)
{
    let buf = textEncoder.encode(logPrefix + text.replace(/\n/g, `\n${logPrefix}`) + '\n');
    let from = Atomics.add(logIndexes, 0, buf.length) & 0xFFFFF;
    let to = (from + buf.length) & 0xFFFFF;
    if (to < from) {
        throw 'logBuffer overflow not implemented';
        logContent.set(new Uint8Array(buf.buffer, 0, 0x100000 - from), from);
        logContent.set(new Uint8Array(buf.buffer, 0x100000 - from), 0);
    } else {
        logContent.set(buf, from);
    }
}

export function getLog()
{
    let from = Atomics.load(logIndexes, 1) & 0xFFFFF;
    let to = Atomics.load(logIndexes, 0) & 0xFFFFF;
    if (to == from) {
        return null;
    } else if (to < from) {
        throw 'logBuffer overflow not implemented';
    }
    let term = logContent.indexOf(0, from);
    if (term > 0 && term < to) {
        to = term;
        if (to == from) {
            return null;
        }
    }
    let buf = new Uint8Array(logContent.buffer, from, to - from);
    let text = textDecoder.decode(buf);
    buf.fill(0);
    Atomics.add(logIndexes, 1, buf.length);
    return text;
}
