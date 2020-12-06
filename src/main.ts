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

// prettier-ignore
const adv = Buffer.from([
  // len: 2, type: 0x1
  2,    0x01,
  0x06,
  // len: 26, type: 0xFF
  26, 0xFF,
  0x4C, 0x00, 0x02, 0x15, 0xFD,
  0xA5, 0x06, 0x93, 0xA4, 0xE2,
  0x4F, 0xB1, 0xAF, 0xCF, 0xC6,
  0xEB, 0x07, 0x64, 0x78, 0x25,
  0x27, 0x44, 0x8B, 0xE9, 0xC5,
]);

// prettier-ignore
const scan = Buffer.from([
  // len: 3, type: 0x3
  3,    0x03,
  0x00, 0xFF,
  // len: 17, type: 0x09
  17, 0x09,
  0x49, 0x49, 0x44, 0x58, 0x20,
  0x45, 0x6E, 0x74, 0x72, 0x79,
  0x20, 0x6D, 0x6F, 0x64, 0x65,
  0x6C,
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
