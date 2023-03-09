/* eslint-disable no-var */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-datetime-picker/dist/entry.nostyle';
declare module 'timesync' {
  type TimeSync = {
    destroy();
    now(): number;
    on(event: 'change', callback: (offset: number) => void);
    on(event: 'error', callback: (err: any) => void);
    on(event: 'sync', callback: (value: 'start' | 'end') => void);
    off(event: 'change' | 'error' | 'sync', callback?: () => void);
    sync();

    send(to: string, data: object, timeout: number): Promise<void>;
    receive(from: string, data: object);
  };

  type TimeSyncCreateOptions = {
    interval?: number;
    timeout?: number;
    delay?: number;
    repeat?: number;
    peers?: string | string[];
    server?: string;
    now?: () => number;
  };

  function create(options: TimeSyncCreateOptions): TimeSync;
}
declare var timesync: {
  create(options: TimeSyncCreateOptions): TimeSync;
};

type TimeSync = {
  destroy();
  now(): number;
  on(event: 'change', callback: (offset: number) => void);
  on(event: 'error', callback: (err: any) => void);
  on(event: 'sync', callback: (value: 'start' | 'end') => void);
  off(event: 'change' | 'error' | 'sync', callback?: () => void);
  sync();

  send(to: string, data: object, timeout: number): Promise<void>;
  receive(from: string, data: object);
};

type TimeSyncCreateOptions = {
  interval?: number;
  timeout?: number;
  delay?: number;
  repeat?: number;
  peers?: string | string[];
  server?: string;
  now?: () => number;
};
