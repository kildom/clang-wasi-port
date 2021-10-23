
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as execute from './execute.mjs'

process.stdout.write(`Execution worker ${workerData.childCount} started\n`);

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
