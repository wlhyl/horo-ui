export type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends Function
  ? T
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
