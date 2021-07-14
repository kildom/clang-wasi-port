/*=================================================================================*/

const url = 'https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-12/';

const platforms = {
    darwin: 'wasi-sdk-12.0-macos.tar.gz',
    linux: 'wasi-sdk-12.0-linux.tar.gz',
    win32: 'wasi-sdk-12.0-mingw.tar.gz'
};

/*=================================================================================*/

const https = require('https');
const { pipeline } = require('stream');
const zlib = require('zlib');
const tar = require('tar');


if (!(process.platform in platforms))
    throw Error('Platform not supported');

const fullUrl = url + platforms[process.platform];

const untar = tar.x({
    strip: 1,
    C: __dirname + '/../wasi-sdk'
});

function download(url) {
    console.log(`Downloading ${url}`);
    https.get(url, function (res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            console.log(`Redirected to ${res.headers.location}`);
            return download(res.headers.location);
        }
        pipeline(res, zlib.createGunzip(), untar, (err) => {
            if (err) {
                console.error('An error occurred:', err);
                process.exitCode = 1;
            }
        });
    });
}

download(fullUrl);
