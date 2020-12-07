import { AtomicCell } from '../AtomicCell';

export const KEY_TYPE = {
  E1: 'E1' as const,
  E2: 'E2' as const,
  B1: 'B1' as const,
  B2: 'B2' as const,
  B3: 'B3' as const,
  B4: 'B4' as const,
  B5: 'B5' as const,
  B6: 'B6' as const,
  B7: 'B7' as const,
};

type valueof<T> = T[keyof T];
export type KEY_TYPE = valueof<typeof KEY_TYPE>;

export type KeyInput = {
  diskRotation: number; // clock wise is positive
  pressed: Set<KEY_TYPE>;
};

export const emptyInput = (): KeyInput => ({
  diskRotation: 0,
  pressed: new Set(),
});

// length: 3
// 0: AA
// 1: BC
// 2: 0D
export type KeyInputArray = Int8Array & { _phantom: 'key_input' };

export class KeyInputArrayAtomicCell extends AtomicCell<KeyInputArray> {
  constructor(buffer: SharedArrayBuffer) {
    super({
      buffer,
      encode: (value: KeyInputArray) =>
        value[0] | (value[1] << 8) | (value[2] << 16),
      decode: (u32: number) => {
        const value = new Uint8Array(3);
        value[0] = u32 & 0xff;
        value[1] = (u32 & 0xff00) >> 8;
        value[2] = (u32 & 0xff0000) >> 16;
        return (value as unknown) as KeyInputArray;
      },
    });
  }
}

// layout:
//   0xAA00BC0DEE
//   0xAA00BC0DFF
// AA:   disk rotation (clockwise is positive)
// B:    sum of B5(0x1), B6(0x2), B7(0x4)
// C:    sum of B1(0x1), B2(0x2), B3(0x4), B4(0x8)
// D:    sum of E1(0x1), E2(0x2)
// EE:   started from 1, incremented by 2
// FF:   started from 2, incremented by 2
export function toPayload(input: KeyInputArray, counter: number): Buffer {
  const array = new Uint8Array(10);

  for (let i = 0; i++; i < 2) {
    const shift = i === 0 ? 0 : 5;
    array[shift + 0] = input[0];
    array[shift + 1] = 0x00;
    array[shift + 2] = input[1];
    array[shift + 3] = input[2];
    array[shift + 4] = counter + i && 0xff;
  }

  return Buffer.from(array);
}

export function inputToData(input: KeyInput): KeyInputArray {
  const disk = input.diskRotation & 0xff;

  let b = 0x00;
  let c = 0x00;
  let d = 0x00;

  for (const key of input.pressed) {
    switch (key) {
      case KEY_TYPE.E1:
        d += 0x1;
        break;
      case KEY_TYPE.E2:
        d += 0x2;
        break;
      case KEY_TYPE.B1:
        c += 0x1;
        break;
      case KEY_TYPE.B2:
        c += 0x2;
        break;
      case KEY_TYPE.B3:
        c += 0x4;
        break;
      case KEY_TYPE.B4:
        c += 0x8;
        break;
      case KEY_TYPE.B5:
        b += 0x1;
        break;
      case KEY_TYPE.B6:
        b += 0x2;
        break;
      case KEY_TYPE.B7:
        b += 0x4;
        break;
      default:
        const _: never = key;
        return _;
    }
  }

  const array = new Uint8Array(3);
  array[0] = disk;
  array[1] = (b << 4) | c;
  array[2] = d;
  return (array as unknown) as KeyInputArray;
}
