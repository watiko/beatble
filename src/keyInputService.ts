import { Characteristic, PrimaryService } from '@abandonware/bleno';
import * as Debug from 'debug';

const debug = Debug('beatble:service');

// layout:
//   0xAA00BC0D
//   0xEEEE00BC
//   0x0DFF
// AA:   disk rotation (clockwise is positive)
// B:    sum of B5(0x1), B6(0x2), B7(0x4)
// C:    sum of B1(0x1), B2(0x2), B3(0x4), B4(0x8)
// D:    sum of E1(0x1), E2(0x2)
// EEEE: increment by 2 (little endian?)
// FF:   increment by 2
class KeyInputCharacteristic extends Characteristic {
  constructor() {
    super({
      uuid: 'FF01',
      properties: ['notify'],
    });
  }

  private timer?: NodeJS.Timeout;

  onSubscribe(
    _maxValueSize: number,
    updateValueCallback: (data: Buffer) => void
  ) {
    debug('keyInput:onSubscribe', _maxValueSize);
    this.timer = setTimeout(() => {
      updateValueCallback(Buffer.from([0xff]));
    }, 1000);
  }

  onUnsubscribe(): void {
    debug('keyInput:onUnsubscribe');
    if (this.timer) {
      clearTimeout(this.timer);
    }
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
  constructor() {
    super({
      uuid: 'FF00',
      characteristics: [
        new KeyInputCharacteristic(),
        new Unknown2Characteristic(),
        new Unknown3Characteristic(),
      ],
    });
  }
}
