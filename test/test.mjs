import fs from 'fs';
import { WASI } from 'wasi';
import path from 'path';

let instance;
let memory;

// ["", "-c", "/sandbox/a.c", "-o", "/sandbox/a.o"]
// ["", "/sandbox/a.c", "-o", "/sandbox/a.o"]
// ["","--sysroot", "/share/wasi-sysroot", "-Oz", "/sandbox/a.c", "-o", "/sandbox/out.wasm"]

console.log("readFileSync");
let code = fs.readFileSync('../build/install/bin/clang-11')
console.log("compile");
const wasm = await WebAssembly.compile(code);
console.log("DONE compilation");

function getArray(ptr, length) {
  if (ptr == 0) return null;
  let u = new Uint32Array(memory.buffer, ptr, length);
  let arr = [];
  for (let i of u) {
    arr.push(i);
  }
  return arr;
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

function getString(ptr) {
  if (ptr == 0) return null;
  let u = new Uint8Array(memory.buffer);
  let pos = u.indexOf(0, ptr);
  if (pos < 0) return "";
  let buf = u.slice(ptr, pos);
  return decoder.decode(buf);
}

function setString(ptr, size, text)
{
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

async function run(args) {

  const wasi = new WASI({
    args: args,
    env: process.env,
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
      my_realpath : function(filename, resolved, size) {
        filename = getString(filename);
        let result = path.resolve('/sandbox', filename);
        console.log('my_realpath', filename, '->', result);
        setString(resolved, size, result);
      },
      my_fatal : function(message) {
        console.log('my_fatal', message);
        throw Error(`WASM Process fatal: ${message}`);
      },
      my_exec_name : function(buffer, size) {
        setString(buffer, size, "/bin/clang-11");
        console.log('my_exec_name');
      },
      my_home_path : function(buffer, size) {
        console.log('my_home_path');
        setString(buffer, size, "/sandbox");
      },
      my_exec : function(program, args, arg_count, envs, env_count, redir) {
        console.log('my_exec');
        console.log(getString(program));
        console.log(getStringArray(args, arg_count));
        console.log(getStringArray(envs, env_count));
        console.log(getStringArray(redir, 3));
      },
    }
  };
  console.log("----instantiate---");
  instance = await WebAssembly.instantiate(wasm, importObject);
  memory = instance.exports.memory;
  console.log("----start---");
  console.log(wasi.start(instance));
  console.log("----");
}

/*fs.writeFileSync('in.txt', '');
while (fs.existsSync('in.txt')) {
  let cnt = fs.readFileSync('in.txt');
  if (cnt.length > 0) {
    fs.writeFileSync('in.txt', '');
    try {
      await run(JSON.parse(cnt));
    } catch (ex) {
      console.log('ex: ', ex);
    }
  } else {
    await new Promise(r => setTimeout(r, 500));
  }
}*/

await run(["","--sysroot", "/share/wasi-sysroot", "-c", "-Oz", "-std=c++14", "/sandbox/hello.cpp", "-o", "/sandbox/hello.wasm"]);
