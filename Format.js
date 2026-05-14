/**
 * @fileoverview Provides the {@link Normalise} and {@link Standardise}
 * functions, which normalise raw data strings into consistent formats.
 */

import { Standard } from "./Format.constants.js";

/**
 * Recursively sorts all object keys in a JSON string alphabetically and
 * returns the result as a consistently pretty-printed string.
 *
 * The empty-string key (`""`) is sorted before all other keys at every level
 * of the object hierarchy. This preserves the combinator marker convention
 * used throughout the syllabist data format.
 *
 * > **Note:** The `options` object itself has no outer default, so calling
 * > `Normalise()` with no argument throws a raw destructuring `TypeError`
 * > rather than a more descriptive error.
 *
 * @param {object} options - The key-sort options.
 * @param {string} options.data - The raw JSON string whose keys are to be
 *   sorted. Must be valid JSON.
 * @returns {string} The JSON string with all object keys sorted alphabetically
 *   (empty-string key first at every level) and re-serialised with 2-space
 *   indentation.
 * @throws {SyntaxError} If `data` is not valid JSON (`JSON.parse` throws
 *   before sorting begins).
 *
 * @example
 * Normalise({ data: '{"b":"b","a":"a"}' });
 * // → '{\n  "a": "a",\n  "b": "b"\n}'
 *
 * @example <caption>Empty-string combinator key sorts first</caption>
 * Normalise({ data: '{"b":"b","":"","a":"a"}' });
 * // → '{\n  "": "",\n  "a": "a",\n  "b": "b"\n}'
 */
export function Normalise({ data }) {
  function sort(value) {
    if (typeof value !== "object" || value === null) {
      return value;
    }

    const sorted = {};

    if ("" in value) {
      sorted[""] = sort(value[""]);
    }

    const keys = Object.keys(value)
      .filter((key) => !!key)
      .sort();

    for (const key of keys) {
      sorted[key] = sort(value[key]);
    }

    return sorted;
  }

  return JSON.stringify(sort(JSON.parse(data)), null, 2);
}

/**
 * Normalises a raw data string into a consistently formatted output.
 *
 * Two formats are supported via the `type` option:
 *
 * - **`Standard.JSON`** (default) — parses the string as JSON and
 *   re-serialises it with 2-space indentation, producing a consistently
 *   pretty-printed result regardless of the input's original whitespace.
 * - **`Standard.Text`** — strips leading and trailing whitespace from the
 *   string.
 *
 * > **Note:** The `options` object itself has no outer default, so calling
 * > `Standardise()` with no argument throws a raw destructuring `TypeError`
 * > rather than the documented `"Empty data"` error.
 *
 * > **Note:** Whitespace-only strings (e.g. `"   "`) are truthy and pass the
 * > `data` guard. For `Standard.JSON` they will throw a `SyntaxError` inside
 * > `JSON.parse`; for `Standard.Text` they will return an empty string `""`.
 *
 * @param {object} options - The normalisation options.
 * @param {string} options.data - The raw data string to normalise. Any falsy
 *   value throws. For `Standard.JSON`, must also be valid JSON.
 * @param {string} [options.type="json"] - The target format. Must be one of
 *   the values exported by the {@link Standard} constant object. Defaults to
 *   `Standard.JSON` (`"json"`).
 * @returns {string} The normalised string in the requested format.
 * @throws {TypeError} If `data` is falsy (`"Empty data"`).
 * @throws {TypeError} If `type` is not a recognised {@link Standard} value
 *   (`"Unhandled type <value>"`).
 * @throws {SyntaxError} If `type` is `Standard.JSON` and `data` is not valid
 *   JSON (`JSON.parse` throws before `JSON.stringify` is reached).
 *
 * @example
 * Standardise({ data: '{"a":1}' });
 * // → '{\n  "a": 1\n}'
 *
 * @example <caption>Trimming a text string</caption>
 * Standardise({ data: "  hello  ", type: "text" });
 * // → "hello"
 */
export function Standardise({ data, type = Standard.JSON }) {
  if (!data) {
    throw new TypeError("Empty data");
  }

  switch (type) {
    case Standard.JSON: {
      return JSON.stringify(JSON.parse(data), null, 2);
    }
    case Standard.Text: {
      return data.trim();
    }
    default:
      throw new TypeError(`Unhandled type ${type}`);
  }
}
