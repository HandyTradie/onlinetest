import { baseURL } from '../api/common';

const ts = timesync.create({
  server: `${baseURL}/timesync`
});

export function getSynchronizedServerTime(): number {
  return ts.now();
}
