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
