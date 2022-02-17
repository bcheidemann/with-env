import {
  GetValueAtIndexOptions,
  NullableOptionTypeMap,
  Options,
  OptionTypeMap,
  OptionTypes,
} from "../types.ts";
import { InvalidOptionTypeError } from "./errors.ts";

function nextArgIndex(argIndex: number) {
  return argIndex === -1 ? -1 : argIndex + 1;
}

function mapValueToType<T extends OptionTypes>(
  value: string | NullableOptionTypeMap[T],
  type: T,
): NullableOptionTypeMap[T] {
  switch (type) {
    case "string":
      if (typeof value === "string") return value as NullableOptionTypeMap[T];
      return value;
    case "number":
      if (typeof value === "string") {
        return new Number(value).valueOf() as NullableOptionTypeMap[T];
      }
      return value;
    case "boolean":
      if (typeof value === "string") {
        return (value.toLowerCase() === "true") as NullableOptionTypeMap[T];
      }
      return value;
    default:
      throw new InvalidOptionTypeError(type);
  }
}

function getValueAtIndex<T = undefined>(
  argIndex: number,
  { defaultValue, args = Deno.args }: GetValueAtIndexOptions<T> = {},
): string | undefined | T {
  if (argIndex === -1 || typeof args[argIndex] === "undefined") {
    return defaultValue;
  }
  return args[argIndex];
}

function handleGetOptionValueS(
  argIndex: number,
  args: Array<string>,
): NullableOptionTypeMap["string"] {
  return getValueAtIndex(nextArgIndex(argIndex), {
    args,
  });
}

function handleGetOptionValueN(
  argIndex: number,
  args: Array<string>,
): NullableOptionTypeMap["number"] {
  const value = getValueAtIndex(nextArgIndex(argIndex), {
    args,
  });
  return mapValueToType(value, "number");
}

function handleGetOptionValueB(
  argIndex: number,
): NullableOptionTypeMap["boolean"] {
  return argIndex !== -1;
}

function handleGetOptionValue<T extends OptionTypes>(
  argIndex: number,
  type: T,
  args: string[],
): OptionTypeMap[T] {
  switch (type) {
    case "string":
      return handleGetOptionValueS(argIndex, args) as OptionTypeMap[T];
    case "number":
      return handleGetOptionValueN(argIndex, args) as OptionTypeMap[T];
    case "boolean":
      return handleGetOptionValueB(argIndex) as OptionTypeMap[T];
    default:
      throw new InvalidOptionTypeError(type);
  }
}

export function getOption<T extends OptionTypes>({
  alias,
  args = Deno.args,
  name,
  type,
}: Options<T>): NullableOptionTypeMap[T] | Array<OptionTypeMap[T]> {
  const argAlias = alias && `-${alias}`,
    argAliasEquals = alias && `${argAlias}=`,
    argName = name && `--${name}`,
    argNameEquals = name && `${argName}=`;
  const results = new Array<OptionTypeMap[T]>();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === argAlias || arg === argName) {
      results.push(handleGetOptionValue(i, type, args));
    } else if (argAliasEquals && arg.startsWith(argAliasEquals)) {
      const value = arg.substring(argAliasEquals.length);
      results.push(mapValueToType(value, type) as OptionTypeMap[T]);
    } else if (argNameEquals && arg.startsWith(argNameEquals)) {
      const value = arg.substring(argNameEquals.length);
      results.push(mapValueToType(value, type) as OptionTypeMap[T]);
    }
  }
  if (results.length === 0) {
    return handleGetOptionValue(-1, type, args);
  }
  if (results.length === 1) {
    return results[0];
  }
  return results;
}
