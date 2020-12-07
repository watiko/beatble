import { workerData } from 'worker_threads';
import * as Debug from 'debug';

import { EntryModelObserver } from '../lib/joystick/entrymodel';
import { inputToData, KeyInputArrayAtomicCell } from '../lib/joystick/keyInput';

const debug = Debug('beatble:worker:input');
const keyInputSharedBuffer = workerData.keyInputSharedBuffer as SharedArrayBuffer;

function run() {
  debug('input worker started');
  const entryModelObserver = new EntryModelObserver();
  const keyInput = new KeyInputArrayAtomicCell(keyInputSharedBuffer);

  entryModelObserver.subscribe((newInput) => {
    const array = inputToData(newInput);
    keyInput.store(array);
  });
}

run();
