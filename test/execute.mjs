
import { Worker, workerData } from 'worker_threads';

let worker = null;

export function prepare(childCount)
{
    if (worker || childCount <= 0) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        worker = new Worker('./exec_worker.mjs', { workerData: {childCount: childCount - 1, logBuffer: workerData.logBuffer} });
        worker.on("message", () => {
            log(`Execution worker ${childCount - 1} is ready to receive`);
            resolve();
        });
    });
}

export function execute(program, args)
{
    let exitIndication = new Int32Array(new SharedArrayBuffer(4));
    exitIndication[0] = 0x7FFFFFFF;
    worker.postMessage([program, args, exitIndication]);
    Atomics.wait(exitIndication, 0, 0x7FFFFFFF);
    return exitIndication[0];
}

export function terminate()
{
    worker.terminate();
    worker = null;
}

let textEncoder;
let textDecoder;
let logIndexes;
let logContent;

if (workerData && workerData.logBuffer) {
    textEncoder = new TextEncoder();
    textDecoder = new TextDecoder();
    logIndexes = new Uint32Array(workerData.logBuffer, 0x100000, 2);
    logContent = new Uint8Array(workerData.logBuffer, 0, 0x100000);
}

export function log(text)
{
    let buf = textEncoder.encode(text + '\n');
    let from = Atomics.add(logIndexes, 0, buf.length) & 0xFFFFF;
    let to = (from + buf.length) & 0xFFFFF;
    if (to < from) {
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
        return '';
    } else if (to < from) {
        throw 'Not implemented';
    }
    let term = logContent.indexOf(0, from);
    if (term > 0 && term < to) {
        to = term;
        if (to == from) {
            return '';
        }
    }
    let buf = new Uint8Array(logContent.buffer, from, to - from);
    let text = textDecoder.decode(buf);
    buf.fill(0);
    Atomics.add(logIndexes, 1, buf.length);
    return text;
}
