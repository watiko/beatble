type AtomicCellOpts<T> = {
  buffer: SharedArrayBuffer;
  decode: (n: number) => T;
  encode: (value: T) => number;
};

export class AtomicCell<T> {
  constructor(private opts: AtomicCellOpts<T>) {}

  store(value: T): void {
    const array = new Uint32Array(this.opts.buffer);
    const n = this.opts.encode(value);
    Atomics.store(array, 0, n);
  }

  load(): T {
    const array = new Uint32Array(this.opts.buffer);
    const n = Atomics.load(array, 0);
    return this.opts.decode(n);
  }
}
