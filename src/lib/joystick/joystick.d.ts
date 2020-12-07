declare module 'joystick' {
  export interface ButtonEvent {
    type: 'button';
    time: number;
    init?: boolean;
    value: number; // 0: OFF, 1: ON
    number: number;
    id: number;
  }
  export interface AxisEvent {
    type: 'axis';
    time: number;
    init?: boolean;
    value: number;
    number: number;
    id: number;
  }

  export = class JoyStick {
    constructor(id: number, deadzone: number, sensitivity: number);

    // { time: 1462160819, value: 0, number: 0, type: 'button', id: 0 }
    on(event: 'button', callback: (event: ButtonEvent) => void): void;
    // { time: 1462184646, value: 0, number: 0, type: 'axis', id: 0 }
    on(event: 'axis', callback: (event: AxisEvent) => void): void;

    removeListener(event: string, callback: (event: any) => void): void;
  };
}
