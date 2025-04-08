import { originals } from 'async-context-tc39'

const { setTimeout: orig_setTimeout } = originals;

export const wait = (timeout: number) =>
  new Promise((resolve) => orig_setTimeout(resolve, timeout));
