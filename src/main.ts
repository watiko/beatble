import * as bleno from '@abandonware/bleno';
import * as Debug from 'debug';
import { inputToData, KeyInput, KEY_TYPE } from './keyInput';

import { KeyInputSubject } from './keyInputObserver';
import { KeyInputService } from './keyInputService';

const debug = Debug('beatble');

// init
const keyInputSubject = new KeyInputSubject();
const keyInputService = new KeyInputService(keyInputSubject);

const beacon = {
  uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
  major: 10052,
  minor: 35817,
  measuredPower: -59,
};

bleno.on('stateChange', (state) => {
  debug('stateChange', state);

  if (state === 'poweredOn') {
    bleno.startAdvertisingIBeacon(
      beacon.uuid,
      beacon.major,
      beacon.minor,
      beacon.measuredPower
    );
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
