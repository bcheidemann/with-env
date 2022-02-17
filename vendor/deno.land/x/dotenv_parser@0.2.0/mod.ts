/** Key/Value pairs where the value is always a string */
interface Data {
  [key: string]: string;
}

/** Key/Value pairs where the value can be string, number or boolean */
interface TypedData {
  [key: string]: string | number | boolean;
}

/** Matches key/Value pairs with support for comments and multi-line */
const REGEXP_PAIRS: RegExp =
  /^ *([a-zA-Z_]\w*)\s*=(.*(?:\n(?:[^=#\n]|\\=|\\#)+$)*)/gm;

/** Matches single and double quoted strings */
const REGEXP_QUOTED: RegExp = /^ *(?:("|')([^]*)(\1)) *$/;

/**
 * The dotenv parser.
 * @param raw Raw data to parse
 * @param infer Numbers and booleans will be converted to their respective primitive types when true
 * ```
 * const env = `a="A"\nb=2\nc=true`;
 * 
 * let res = dotEnvParser(env);
 * console.log(res);
 * // -> { a: "A", b: "2", c: "true" }
 * 
 * res = dotEnvParser(env, true);
 * console.log(res);
 * // -> { a: "A", b: 2, c: true }
 * ```
 */
function dotEnvParser<Infer = false>(raw: string): Data;
function dotEnvParser<Infer extends boolean>(
  raw: string,
  infer: Infer,
): Infer extends true ? TypedData : Data;
function dotEnvParser<Infer extends boolean>(
  raw: string,
  infer: unknown = false,
): unknown {
  infer = infer ? true : false;

  /**
   * Parses the raw data and returns an object containing the key/value pairs
   */
  function parse(raw: string): Infer extends true ? TypedData : Data {
    const res: TypedData = {};
    const matches = raw.matchAll(REGEXP_PAIRS);

    for (const [, key, value] of matches) {
      res[key] = parseValue(value);
    }

    return res as Infer extends true ? TypedData : Data;
  }

  /**
   * Unquotes a value and returns it as a string, boolean or number
   * If infer is false, all values are returned as string
   */
  function parseValue(value: string): string | number | boolean {
    const unquoted = unquote(value);
    let val = unquoted ? unquoted : value.trim();

    // Remove backslashes before #, = and quotes
    val = val.replace(/\\#/g, "#");
    val = val.replace(/\\=/g, "=");
    val = val.replace(/\\"/g, '"');
    val = val.replace(/\\'/g, "'");

    if (infer && val !== "" && !Number.isNaN(Number(val))) {
      // If value is a number
      return Number(val);
    } else if (infer && val.toUpperCase() === "FALSE") {
      // If value is false
      return false;
    } else if (infer && val.toUpperCase() === "TRUE") {
      // If value is true
      return true;
    }
    // If value is a string
    return val;
  }

  /**
   * If value is quoted, returns the unquoted value.
   * Returns null otherwise.
   */
  function unquote(value: string): null | string {
    const match = value.match(REGEXP_QUOTED);
    return match === null ? null : match[2];
  }

  return parse(raw);
}

export { dotEnvParser };
