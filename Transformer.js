/**
 * @fileoverview Provides the {@link Transformer} class, which converts a
 * stream of syllabified lines into a hierarchical syllable tree object.
 */

import { CreateLogger } from "./Log.js";

/**
 * Transforms a stream of `;`-delimited syllabified lines into the nested
 * syllable tree object expected by {@link Compressor}.
 *
 * Each input line represents one word whose syllables are joined by a
 * separator character (default `;`). The class recursively merges every line
 * into a single accumulator, building the combinator and concatenator
 * relationships required by the syllabist format as it goes.
 *
 * ### Shared logger caveat
 * `Log.js` currently hardcodes `class: "Separator"` in its JSON formatter, so
 * every log line emitted by this class will appear labelled as `"Separator"` in
 * structured log output.
 *
 * @example
 * const iter = { async *[Symbol.asyncIterator]() { yield "a;back"; } };
 * await new Transformer(iter).transform();
 * // → { a: { back: "back" } }
 *
 * @example
 * const iter = { async *[Symbol.asyncIterator]() { yield "a;ban;don"; yield "a;ban;don;ment"; } };
 * await new Transformer(iter).transform();
 * // → { a: { ban: { don: { "": "", ment: "ment" } } } }
 */
export class Transformer {
  /** @type {AsyncIterable<string>} */
  #lines;

  /** @type {import("@std/log").Logger} */
  #log;

  /**
   * Creates a new {@link Transformer} instance.
   *
   * No validation is performed on `iter` at construction time — errors surface
   * when {@link Transformer#transform} is called. In particular, passing
   * `undefined` or any non-iterable value will cause `transform()` to throw a
   * `TypeError` when the `for await` loop attempts to begin iteration.
   *
   * @param {AsyncIterable<string>} iter - An async iterable that yields one
   *   syllabified line per iteration.
   */
  constructor(iter) {
    this.#log = CreateLogger({ name: "Transformer" });

    this.#log.info("Constructing");

    this.#lines = iter;
  }

  /**
   * Transforms all lines from the iterable provided at construction into a
   * single merged syllable tree.
   *
   * Each line is split on `separator` to produce an ordered list of syllable
   * keys. That list is then recursively merged into the running accumulator
   * via {@link Transformer.#insert}. Lines that produce only a single key
   * (i.e. contain no separator) are logged as a warning but are still
   * inserted as top-level leaf nodes.
   *
   * @param {string} [separator=";"] - The character used to delimit syllables
   *   within each input line.
   * @returns {Promise<Record<string, unknown>>} A promise that resolves to the hierarchical
   *   syllable tree. Each leaf value is a string equal to its key.
   * @throws {TypeError} If the value provided at construction is not async
   *   iterable.
   *
   * @example
   * const iter = {
   *   async *[Symbol.asyncIterator]() {
   *     yield "a;ban;don";
   *     yield "a;ban;don;ed";
   *   },
   * };
   * await new Transformer(iter).transform();
   * // → { a: { ban: { don: { "": "", ed: "ed" } } } }
   */
  async transform(separator = ";") {
    this.#log.info("Transforming", {
      separator,
    });

    try {
      let value = {};

      for await (const line of this.#lines) {
        this.#log.info("Starting iteration", {
          line,
        });

        const keys = line.split(separator);

        if (keys.length > 1) {
          this.#log.debug("Line has parts", { parts: keys.length });
        } else if (keys.length === 1) {
          this.#log.warn("Line has too few parts", {
            line,
            parts: keys.length,
          });
        }

        value = {
          ...value,
          ...this.#insert({
            key: keys.at(0),
            keys: keys.splice(1),
            value,
          }),
        };

        this.#log.debug("Insert result", {
          value,
        });
      }

      this.#log.info("Result", {
        value,
      });

      return value;
    } catch (error) {
      this.#log.error("Error", {
        reason: error.message,
      });

      throw error;
    }
  }

  /**
   * Recursively inserts a syllable path into the accumulator tree.
   *
   * On each call the method inspects `value[key]` and takes one of four
   * branches:
   *
   * 1. **`key` is empty** — base case: the path is exhausted; `value` is
   *    returned unchanged.
   * 2. **`value[key]` is an object** — the key already points to an interior
   *    node; recurse one level deeper using the next key from `keys`.
   * 3. **`value[key]` is a string** — the key currently points to a leaf (a
   *    shorter word ends here). Two sub-cases apply:
   *    - **`keys` is empty** — the word being inserted is identical to the
   *      existing leaf (an exact duplicate); `value` is returned unchanged and
   *      the existing word is preserved.
   *    - **`keys` is non-empty** — a longer word passes through this node. The
   *      leaf is promoted to a bare combinator `{ "": "" }`, making the
   *      shorter word optional, and `#insert` recurses with the same `key` and
   *      remaining `keys` so branch 2 can build the longer word's path.
   * 4. **`value[key]` is absent** — a new node is created: an empty object
   *    `{}` when more keys follow, or a leaf string `key` when the path is
   *    complete. The same key is then passed back through `#insert` so the
   *    freshly created node is processed by branch 2 or 3 on the next call.
   *
   * > **Note:** In branch 3 when `keys` is non-empty, the existing leaf is
   * > promoted to a bare combinator node `{ "": "" }` and the method
   * > re-enters with the same `key` and full remaining `keys`. The object
   * > branch then handles inserting the remaining path at any depth. When
   * > `keys` is empty the word already exists and `value` is returned
   * > unchanged. No words are lost in either case.
   *
   * > **Note:** In branch 2, when `keys` is empty (i.e. a shorter word
   * > arrives after a longer one has already created the interior node), the
   * > `""` combinator marker is written directly into the existing node
   * > before returning, correctly marking the shorter word as a valid
   * > terminus regardless of input order.
   *
   * @param {object} options - Insertion options. All properties are required.
   * @param {string} options.key - The syllable key currently being inserted.
   *   Defaults to `""` (base case) when the caller passes no value.
   * @param {string[]} options.keys - The remaining syllable keys after `key`.
   * @param {Record<string, unknown>} options.value - The accumulator subtree at the current
   *   level of the hierarchy.
   * @returns {Record<string, unknown>} The updated accumulator subtree with the new syllable
   *   path merged in.
   */
  #insert({ key = "", keys, value }) {
    if (!key) {
      this.#log.debug("Exhausted keys list");

      return value;
    } else if (typeof value[key] === "object") {
      this.#log.debug("Entering existing key", {
        key,
        value,
      });

      if (!keys.length) {
        this.#log.debug("Adding combinator marker to existing node", {
          key,
        });

        return {
          ...value,
          [key]: {
            ...value[key],
            "": "",
          },
        };
      }

      return {
        ...value,
        [key]: this.#insert({
          key: keys.at(0),
          keys: keys.splice(1),
          value: value[key],
        }),
      };
    } else if (typeof value[key] === "string") {
      this.#log.debug("Found sibling", {
        key,
        value,
      });

      if (!keys.length) {
        return value;
      }

      return this.#insert({
        key,
        keys,
        value: {
          ...value,
          [key]: { "": "" },
        },
      });
    } else {
      this.#log.debug("Inserting key", {
        key,
        value,
      });

      return this.#insert({
        key,
        keys,
        value: {
          ...value,
          [key]: keys.length ? {} : key,
        },
      });
    }
  }
}
