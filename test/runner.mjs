
import fs from 'fs';
import path from 'path';
import { WASI } from 'wasi';
import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads';
import { executeSync } from './common.mjs';
import { prepareWorker, log, getModule } from './common.mjs'

log(`Worker started`);

let memory;
const decoder = new TextDecoder();
const encoder = new TextEncoder();

function getArray(ptr, length) {
    if (ptr == 0) return null;
    let u = new Uint32Array(memory.buffer, ptr, length);
    let arr = [];
    for (let i of u) {
        arr.push(i);
    }
    return arr;
}

function getString(ptr) {
    if (ptr == 0) return null;
    let u = new Uint8Array(memory.buffer);
    let pos = u.indexOf(0, ptr);
    if (pos < 0) return "";
    let buf = u.slice(ptr, pos);
    return decoder.decode(buf);
}

function setString(ptr, size, text) {
    let buf = encoder.encode(text);
    if (buf.length >= size) {
        throw Error("String does not fit into the buffer");
    }
    let u = new Uint8Array(memory.buffer, ptr, buf.length + 1);
    u.set(buf, 0);
    u[buf.length] = 0;
}

function getStringArray(ptr, length) {
    let arr = getArray(ptr, length);
    if (arr != null)
        arr = arr.map(x => getString(x));
    return arr;
}


async function onMessage(program, args, exitIndication) {

    log(`Executing: ${program} ${args.join(' ')}`);

    let workerPromise = prepareWorker();

    const wasi = new WASI({
        args: args,
        env: {
            'HOME': '/sandbox',
            'TMP': '/tmp',
            'TEMP': '/tmp',
            'PATH': '/bin',
        },
        returnOnExit: true,
        preopens: {
            '/sandbox': fs.realpathSync('./sandbox'),
            '/tmp': fs.realpathSync('./tmp'),
            '/bin': fs.realpathSync('../build/install/bin'),
            '/lib': fs.realpathSync('../wasi-sdk/lib'),
            '/share': fs.realpathSync('../wasi-sdk/share')
        }
    });
    const importObject = {
        wasi_snapshot_preview1: wasi.wasiImport,
        wasiext: { // TODO: rename e.g. nonwasi
            my_realpath: function (filename, resolved, size) {
                filename = getString(filename);
                let result = path.resolve('/sandbox', filename);
                //console.log('my_realpath', filename, '->', result);
                setString(resolved, size, result);
            },
            my_fatal: function (message) {
                console.log('my_fatal', message);
                throw Error(`WASM Process fatal: ${message}`);
            },
            my_exec_name: function (buffer, size) {
                setString(buffer, size, program);
                console.log('my_exec_name');
            },
            my_home_path: function (buffer, size) {
                console.log('my_home_path');
                setString(buffer, size, "/sandbox");
            },
            my_exec: function (program, args, arg_count, envs, env_count, redir) {
                let programStr = getString(program);
                let argsStr = getStringArray(args, arg_count);
                //let envsStr = getStringArray(envs, env_count);
                let redirStr = getStringArray(redir, 3);
                //console.log('my_exec');
                //console.log(programStr);
                //console.log(argsStr);
                //console.log(envsStr);
                //console.log(redirStr);
                if (envs != 0 && env_count > 0) {
                    throw 'Setting environment for child process not implemented';
                }
                if (redirStr[0] !== null || redirStr[1] !== null || redirStr[2] !== null) {
                    throw 'Redirecting stdio for child process not implemented';
                }
                return executeSync(programStr, argsStr);
            },
        }
    };
    let instance = await WebAssembly.instantiate(getModule(program), importObject);
    await workerPromise;
    memory = instance.exports.memory;
    let exitCode = wasi.start(instance);
    log(`Exit code ${exitCode}`);
    if (exitIndication !== null) {
        Atomics.store(exitIndication, 0, exitCode);
        Atomics.notify(exitIndication, 0);
    } else {
        parentPort.postMessage(exitCode);
    }
}

parentPort.on("message", async data => {
    let [program, args, exitIndication] = data;
    onMessage(program, args, exitIndication);
});

async function workerMain() {
    parentPort.postMessage(null);
}

workerMain();

/*
function run(program, args)
{
    return 123;
}

parentPort.on("message", data => {
    let [ program, args, exitIndication ] = data;
    execute.log(`Worker ${workerData.childCount} executing: ${program} ${args.join(' ')}`);
    let exitCode = run(program, args);
    Atomics.store(exitIndication, 0, exitCode);
    Atomics.notify(exitIndication, 0);
});

async function workerMain() {
    await execute.prepare(workerData.childCount);
    parentPort.postMessage({});
}

workerMain();
*/