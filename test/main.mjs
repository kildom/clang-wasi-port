
import * as fs from 'fs';
import * as path from 'path';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as conf from './conf.mjs'
import { prepareWorker, log, getLog, execute, executeSync, terminateWorker } from './common.mjs'

let moduleByOsPath = {};
let moduleByWasiPath = {};

async function compileModules() {

    for (let ent of fs.readdirSync(conf.binPath, { withFileTypes: true })) {
        let osPath = fs.realpathSync(path.join(conf.binPath, ent.name));
        let wasiPath = `/bin/${ent.name}`;
        if (osPath in moduleByOsPath) {
            console.log(`Linking ${osPath} to ${wasiPath}...`);
            moduleByWasiPath[wasiPath] = moduleByOsPath[osPath];
            continue;
        }
        if (!fs.statSync(osPath).isFile()) continue;
        let file = new Uint8Array(fs.readFileSync(osPath).buffer);
        if (file.length < 8 || file[0] != 0x00 || file[1] != 0x61 || file[2] != 0x73 || file[3] != 0x6D) continue;
        console.log(`Compiling ${osPath} to ${wasiPath}...`);
        let time = Date.now();
        let wasm = await WebAssembly.compile(file);
        time = Date.now() - time;
        console.log(`Done ${Math.round(file.length / 10.24 / 1024) / 100} MB in ${Math.round(time / 100) / 10} sec.`);
        moduleByOsPath[osPath] = wasm;
        moduleByWasiPath[wasiPath] = wasm;
    }

}

async function main() {

    let interval = setInterval(() => {
        let log = getLog();
        if (log !== null) {
            process.stdout.write(log);
        }
    }, 10);

    await compileModules();
    await prepareWorker(moduleByWasiPath);

    let exitCode = await execute('/bin/clang++', ['/bin/clang++', '--sysroot', '/share/wasi-sysroot', '-Oz', '-std=c++14', '/sandbox/hello.cpp', '-o', '/bin/hello.wasm'])

    log(`Compilation exit code ${exitCode}`);

    await compileModules();

    exitCode = await execute('/bin/hello.wasm', ['/bin/hello.wasm']);

    log(`Program exit code ${exitCode}`);

    terminateWorker();

    await new Promise(r => setTimeout(r, 50));

    clearInterval(interval);

    process.exitCode = exitCode;
}

main();

/*process.exit();

async function main2() {
    execute.log('Running from main worker');
    setInterval(() => {
        process.stdout.write(execute.getLog());
    }, 10);
    await execute.prepare(4);
    let code = execute.execute("/bin/clang-11", ["/bin/clang-11", "--sysroot", "/share/wasi-sysroot", "-c", "-Oz", "-std=c++14", "/sandbox/hello.cpp", "-o", "/sandbox/hello.wasm"]);
    execute.log(code + '\n');
    //execute.terminate();
}


if (isMainThread) {
    process.stdout.write('Starting main worker\n');
    let logBuffer = new SharedArrayBuffer(0x100000 + 8);
    new Worker('./main.mjs', { workerData: { logBuffer } });
} else {
    main2();
}

*/