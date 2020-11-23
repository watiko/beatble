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
  pressed: KEY_TYPE[];
};

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
export function inputToData(input: KeyInput): Buffer {
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

  const now = Date.now() & 0xffffff;
  const ee1 = (now & 0xff0000) >> 16;
  const ee2 = (now & 0x00ff00) >> 8;
  const ff = now & 0x0000ff;

  return Buffer.from([
    // 0xAA00BC0D
    disk,
    0x00,
    (b << 4) | c,
    d,
    // 0xEEEE00BC
    ee1,
    ee2,
    0x00,
    (b << 4) | c,
    // 0x0DFF
    d,
    ff,
  ]);
}
