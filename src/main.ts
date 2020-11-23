import * as bleno from '@abandonware/bleno';
import * as Debug from 'debug';

import { KeyInputService } from './keyInputService';

const debug = Debug('beatble');
const keyInputService = new KeyInputService();

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
