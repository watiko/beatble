import * as bleno from '@abandonware/bleno';
import * as Debug from 'debug';
import { inputToData, KeyInput, KEY_TYPE } from './keyInput';

import { KeyInputSubject } from './keyInputObserver';
import { KeyInputService } from './keyInputService';

const debug = Debug('beatble');

// init
const keyInputSubject = new KeyInputSubject();
const keyInputService = new KeyInputService(keyInputSubject);

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

let input: KeyInput = {
  diskRotation: 0x11,
  pressed: [KEY_TYPE.B1, KEY_TYPE.E1, KEY_TYPE.B6],
};

const interval = 8; // 1000 / 120
setInterval(() => {
  const data = inputToData(input);
  keyInputSubject.next(data);
}, interval);
