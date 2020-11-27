import * as bleno from '@abandonware/bleno';
import * as Debug from 'debug';
import { emptyInput, inputToData } from './joystick/keyInput';

import { Subject } from './lib/Observer';
import { KeyInputService } from './keyInputService';
import { EntryModelObserver } from './joystick/entrymodel';

const debug = Debug('beatble');

// init
const keyInputSubject = new Subject<Buffer>();
const keyInputService = new KeyInputService(keyInputSubject);
const entryModelObserver = new EntryModelObserver();

const adv = Buffer.from([
  2,
  1,
  6,
  26,
  255,
  76,
  0,
  2,
  21,
  253,
  165,
  6,
  147,
  164,
  226,
  79,
  177,
  175,
  207,
  198,
  235,
  7,
  100,
  120,
  37,
  39,
  68,
  139,
  233,
  197,
]);
const scan = Buffer.from([
  3,
  3,
  0,
  255,
  17,
  9,
  73,
  73,
  68,
  88,
  32,
  69,
  110,
  116,
  114,
  121,
  32,
  109,
  111,
  100,
  101,
  108,
]);

bleno.on('stateChange', (state) => {
  debug('stateChange', state);

  if (state === 'poweredOn') {
    bleno.startAdvertisingWithEIRData(adv, scan);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', (error) => {
  debug('advertisingStart', !error ? 'ok' : error);

  if (!error) {
    bleno.setServices([keyInputService], (error) => {
      debug('setServices', !error ? 'ok' : error);
    });
  }
});

// input loop

let input = emptyInput();

entryModelObserver.subscribe((newInput) => {
  input = newInput;
});

const interval = 8; // 1000 / 120
setInterval(() => {
  const data = inputToData(input);
  keyInputSubject.next(data);
}, interval);
