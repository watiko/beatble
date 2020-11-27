import { EventEmitter } from 'events';

export type TearDownLogic = () => void;

export type Observer<T> = {
  subscribe: (subscriber: (data: T) => void) => TearDownLogic;
};

export class Subject<T> implements Observer<T> {
  private emitter = new EventEmitter();

  subscribe(subscriber: (data: T) => void): TearDownLogic {
    this.emitter.on('obs', subscriber);
    return () => {
      this.emitter.removeListener('obs', subscriber);
    };
  }

  next(data: T): void {
    this.emitter.emit('obs', data);
  }
}
