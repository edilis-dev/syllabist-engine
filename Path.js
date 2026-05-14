/**
 * @fileoverview Provides the {@link Path} class for validating and
 * traversing paths through a syllable tree.
 */

import { CreateLogger } from "./Log.js";

/**
 * Wraps a syllable tree and exposes methods for checking whether a sequence
 * of syllable keys forms a valid path through the tree and for generating
 * syllable suggestions.
 *
 * @example
 * const path = new Path({ a: { back: "back", ban: { don: "don" } } });
 * path.traverse(["a", "back"]);          // → true
 * path.traverse(["a", "ban", "don"]);    // → true
 * path.traverse(["a", "front"]);         // → false
 */
export class Path {
  /** @type {import("@std/log").Logger} */
  #log;

  /** @type {Record<string, unknown>} */
  #tree;

  /**
   * Creates a new {@link Path} instance.
   *
   * No validation is performed on `tree` at construction time — errors
   * surface when {@link Path#traverse} is called.
   *
   * @param {Record<string, unknown>} tree - The syllable tree to traverse.
   */
  constructor(tree) {
    this.#log = CreateLogger({ name: "path" });

    this.#log.info("Constructing");

    this.#tree = tree;
  }

  /**
   * Returns up to `maximum` values randomly selected from the syllable
   * subtree reached by traversing `path` through the tree.
   *
   * `path` is walked key-by-key to navigate to the target subtree. If the
   * reached node is not an object (e.g. a leaf string value), an empty
   * array is returned immediately. Otherwise, falsy keys are filtered out
   * of the subtree's entries — excluding the empty-string combinator
   * marker `""` — leaving only valid syllable keys. The effective count
   * is clamped to the number of those filtered keys via
   * `Math.min(maximum, filtered.length)`, so the returned array never
   * contains more entries than there are valid syllable keys in the
   * subtree. A set of unique random indices is obtained from
   * {@link Path.#getRandomValues} and used to pick entries from the
   * filtered keys array.
   *
   * > **Note:** When `path` is empty suggestions are disabled — the
   * > method logs the configuration and returns an empty array without
   * > accessing the tree.
   *
   * @param {string[]} path - The ordered sequence of syllable keys that
   *   identifies the subtree to draw suggestions from. Pass an empty
   *   array to disable suggestion generation.
   * @param {object} options - The suggestion options.
   * @param {number} [options.maximum=1] - The upper bound on the number
   *   of suggestions to return. The actual count is capped at the number
   *   of non-falsy keys in the reached subtree, so fewer values may be
   *   returned.
   * @param {number} [options.minimum=0] - Currently used for logging only;
   *   does not affect the range of generated values.
   * @returns {string[]} An array of up to `maximum` syllable keys from
   *   the subtree, or an empty array if `path` is empty or leads to a
   *   non-object node.
   * @throws {TypeError} If traversal reaches a `null` value — since
   *   `typeof null === "object"` the non-object guard is bypassed and
   *   `Object.entries(null)` throws.
   * @throws {DOMException} If the clamped count exceeds `16384`,
   *   propagated from {@link Path.#getRandomValues}.
   *
   * @example
   * const path = new Path({ a: { back: "back", ban: "ban" } });
   * path.suggestions(["a"], { maximum: 1 });
   * // → ["back"] or ["ban"]
   *
   * @example <caption>Empty path — suggestions disabled</caption>
   * path.suggestions([], { maximum: 5 });
   * // → []
   */
  suggestions(path, { maximum: max = 1, minimum: min = 1 } = {}) {
    const maximum = Math.max(max, min);
    const minimum = Math.max(max, min);

    if (!path.length) {
      this.#log.info("Suggestions disabled", { maximum, minimum, path, });

      return [];
    } else {
      this.#log.info("Creating suggestions", { maximum, minimum, path, });

      let suggestionTree = this.#tree;

      for (const node of path) {
        this.#log.debug("Traversing current tree level with node", { node });

        suggestionTree = suggestionTree[node];
        this.#log.debug("Created new suggestion tree", { tree: suggestionTree });
      }

      if (typeof suggestionTree === "string") {
        this.#log.debug("Suggestion tree is not an object", { suggestionTree });

        return [];
      }

      const keys = Object.entries(suggestionTree)
        .filter(([key]) => !!key)
        .map(([key]) => key);
      this.#log.debug("Filtered suggestion tree", { tree: keys });

      const count = Math.min(maximum, keys.length);
      const values = this.#getRandomValues({ count, maximum, minimum });

      this.#log.debug("Retrieving syllable values from indexes", { indexes: Array.from(values) });
      return [...values].map((index) => keys[index]);
    }
  }

  /**
   * Checks whether a sequence of syllable keys forms a valid path through
   * the tree.
   *
   * Each element of `path` is tested as a key at the current level of the
   * tree. Traversal advances one level for each matching key; if any key
   * is absent the method returns `false` immediately without examining the
   * remaining elements.
   *
   * > **Note:** An empty `path` always returns `true` — the root of the
   * > tree requires no traversal.
   *
   * @param {string[]} path - The ordered sequence of syllable keys to
   *   check.
   * @returns {boolean} `true` if every key in `path` exists at its
   *   corresponding level of the tree; `false` if any key is absent.
   * @throws {TypeError} If the tree provided at construction is `null`,
   *   `undefined`, or any non-object value that does not support the `in`
   *   operator.
   *
   * @example
   * const path = new Path({ a: { back: "back" } });
   * path.traverse(["a", "back"]);   // → true
   * path.traverse(["a", "front"]);  // → false
   *
   * @example <caption>Empty path — always succeeds</caption>
   * path.traverse([]);  // → true
   */
  traverse(path) {
    this.#log.info("Checking path traversal", { path });

    let currentTree = this.#tree;

    for (const node of path) {
      this.#log.debug("Traversing current tree level with node", { node });

      if (node in currentTree) {
        this.#log.debug("Node found", { node });
        currentTree = currentTree[node];
      } else {
        this.#log.info("Failed traversal", { path });
        this.#log.debug("Node not found", { node });
        return false;
      }
    }

    this.#log.info("Successful traversal", { path });
    return true;
  }

  /**
   * Generates a {@link Set} of `count` unique random integer indices
   * bounded by `maximum`.
   *
   * `seed` is captured once as `Date.now()` before the loop begins. In
   * each pass a {@link Uint32Array} of length `count` is filled with
   * cryptographically random values via {@link Crypto.getRandomValues}.
   * Each raw value is mapped to a bounded index with
   * `Math.floor((seed / value) % maximum)`. Once the {@link Set} reaches
   * `count` entries the inner loop exits early via a `break`; the outer
   * loop repeats only when a full pass yields fewer than `count` unique
   * indices due to collisions.
   *
   * > **Note:** `Math.floor((seed / value) % maximum)` produces values in
   * > `{0, …, maximum − 1}` — `maximum` distinct possibilities. The loop
   * > terminates as long as `count ≤ maximum`, which the caller enforces
   * > via `Math.min`.
   *
   * @param {object} options - The generation options.
   * @param {number} options.count - The number of unique indices to collect.
   * @param {number} options.maximum - The exclusive upper bound for
   *   generated indices. Each index falls in `{0, …, maximum − 1}`.
   * @param {number} [options.minimum] - Currently used for logging only;
   *   does not affect the range of generated values.
   * @returns {Set<number>} A set of exactly `count` unique integer indices.
   * @throws {DOMException} If `count` exceeds `16384` and the resulting
   *   {@link Uint32Array} buffer surpasses the `65536`-byte quota imposed
   *   by {@link Crypto.getRandomValues}.
   */
  #getRandomValues({ count, maximum, minimum }) {
    const values = new Set();
    const seed = Date.now();

    this.#log.debug("Generating random values in range", { maximum, minimum });

    while (values.size < count && values.size < minimum) {
      this.#log.debug("Size of values less than count", { count, size: values.size });

      const indexes = new Uint32Array(count);
      self.crypto.getRandomValues(indexes);

      for (const index of indexes) {
        if (values.size === maximum) {
          this.#log.debug("Size of values equal to count", { count, size: values.size });
          break;
        }

        const value = Math.floor((seed / index) % count);

        this.#log.debug("Generated value", { value });
        values.add(value);
      }
    }

    return values;
  }
}
