/**
 * @fileoverview Provides the {@link Expander} class, which converts the
 * compact syllabist string format into a hierarchical syllable tree.
 */

import { Charset, Symbols, Type } from "./Expander.constants.js";
import { ReverseLookup } from "./Helpers.js";
import { CreateLogger } from "./Log.js";

/**
 * Expands a stream of compact syllabist-formatted strings into a single
 * hierarchical syllable tree object.
 *
 * `Expander` is the inverse operation of {@link Compressor}: it consumes the
 * token format that `Compressor` produces and reconstructs the nested object
 * from which that format was derived.
 *
 * ### Input format
 * | Token   | Meaning |
 * |---------|---------|
 * | `>`     | Concatenator — the preceding key concatenates with the group that follows |
 * | `~`     | Combinator — the preceding key optionally combines with the group that follows |
 * | `[`/`]` | Open/close a group |
 * | `\|`    | Separates sibling syllables within a group |
 *
 * Each string in the iterable represents one top-level entry in the output
 * tree. Results from successive lines are merged into a shared accumulator
 * — when a later line shares a key with an earlier one at any depth, the
 * subtrees are combined rather than overwritten.
 *
 * ### Unexpandable characters
 * Any character outside the allowed charset (a-z, `-`, and the five symbols
 * above) is silently skipped with a `warn`-level log rather than throwing.
 * Only the valid characters are incorporated into the tree.
 *
 * @example
 * const iter = { async *[Symbol.asyncIterator]() { yield "a>bout"; } };
 * await new Expander(iter).expand();
 * // → { a: { bout: "bout" } }
 *
 * @example
 * const iter = { async *[Symbol.asyncIterator]() { yield "wa>ter~[borne]"; } };
 * await new Expander(iter).expand();
 * // → { wa: { ter: { "": "", borne: "borne" } } }
 */
export class Expander {
  /** @type {Generator<string>} */
  #forward;

  /** @type {import("@std/log").Logger} */
  #log;

  /** @type {AsyncIterable<string>} */
  #lines;

  /**
   * Creates a new {@link Expander} instance.
   *
   * No validation is performed on `iter` at construction time — errors surface
   * when {@link Expander#expand} is called. In particular, passing `undefined`
   * or any non-iterable value will cause `expand()` to throw a `TypeError`
   * when the `for await` loop attempts to begin iteration.
   *
   * @param {AsyncIterable<string>} iter - An async iterable that yields one
   *   syllabist-formatted string per iteration.
   */
  constructor(iter) {
    this.#log = CreateLogger({ name: "Expander" });

    this.#log.info("Constructing");

    this.#lines = iter;
  }

  /**
   * Expands all lines from the iterable provided at construction into a single
   * merged syllable tree.
   *
   * Each line is parsed character-by-character via {@link Expander#iterator}
   * and {@link Expander.#expand}. The running accumulator is passed into each
   * parse call so that successive lines build directly on the same tree — when
   * lines share a key at any level, existing nodes are preserved and new
   * entries are added alongside them.
   *
   * @returns {Promise<Record<string, unknown>>} A promise that resolves to the hierarchical
   *   syllable tree. Each leaf value is a string equal to its key.
   * @throws {TypeError} If the value provided at construction is not async
   *   iterable.
   * @throws {TypeError} If any line yielded by the iterable is empty or falsy
   *   (`"Empty line"`).
   *
   * @example
   * const iter = {
   *   async *[Symbol.asyncIterator]() {
   *     yield "a>bout";
   *     yield "ac>com>[plice]";
   *   },
   * };
   * await new Expander(iter).expand();
   * // → { a: { bout: "bout" }, ac: { com: { plice: "plice" } } }
   */
  async expand() {
    this.#log.info("Expanding");

    try {
      let value = {};

      for await (const line of this.#lines) {
        this.#log.info("Starting iteration", {
          line,
        });

        this.#forward = this.iterator(line);

        value = {
          ...value,
          ...this.#expand({ value }),
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
   * A generator that yields each character of `line` in order, one at a time.
   *
   * This method is called by {@link Expander#expand} to produce the character
   * stream that the private {@link Expander.#expand} parser consumes via
   * `this.#forward`. Because generator bodies are lazy, the `TypeError` for an
   * empty `line` is not raised when this method is called — it is raised on the
   * first `.next()` invocation, which happens at the start of parsing.
   *
   * @param {string} line - The syllabist-formatted string to iterate character
   *   by character.
   * @returns {Generator<string>} A generator that yields each character of
   *   `line` sequentially.
   * @throws {TypeError} If `line` is empty or falsy (`"Empty line"`).
   *
   * @example
   * [...new Expander(null).iterator("a>b")];
   * // → ["a", ">", "b"]
   */
  *iterator(line) {
    let counter = 0;

    if (!line) {
      throw new TypeError("Empty line");
    }

    this.#log.debug("Starting iterator", {
      line,
    });

    while (counter < line.length) {
      this.#log.debug("Iteration", {
        index: counter,
      });

      yield line[counter++];
    }
  }

  /**
   * Recursively parses the current position in the `#forward` character stream,
   * building the syllable tree as it goes.
   *
   * On each call, one character is consumed from `#forward`. Alphabetical
   * characters and hyphens accumulate into `key`; recognised symbol characters
   * dispatch to one of five branches that call {@link Expander.#insert} and
   * recurse with an updated `stack` or `value`. Characters outside the allowed
   * charset are skipped with a warning and the method recurses unchanged.
   * Recursion bottoms out when `#forward` is exhausted (`done === true`), at
   * which point any pending `key` is inserted and `value` is returned.
   *
   * > **Note:** When a `[` (`GroupStart`) is encountered the accumulated `key`
   * > is forwarded unchanged into the recursive call rather than being cleared.
   * > In well-formed syllabist input, `[` always immediately follows `>` or
   * > `~`, both of which insert and reset `key` before `[` is reached, so
   * > `key` is always `""` at that point. Malformed strings that place `[`
   * > directly after a literal character sequence will produce unexpected output.
   *
   * @param {object} [options={}] - Parsing state passed between recursive calls.
   * @param {string} [options.key=""] - Characters accumulated so far for the
   *   syllable currently being parsed.
   * @param {string[]} [options.stack=[]] - Ancestry stack of open keys; tracks
   *   the current nesting depth in the output tree.
   * @param {Record<string, unknown>} [options.value={}] - The partial syllable tree assembled so
   *   far. Mutated in place by {@link Expander.#insert} and returned on
   *   completion.
   * @returns {Record<string, unknown>} The fully assembled syllable tree after all characters in
   *   `#forward` have been consumed.
   */
  #expand({ key = "", stack = [], value = {} } = {}) {
    const { value: char, done } = this.#forward.next();

    if (done) {
      this.#log.debug("Iterator exhausted", {
        key: key || null,
      });

      if (key) {
        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        return newValue;
      }

      return value;
    }

    if (!Charset.test(char)) {
      this.#log.warn("Unexpandable character", {
        char,
      });

      return this.#expand({
        key,
        stack,
        value,
      });
    }

    switch (char) {
      case Symbols.Combinator: {
        this.#log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbols, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Empty,
          value,
        });

        const newStack = stack.concat(key);

        this.#log.debug("Pushed key onto stack", {
          key,
          stack: newStack,
        });

        return this.#expand({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbols.Concatenator: {
        this.#log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbols, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Group,
          value,
        });

        const newStack = stack.concat(key);

        this.#log.debug("Pushed key onto stack", {
          key,
          stack: newStack,
        });

        return this.#expand({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbols.GroupEnd: {
        this.#log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbols, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        const newStack = stack.slice(0, -1);

        this.#log.debug("Popped from stack", {
          key,
          stack: newStack,
        });

        return this.#expand({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbols.GroupStart: {
        this.#log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbols, char),
        });

        return this.#expand({
          key,
          stack,
          value,
        });
      }
      case Symbols.Sibling: {
        this.#log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbols, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        return this.#expand({
          stack,
          value: newValue,
        });
      }
      default: {
        this.#log.debug("Identified alphabetical character", {
          char,
        });

        return this.#expand({
          key: `${key}${char}`,
          stack,
          value,
        });
      }
    }
  }

  /**
   * Inserts `key` into the syllable tree `value` at the location described by
   * `stack`, writing a node shape determined by `type`.
   *
   * If `key` is falsy, the method returns `value` immediately without making
   * any change — this handles the empty-string combinator marker, which is
   * stored directly by the caller rather than via this method.
   *
   * `stack` is used as a sequence of successive property lookups starting from
   * `value` to locate the insertion point (`target`). If the path described by
   * `stack` does not exist in `value`, `target` is `undefined`, a warning is
   * logged, and `value` is returned unchanged to prevent a crash.
   *
   * The three node shapes are:
   * - `Type.Empty` (`"empty"`) — adds the `""` combinator marker to the key's
   *   node, marking it as a word that can stand alone or combine with sibling
   *   syllables. Any existing children are preserved by spreading them into the
   *   new node; if the key is absent a fresh `{ "": "" }` is created.
   * - `Type.Group` (`"group"`) — opens a new empty group `{}` when the key is
   *   absent. If the key already points to an existing subtree that subtree is
   *   preserved unchanged.
   * - `Type.Value` (`"value"`) — inserts the key string itself as a leaf node.
   *
   * `value` is mutated in place and the same reference is returned.
   *
   * @param {object} options - Insertion options. All properties are required.
   * @param {string} options.key - The syllable key to insert. If falsy, the
   *   method returns immediately without modifying `value`.
   * @param {string[]} options.stack - Path of ancestor keys used to navigate
   *   to the insertion point within `value`.
   * @param {string} options.type - Controls the shape of the inserted node.
   *   One of `Type.Empty` (`"empty"`), `Type.Group` (`"group"`), or
   *   `Type.Value` (`"value"`).
   * @param {Record<string, unknown>} options.value - The syllable tree to mutate. The same
   *   object reference is returned after the insertion.
   * @returns {Record<string, unknown>} The same `value` object after the insertion has been
   *   applied.
   */
  #insert({ key, stack, type, value }) {
    if (!key) {
      this.#log.debug("Inserting without key", {
        type: type.toUpperCase(),
        value,
      });

      return value;
    } else {
      this.#log.debug("Inserting with key", {
        type: type.toUpperCase(),
        value,
      });
    }

    const target = stack.reduce((previousValue, currentValue) => previousValue[currentValue], value);

    if (target) {
      this.#log.debug("Stack entry found");
    } else {
      this.#log.warn("No stack entry found");

      return value;
    }

    switch (type) {
      case Type.Empty:
        target[key] = target[key] ? { "": "", ...target[key] } : { "": "" };
        this.#log.debug("Insert result", {
          value,
        });
        return value;
      case Type.Group:
        target[key] = target[key] ?? {};
        this.#log.debug("Insert result", {
          value,
        });
        return value;
      case Type.Value:
        target[key] = key;
        this.#log.debug("Insert result", {
          value,
        });
        return value;
      default:
        this.#log.warn("Insert result unexpectedly unchanged", {
          value,
        });
        return value;
    }
  }
}
