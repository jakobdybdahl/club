type WithStringValues<T> = T extends object
  ? { [Key in keyof T]: WithStringValues<T[Key]> }
  : string | undefined;

export type From<T> = WithStringValues<T>;
