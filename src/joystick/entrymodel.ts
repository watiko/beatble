import JoyStick = require('joystick');
import type { ButtonEvent, AxisEvent } from 'joystick';
import { Observer } from '../lib/Observer';
import { emptyInput, KeyInput, KEY_TYPE } from './keyInput';

function buttonNumberToKey(n: number): KEY_TYPE {
  switch (n) {
    case 0:
      return KEY_TYPE.B1;
    case 1:
      return KEY_TYPE.B2;
    case 2:
      return KEY_TYPE.B3;
    case 3:
      return KEY_TYPE.B4;
    case 4:
      return KEY_TYPE.B5;
    case 5:
      return KEY_TYPE.B6;
    case 6:
      return KEY_TYPE.B7;
    case 8:
      return KEY_TYPE.E1;
    case 9:
      return KEY_TYPE.E2;
    default:
      throw new Error(`Unknown key code(${n}) detected from entry model`);
  }
}

function reduce(state: KeyInput, event: ButtonEvent | AxisEvent): KeyInput {
  if (event.init) {
    return state;
  }

  switch (event.type) {
    case 'axis':
      return {
        ...state,
        diskRotation: event.value >> 8,
      };
    case 'button':
      if (event.number === 10 || event.number === 11) {
        return state;
      }
      const keyType = buttonNumberToKey(event.number);
      const buttonIsOn = event.value === 1;
      if (buttonIsOn) {
        state.pressed.add(keyType);
      } else {
        // mutate
        state.pressed.delete(keyType);
      }
      return state;
    default:
      const _: never = event;
      return _;
  }
}

export class EntryModelObserver implements Observer<KeyInput> {
  private joystick = new JoyStick(0, 0, 0);
  private state = emptyInput();

  subscribe(subscriber: (data: KeyInput) => void): () => void {
    const _reduce = (ev: ButtonEvent | AxisEvent) => {
      this.state = reduce(this.state, ev);
      subscriber(this.state);
    };
    this.joystick.on('axis', _reduce);
    this.joystick.on('button', _reduce);

    return () => {
      this.joystick.removeListener('axis', _reduce);
      this.joystick.removeListener('button', _reduce);
    };
  }
}
