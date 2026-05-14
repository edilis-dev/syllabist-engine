/**
 * @fileoverview Provides the {@link Compressor} class, which converts a
 * hierarchical syllable tree into the compact syllabist string format.
 */

import { Symbols } from "./Compressor.constants.js";
import { ReverseLookup } from "./Helpers.js";
import { CreateLogger } from "./Log.js";

/**
 * Compresses a hierarchical syllable data object into a compact syllabist
 * string representation.
 *
 * ### Output format
 * | Token | Meaning |
 * |-------|---------|
 * | `>`   | Concatenator — the key concatenates with the group that follows |
 * | `~`   | Combinator — the key optionally combines with the group that follows |
 * | `[`/`]` | Open/close a group |
 * | `\|`  | Separates sibling syllables within a group |
 *
 * Each top-level key in the input object produces one line of output.
 *
 * ### `null` values
 * Because `typeof null === "object"`, `null` values pass the object guard and
 * are forwarded to `#object()`, which calls `Object.keys(null)` and throws
 * `TypeError: Cannot convert undefined or null to object`. This error is
 * caught, logged, and re-thrown by `compress()`. Callers should ensure the
 * data tree contains no `null` values.
 *
 * @example
 * new Compressor({ a: { bout: "bout" } }).compress();
 * // → "a>[bout]"
 *
 * @example
 * new Compressor({ wa: { ter: { "": "", borne: "borne" } } }).compress();
 * // → "wa>[ter~[borne]]"
 */
export class Compressor {
  /** @type {Record<string, unknown>} */
  #data;

  /** @type {import("@std/log").Logger} */
  #log;

  /**
   * Creates a new {@link Compressor} instance.
   *
   * No validation is performed on `data` at construction time — errors surface
   * when {@link Compressor#compress} is called.
   *
   * @param {Record<string, unknown>} data - A hierarchical object whose keys are syllables and
   *   whose leaf values are strings marking the end of a word. `null` values
   *   anywhere in the tree will cause `compress()` to throw.
   */
  constructor(data) {
    this.#log = CreateLogger({ name: "Compressor" });

    this.#log.info("Constructing");

    this.#data = data;
  }

  /**
   * Compresses the data provided at construction into a multi-line syllabist
   * string.
   *
   * Each top-level key produces one output line. Keys with an `object` value
   * are recursively compressed via `#object()`; keys with a `string` value are
   * emitted directly via `#string()` (only the key itself is written — the
   * leaf value is intentionally ignored). Any other top-level value type
   * (numbers, booleans, etc.) is skipped with a warning, consistent with the
   * behaviour of the private {@link Compressor.#compress} helper.
   *
   * @returns {string} The compressed syllabist representation, with each
   *   top-level entry on its own line.
   * @throws {TypeError} If the data contains a `null` value anywhere in the
   *   tree (`Object.keys(null)` throws `"Cannot convert undefined or null to
   *   object"`).
   *
   * @example
   * new Compressor({
   *   a:  { bout: "bout" },
   *   ac: { com: { plice: "plice" } },
   * }).compress(); // → "a>[bout]\nac>[com>[plice]]"
   */
  compress() {
    this.#log.info("Compressing");

    try {
      let value = [];

      for (const key in this.#data) {
        this.#log.info("Starting iteration", {
          key,
        });

        if (typeof this.#data[key] === "object") {
          value = [...value, this.#object({ key, value: this.#data }).join("")];
        } else if (typeof this.#data[key] === "string") {
          value = [...value, this.#string({ key }).join("")];
        } else {
          this.#log.warn("Identified uncompressable", {
            key,
            type: typeof this.#data[key],
          });
        }

        this.#log.debug("Insert result", {
          key,
          value,
        });
      }

      this.#log.info("Result", {
        value,
      });

      return value.join("\n");
    } catch (error) {
      this.#log.error("Error", {
        reason: error.message,
      });

      throw error;
    }
  }

  /**
   * Recursively compresses a subtree of the data object, pushing tokens onto
   * `stack` as it goes.
   *
   * For each own enumerable key in `value`:
   * - **Object** — delegates to {@link Compressor.#object}, which writes the
   *   key, the relationship symbol, and a bracketed group.
   * - **String** — delegates to {@link Compressor.#string}, which writes the
   *   key.
   * - **Anything else** — logs a warning and skips the key (`continue`).
   *
   * After each non-last key that has at least one sibling, a
   * {@link Symbols.Sibling} (`|`) separator is appended. The empty-string key
   * (`""`) is excluded from sibling counting and never receives a separator —
   * it is a structural combinator marker, not a real syllable.
   *
   * @param {object} options - Options for this compression pass.
   * @param {string[]} [options.stack=[]] - Accumulator array of string tokens.
   *   Mutated in place **and** returned.
   * @param {Record<string, unknown>} options.value - The object whose own enumerable keys are
   *   compressed at this level.
   * @returns {string[]} The same `stack` array extended with new tokens.
   */
  #compress({ stack = [], value }) {
    for (const key in value) {
      this.#log.debug("Starting iteration", {
        key,
      });

      if (typeof value[key] === "object") {
        this.#log.debug("Identified object", {
          key,
          type: "object",
        });
        this.#object({ key, stack, value });
      } else if (typeof value[key] === "string") {
        this.#log.debug("Identified string", {
          key,
          type: "string",
        });
        this.#string({ key, stack });
      } else {
        this.#log.warn("Identified uncompressable", {
          key,
          type: typeof value[key],
        });
        continue;
      }

      if (key && this.#isSibling({ value }) && !this.#isLast({ key, value })) {
        this.#log.debug("Identified sibling not in last place", {
          key,
        });
        stack.push(Symbols.Sibling);
      }
    }

    return stack;
  }

  /**
   * Returns `true` when every own key of `value` is non-empty, indicating a
   * concatenator relationship — the parent syllable must be followed by one of
   * these children.
   *
   * @param {object} options - The object to inspect.
   * @param {Record<string, unknown>} options.value - The child object whose keys are inspected.
   * @returns {boolean} `true` if no key equals the empty string `""`.
   */
  #isConcatenator({ value }) {
    const isConcatenator = Object.keys(value).every((key) => key !== "");
    if (isConcatenator) {
      this.#log.debug("Concatenator", {
        value,
      });
    }
    return isConcatenator;
  }

  /**
   * Returns `true` when at least one own key of `value` is the empty string,
   * indicating a combinator relationship — the parent syllable can stand alone
   * **or** be extended by the sibling keys.
   *
   * @param {object} options - The object to inspect.
   * @param {Record<string, unknown>} options.value - The child object whose keys are inspected.
   * @returns {boolean} `true` if any key equals the empty string `""`.
   */
  #isCombinator({ value }) {
    const isCombinator = Object.keys(value).some((key) => key === "");
    if (isCombinator) {
      this.#log.debug("Combinator", {
        value,
      });
    }
    return isCombinator;
  }

  /**
   * Returns `true` if `key` is the last **non-empty** own key of `value`.
   *
   * The empty-string key (`""`) is excluded from consideration because it is a
   * structural combinator marker rather than a real sibling. This ensures that
   * a trailing `""` key — regardless of where it appears in insertion order —
   * never causes a spurious {@link Symbols.Sibling} separator to be emitted
   * after the last meaningful sibling.
   *
   * @param {object} options - The key–value pair to compare.
   * @param {string} options.key - The key to test.
   * @param {Record<string, unknown>} options.value - The object to test against.
   * @returns {boolean} `true` if `key` is the last non-empty key in
   *   `Object.keys(value)`.
   */
  #isLast({ key, value }) {
    const isLast =
      Object.keys(value)
        .filter((k) => k !== "")
        .at(-1) === key;
    if (isLast) {
      this.#log.debug("Last", {
        value,
      });
    }
    return isLast;
  }

  /**
   * Returns `true` when `value` has more than one non-empty own key, meaning
   * the children are siblings that need a `|` separator between them.
   *
   * The empty-string key (`""`) is excluded from the count because it is a
   * combinator marker, not a real sibling syllable.
   *
   * @param {object} options - The object to inspect.
   * @param {Record<string, unknown>} options.value - The object whose non-empty keys are counted.
   * @returns {boolean} `true` if the number of non-empty keys exceeds `1`.
   */
  #isSibling({ value }) {
    const isSibling = Object.keys(value).filter((key) => key !== "").length > 1;
    if (isSibling) {
      this.#log.debug("Sibling", {
        value,
      });
    }
    return isSibling;
  }

  /**
   * Processes a key whose associated value is a nested object, determining
   * whether it forms a **combinator** (`~`) or **concatenator** (`>`)
   * relationship with its children, then recursively compresses the child
   * group.
   *
   * Tokens are pushed onto `stack` in the pattern:
   * `key`, `relationshipSymbol`, `[`, ...children, `]`
   *
   * > **Note:** Because {@link Compressor.#isCombinator} and
   * > {@link Compressor.#isConcatenator} are logical complements (one uses
   * > `.some`, the other `.every`, on the same predicate), the `else` branch
   * > is structurally unreachable for any valid non-null object. It exists as
   * > a defensive guard and logs a debug message if somehow triggered.
   *
   * @param {object} options - Options for processing this key.
   * @param {string} options.key - The syllable key being processed.
   * @param {string[]} [options.stack=[]] - Accumulator array. Mutated in
   *   place **and** returned.
   * @param {Record<string, unknown>} options.value - The parent object that contains `key`.
   * @returns {string[]} The same `stack` array extended with new tokens.
   */
  #object({ key, stack = [], value }) {
    if (this.#isCombinator({ value: value[key] })) {
      this.#log.debug("Identified relationship", {
        key,
        relationship: ReverseLookup(Symbols, Symbols.Combinator),
      });

      stack.push(key, Symbols.Combinator);
      this.#log.debug("Starting group", {
        key,
      });

      stack.push(Symbols.GroupStart);
      this.#log.debug("Starting compress", {
        key,
      });

      this.#compress({ stack, value: value[key] });
      this.#log.debug("Finished compress", {
        key,
      });

      stack.push(Symbols.GroupEnd);
      this.#log.debug("Finished group", {
        key,
      });
    } else if (this.#isConcatenator({ value: value[key] })) {
      this.#log.debug("Identified relationship", {
        key,
        relationship: ReverseLookup(Symbols, Symbols.Concatenator),
      });

      stack.push(key, Symbols.Concatenator);
      this.#log.debug("Starting group", {
        key,
      });

      stack.push(Symbols.GroupStart);
      this.#log.debug("Starting compress", {
        key,
      });

      this.#compress({ stack, value: value[key] });
      this.#log.debug("Finished compress", {
        key,
      });

      stack.push(Symbols.GroupEnd);
      this.#log.debug("Finished group", {
        key,
      });
    } else {
      this.#log.debug("Failed to identify relationship", {
        key,
      });
    }

    return stack;
  }

  /**
   * Processes a key whose associated value is a plain string (a leaf node),
   * pushing the key onto `stack` as a single token.
   *
   * The string value itself is intentionally ignored — in the syllabist format
   * a leaf value is always identical to its key, so only the key is needed in
   * the output.
   *
   * @param {object} options - Options for processing this key.
   * @param {string} options.key - The syllable key to emit.
   * @param {string[]} [options.stack=[]] - Accumulator array. Mutated in
   *   place **and** returned.
   * @returns {string[]} The same `stack` array with `key` appended.
   */
  #string({ key, stack = [] }) {
    stack.push(key);

    return stack;
  }
}
