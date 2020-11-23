import { EventEmitter } from 'events';

export type KeyInputObserver = {
  subscribe: (subscriber: (data: Buffer) => void) => void;
};

export class KeyInputSubject implements KeyInputObserver {
  private emitter = new EventEmitter();

  subscribe(subscriber: (data: Buffer) => void) {
    this.emitter.on('keyInput', subscriber);
  }

  next(data: Buffer): void {
    this.emitter.emit('keyInput', data);
  }
}
