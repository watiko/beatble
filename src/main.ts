import * as Debug from 'debug';
import { Worker } from 'worker_threads';

const debug = Debug('beatble:main');

debug('starting beatble...');

const keyInputSharedBuffer = new SharedArrayBuffer(4);
debug('Atomics.isLockFree(4)', Atomics.isLockFree(4));

const inputWorker = new Worker('./worker/input.js', {
  workerData: { keyInputSharedBuffer },
});
const bleWorker = new Worker('./worker/ble.js', {
  workerData: { keyInputSharedBuffer },
});

type WorkerExit = {
  exitCode: number;
  worker: string;
};

const exitWrapper = (name: string, resolve: (v: WorkerExit) => void) => (
  exitCode: number
): void =>
  resolve({
    exitCode,
    worker: name,
  });

Promise.race<Promise<WorkerExit>>([
  new Promise((r) => inputWorker.on('exit', exitWrapper('input', r))),
  new Promise((r) => bleWorker.on('exit', exitWrapper('ble', r))),
]).then((exit) => {
  console.log('exit worker thread: ', exit);
});
