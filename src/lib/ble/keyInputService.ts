import { Characteristic, PrimaryService } from '@abandonware/bleno';
import * as Debug from 'debug';
import { KeyInputArray } from '../joystick/keyInput';

import { Observer } from '../Observer';

const debug = Debug('beatble:service');

class KeyInputCharacteristic extends Characteristic {
  private updateFn = (_data: Buffer): void => {};

  constructor(keyInputObserver: Observer<Buffer>) {
    super({
      uuid: 'FF01',
      properties: ['notify'],
    });

    keyInputObserver.subscribe((data: Buffer) => {
      this.updateFn(data);
    });
  }

  onSubscribe(
    _maxValueSize: number,
    updateValueCallback: (data: Buffer) => void
  ) {
    debug('keyInput:onSubscribe', _maxValueSize);
    this.updateFn = updateValueCallback;
  }

  onUnsubscribe(): void {
    debug('keyInput:onUnsubscribe');
    this.updateFn = () => {};
  }
}

class Unknown2Characteristic extends Characteristic {
  constructor() {
    super({
      uuid: 'FF02',
      properties: ['write', 'writeWithoutResponse'],
    });
  }
}

class Unknown3Characteristic extends Characteristic {
  constructor() {
    super({
      uuid: 'FF03',
      properties: ['notify', 'write'],
    });
  }

  onSubscribe(
    _maxValueSize: number,
    updateValueCallback: (data: Buffer) => void
  ) {
    debug('unknown3:onSubscribe', _maxValueSize);
    updateValueCallback(Buffer.from([0x01, 0x05])); // 0x0105 to 0x0101
  }
}

export class KeyInputService extends PrimaryService {
  constructor(keyInputObserver: Observer<Buffer>) {
    super({
      uuid: 'FF00',
      characteristics: [
        new KeyInputCharacteristic(keyInputObserver),
        new Unknown2Characteristic(),
        new Unknown3Characteristic(),
      ],
    });
  }
}
