/* eslint-disable @typescript-eslint/ban-types */
type Writeable<T> = { -readonly [P in keyof T]-?: T[P] };

type prettify<T> = {
  [K in keyof T]: T[K];
} & {};
