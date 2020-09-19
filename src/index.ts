export type Head<T extends unknown[]> = T extends [infer E1, ...infer E2]
  ? E1
  : never;
