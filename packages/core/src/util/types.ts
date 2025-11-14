export type KebabCase<T extends string> =
  T extends `${infer First}-${infer Second}`
    ? `${Capitalize<First>}${KebabCase<Second>}`
    : Capitalize<T>;

export type OmitUnion<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export type PartialWithRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

export type MaybePromise<T> = T | Promise<T>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type WithId<T extends { id?: string | undefined | null }> = WithRequired<
  T,
  "id"
>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
