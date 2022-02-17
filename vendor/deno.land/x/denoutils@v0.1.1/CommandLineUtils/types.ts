export type OptionTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
};
export type OptionTypes = keyof OptionTypeMap;
export type NullableOptionTypeMap = {
  [T in OptionTypes]: OptionTypeMap[T] | undefined;
};
export type OptionValueTypes<T extends OptionTypes = OptionTypes> =
  NullableOptionTypeMap[T];

export type Options<T extends OptionTypes> = {
  alias?: string;
  args?: string[];
  name?: string;
  type: T;
};

export type GetValueAtIndexOptions<T = unknown> = {
  defaultValue?: T;
  args?: Array<string>;
};
