import fs from 'fs';
import { WASI } from 'wasi';

let instance;
let memory;

// ["", "-c", "/sandbox/a.c", "-o", "/sandbox/a.o"]
// ["", "/sandbox/a.c", "-o", "/sandbox/a.o"]

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
    preopens: {
      '/sandbox': fs.realpathSync('.'),
      '/tmp': fs.realpathSync('.')
    }
  });
  const importObject = {
    wasi_snapshot_preview1: wasi.wasiImport,
    my: {
      my_realpath : function(filename, resolved) {
        console.log('my_realpath');
      },
      my_fatal : function(message) {
        console.log('my_fatal');
      },
      my_exec_name : function(buffer, size) {
        setString(buffer, size, "/bin/clang-11");
        console.log('my_exec_name');
      },
      my_home_path : function(buffer, size) {
        console.log('my_home_path');
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
  importObject.wasi_snapshot_preview1.proc_exit = function(exitCode) {
    console.log("Exit ", exitCode);
    throw Error("Application exit");
  }
  console.log("----instantiate---");
  instance = await WebAssembly.instantiate(wasm, importObject);
  memory = instance.exports.memory;
  console.log("----start---");
  wasi.start(instance);
  console.log("----");
}

fs.writeFileSync('in.txt', '');
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
}
