/**
 * @fileoverview Provides the {@link Separator} class, which splits words into
 * phonetically correct syllables.
 */

import { CreateLogger } from "./Log.js";
import {
  BlendTypes,
  ClosedVCVWords,
  CompoundWords,
  DigraphTypes,
  PatternExceptions,
  Prefixes,
  PreprocessedWords,
  SilentFinalPairs,
  SilentInitialPairs,
  Suffixes,
  Vowels,
} from "./Separator.constants.js";
import {
  Groups,
  LEPattern,
  mergeRepeatedCharacters,
  PatternTypes,
  QUPatterns,
  VPattern,
  XPatterns,
} from "./Separator.patterns.js";

/**
 * Separates a stream of words into their component syllables using
 * bidirectional affix scanning and recursive phonetic pattern matching.
 *
 * ### Algorithm
 * Each word is processed in three stages:
 * 1. **Affixes** — {@link Separator#forwardIterator} and
 *    {@link Separator#reverseIterator} advance simultaneously from both ends
 *    of the word, testing successively longer slices against the known prefix
 *    and suffix sets. The longest matching prefix and suffix win.
 * 2. **Compound words** — if the extracted root matches a known compound word
 *    it is split at the compound boundary and each part is recursively
 *    processed.
 * 3. **Root patterns** — the remaining root is matched against phonetic
 *    patterns in priority order: `LE`, `VCCCCV`, `VCCCV`, `VCCV`, `VCV`,
 *    `VV`. The earliest match in the string takes precedence. Exception rules
 *    — digraphs, trigraphs, blend sounds, glued sounds, and quadgraphs —
 *    override the default split point. Roots of three characters or fewer,
 *    and roots that match no pattern, are returned unsplit.
 *
 * ### Output format
 * | Element | Separator |
 * |---------|-----------|
 * | Syllables within a word | `;` |
 * | Words (lines) | `\n` |
 *

 * @example
 * const iter = { async *[Symbol.asyncIterator]() { yield "basket"; } };
 * await new Separator(iter).separate();
 * // → "bas;ket"
 *
 * @example
 * const iter = { async *[Symbol.asyncIterator]() { yield "candle"; yield "tiger"; } };
 * await new Separator(iter).separate();
 * // → "can;dle\nti;ger"
 */
export class Separator {
  /** @type {Generator<number>} */
  #forward;

  /** @type {number} */
  #forwardIndex;

  /** @type {AsyncIterable<string>} */
  #lines;

  /** @type {import("@std/log").Logger} */
  #log;

  /** @type {number} */
  #minLength = 3;

  /** @type {number} */
  #overlap = 1;

  /** @type {Generator<number>} */
  #reverse;

  /** @type {number} */
  #reverseIndex;

  /**
   * Creates a new {@link Separator} instance.
   *
   * No validation is performed on `iter` at construction time — errors surface
   * when {@link Separator#separate} is called. In particular, passing
   * `undefined` or any non-iterable value will cause `separate()` to throw a
   * `TypeError` when the `for await` loop attempts to begin iteration.
   *
   * @param {AsyncIterable<string>} iter - An async iterable that yields one
   *   word per iteration.
   */
  constructor(iter) {
    this.#log = CreateLogger({ name: "Separator" });

    this.#log.info("Constructing");

    this.#lines = iter;
  }

  /**
   * Separates all words from the iterable provided at construction into their
   * component syllables.
   *
   * Each word is scanned bidirectionally for known prefixes and suffixes; the
   * remaining root is recursively split by phonetic pattern matching. Results
   * are joined into a single newline-delimited string.
   *
   * @returns {Promise<string>} A promise that resolves to a newline-delimited
   *   string of syllabified words, each with syllable boundaries marked by
   *   `;`.
   * @throws {TypeError} If the value provided at construction is not async
   *   iterable.
   * @throws {TypeError} If any line yielded by the iterable is empty or falsy
   *   (`"Empty line"`).
   *
   * @example
   * const iter = {
   *   async *[Symbol.asyncIterator]() {
   *     yield "refresh";
   *     yield "dimly";
   *   },
   * };
   * await new Separator(iter).separate();
   * // → "re;fresh\ndim;ly"
   */
  async separate() {
    this.#log.info("Separating");

    try {
      let value = [];

      for await (const line of this.#lines) {
        this.#log.info("Starting iteration", {
          line,
        });

        if (PreprocessedWords.has(line)) {
          const parts = PreprocessedWords.get(line);

          this.#log.info("Identified preprocessed word", {
            word: line,
            parts,
          });

          value = [...value, parts.join(";")];
        } else {
          this.#forwardIndex = 0;
          this.#forward = this.forwardIterator(line);

          this.#reverseIndex = line.length;
          this.#reverse = this.reverseIterator(line);

          value = [...value, this.#separate({ line }).filter(Boolean).join(";").replace(/^;|;$/g, "")];
        }

        this.#log.debug("Inserting result", {
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
   * A generator that yields ascending character indices for `line`, advancing
   * from the start of the word towards the reverse iterator's position.
   *
   * Iteration stops when {@link Separator.#forwardIndex} is within
   * {@link Separator.#overlap} positions of the current
   * {@link Separator.#reverseIndex}. Because both fields are shared mutable
   * state, the two iterators are mutually aware and converge toward the middle
   * of the word.
   *
   * Because generator bodies are lazy, the `TypeError` for an empty `line` is
   * not raised when this method is called — it is raised on the first
   * `.next()` invocation, which happens at the start of parsing.
   *
   * @param {string} line - The word to iterate over.
   * @returns {Generator<number>} A generator that yields ascending indices
   *   into `line`.
   * @throws {TypeError} If `line` is empty or falsy (`"Empty line"`).
   */
  *forwardIterator(line) {
    if (!line) {
      throw new TypeError("Empty line");
    }

    this.#log.debug("Starting forward iterator", {
      line,
    });

    while (this.#forwardIndex < this.#reverseIndex - this.#overlap) {
      this.#log.debug("Forward iteration", {
        index: this.#forwardIndex,
      });

      yield this.#forwardIndex++;
    }

    return this.#forwardIndex;
  }

  /**
   * A generator that yields descending character indices for `line`,
   * retreating from the end of the word towards the forward iterator's
   * position.
   *
   * The stopping condition is intentionally asymmetric with
   * {@link Separator#forwardIterator}: the reverse iterator continues for one
   * extra step after the forward iterator has stopped. This ensures that
   * prefix and suffix boundaries are probed at every index up to and including
   * the midpoint, so the longest valid affix can be identified.
   *
   * Because generator bodies are lazy, the `TypeError` for an empty `line` is
   * not raised when this method is called — it is raised on the first
   * `.next()` invocation, which happens at the start of parsing.
   *
   * @param {string} line - The word to iterate over.
   * @returns {Generator<number>} A generator that yields descending indices
   *   into `line`.
   * @throws {TypeError} If `line` is empty or falsy (`"Empty line"`).
   */
  *reverseIterator(line) {
    if (!line) {
      throw new TypeError("Empty line");
    }

    this.#log.debug("Starting reverse iterator", {
      line,
    });

    while (this.#reverseIndex > this.#forwardIndex - this.#overlap) {
      this.#log.debug("Reverse iteration", {
        index: this.#reverseIndex,
      });

      yield this.#reverseIndex--;
    }

    return this.#reverseIndex;
  }

  /**
   * Tests whether the slice of `line` from position `0` to `index` is a
   * known prefix.
   *
   * If a match is found the new boundary supersedes the cached values;
   * otherwise the cached `[start, prefix]` pair is returned unchanged,
   * preserving the most recently confirmed prefix across recursive calls.
   *
   * @param {object} options - The prefix inspection options.
   * @param {{ start?: number, prefix?: string }} options.cache - Accumulated parsing state. `cache.start`
   *   and `cache.prefix` hold the last confirmed prefix boundary and string.
   * @param {number} options.index - The current forward-iterator index;
   *   defines the end of the candidate prefix slice.
   * @param {string} options.line - The full word being parsed.
   * @returns {[number|undefined, string|undefined]} A tuple of
   *   `[startIndex, prefix]`. Both values are `undefined` when no prefix has
   *   been identified yet.
   */
  #prefix({ cache, index, line }) {
    this.#log.debug("Starting prefix parsing", {
      line,
    });

    const prefix = line.slice(0, index);

    if (Prefixes.has(prefix) && line.length - index >= this.#minLength) {
      this.#log.info("New prefix identified", {
        prefix,
      });

      return [index, prefix];
    } else {
      this.#log.debug("No new prefix identified", {
        index: cache.start,
        prefix: cache.prefix,
      });

      return [cache.start, cache.prefix];
    }
  }

  /**
   * Recursively splits a root string into syllables using phonetic pattern
   * matching.
   *
   * Roots of {@link Separator.#minLength} characters or fewer are returned
   * immediately without splitting. Known compound words are split at their
   * boundary and each part is recursively processed.
   *
   * For all other roots, the characters are first tokenised with
   * `mergeRepeatedCharacters` to normalise repeated letters, then tested
   * against six patterns in descending specificity order. The pattern whose
   * match begins earliest in the string takes priority. Exception rules
   * override the default split point for each pattern:
   * - **`VCCCV`** — glued sounds (`ild`, `ind`, `ing`, `old`, `olt`, `ost`,
   *   and nasal clusters) keep three consonants on the left.
   * - **`VCCV`** — R-blends split before the blend; consonant digraphs keep
   *   the digraph on the right; trigraphs suppress the split entirely.
   * - **`VCV`** — trigraphs on the head keep the head and pattern together.
   * - **`VV`** — quadgraphs and digraphs suppress the split entirely.
   *
   * > **Note:** Pattern positions are found using the tokenised string, but
   * > regex groups are extracted from the original `root`. This ensures that
   * > repeated-character normalisation does not corrupt the extracted syllable
   * > boundaries.
   *
   * @param {object} options - The root parsing options.
   * @param {string} options.root - The root string to split into syllables.
   * @returns {string} The root with syllable boundaries marked by `;`.
   */
  #root({ root }) {
    this.#log.debug("Starting root parsing", {
      root,
    });

    if (root.length <= this.#minLength) {
      this.#log.info("Word root less than or equal to minimum length", {
        minLength: this.#minLength,
        length: root.length,
      });

      return root;
    }

    if (CompoundWords.has(root)) {
      const [a, b] = CompoundWords.get(root);

      this.#log.info("Identified compound word", {
        word: root,
        parts: [a, b],
      });

      return `${this.#root({ root: a })};${this.#root({ root: b })}`;
    }

    const qu = new QUPatterns();

    if (qu.test(root)) {
      this.#log.debug("Preprocessing qu cluster", {
        root,
      });

      const processedRoot = qu.replace(root);

      this.#log.debug("Preprocessed root", {
        processedRoot,
      });

      const result = this.#root({ root: processedRoot });

      return qu.replaceAll(result);
    }

    const silentInitialPair = [...SilentInitialPairs].find((pair) => root.startsWith(pair));

    if (silentInitialPair) {
      this.#log.debug("Preprocessing silent initial pair", {
        root,
        pair: silentInitialPair,
      });

      const processedRoot = root.slice(silentInitialPair.length);

      this.#log.debug("Preprocessed root", {
        processedRoot,
      });

      const result = this.#root({ root: processedRoot });
      const syllables = result.split(";");

      syllables[0] = silentInitialPair + syllables[0];

      return syllables.join(";");
    }

    const silentFinalPair = [...SilentFinalPairs].find((pair) => root.endsWith(pair));

    if (silentFinalPair) {
      this.#log.debug("Preprocessing silent final pair", {
        root,
        pair: silentFinalPair,
      });

      const processedRoot = root.slice(0, -silentFinalPair.length);

      this.#log.debug("Preprocessed root", {
        processedRoot,
      });

      const result = this.#root({ root: processedRoot });
      const syllables = result.split(";");

      syllables[syllables.length - 1] += silentFinalPair;

      return syllables.join(";");
    }

    const x = new XPatterns();

    if (x.test(root)) {
      this.#log.debug("Preprocessing x as two consonants", {
        root,
      });

      const processedRoot = x.replace(root);

      this.#log.debug("Preprocessed root", {
        processedRoot,
      });

      const result = this.#root({ root: processedRoot });

      return x.replaceAll(result);
    }

    const { BlendSounds, Digraphs, GluedSounds, Quadgraphs, Trigraphs } = Groups;

    const tokens = mergeRepeatedCharacters(root);

    this.#log.debug("Tokenised word characters", {
      tokens,
    });

    const le = new LEPattern();
    const vccccv = new VPattern({ consonantCount: 4 });
    const vcccv = new VPattern({ consonantCount: 3 });
    const vccv = new VPattern({ consonantCount: 2 });
    const vcv = new VPattern({ consonantCount: 1 });
    const vv = new VPattern();

    const matches = [
      [le.findIndex(tokens), PatternTypes.LE, le.exec.bind(le)],
      [vccccv.findIndex(tokens), PatternTypes.VCCCCV, vccccv.exec.bind(vccccv)],
      [vcccv.findIndex(tokens), PatternTypes.VCCCV, vcccv.exec.bind(vcccv)],
      [vccv.findIndex(tokens), PatternTypes.VCCV, vccv.exec.bind(vccv)],
      [vcv.findIndex(tokens), PatternTypes.VCV, vcv.exec.bind(vcv)],
      [vv.findIndex(tokens), PatternTypes.VV, vv.exec.bind(vv)],
    ]
      .filter(([key]) => key !== null)
      .sort(([a], [b]) => a - b);

    const [, pattern, exec] = matches.at(0) ?? [];

    switch (pattern) {
      case PatternTypes.LE: {
        this.#log.info("Pattern match", {
          pattern: PatternTypes.LE,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern },
          } = match;

          this.#log.debug("Match groups", {
            head,
            pattern,
          });

          return `${head};${this.#root({ root: pattern })}`;
        }

        return root;
      }
      case PatternTypes.VCCCCV: {
        this.#log.info("Pattern match", {
          pattern: PatternTypes.VCCCCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          this.#log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          return `${head}${pattern.slice(0, 2)};${this.#root({
            root: `${pattern.slice(2)}${tail}`,
          })}`;
        }

        return root;
      }
      case PatternTypes.VCCCV: {
        this.#log.info("Pattern match", {
          pattern: PatternTypes.VCCCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          this.#log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (GluedSounds.test(pattern)) {
            this.#log.info("Exception identified", {
              type: PatternExceptions.Glued,
              value: pattern,
            });

            return `${head}${pattern.slice(0, 3)};${this.#root({
              root: `${pattern.slice(3)}${tail}`,
            })}`;
          } else {
            this.#log.info("No exception identified");

            return `${head}${pattern.slice(0, 2)};${this.#root({
              root: `${pattern.slice(2)}${tail}`,
            })}`;
          }
        }

        return root;
      }
      case PatternTypes.VCCV: {
        this.#log.info("Pattern match", {
          pattern: PatternTypes.VCCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          this.#log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (BlendSounds.test(pattern, BlendTypes.R)) {
            this.#log.info("Exception identified", {
              type: PatternExceptions.Blend.R,
              value: pattern,
            });

            return `${head}${pattern.slice(0, 1)};${this.#root({
              root: `${pattern.slice(1)}${tail}`,
            })}`;
          } else if (Digraphs.test(pattern, DigraphTypes.Consonant)) {
            this.#log.info("Exception identified", {
              type: PatternExceptions.Digraph.Consonant,
              value: pattern,
            });

            return `${head}${pattern.slice(0, 3)};${this.#root({
              root: `${pattern.slice(3)}${tail}`,
            })}`;
          } else if (Trigraphs.test(root.slice(-3))) {
            this.#log.info("Exception identified", {
              type: PatternExceptions.Trigraph,
              value: root,
            });

            return `${head}${pattern}${tail}`;
          } else {
            this.#log.info("No exception identified");

            return `${head}${pattern.slice(0, 2)};${this.#root({
              root: `${pattern.slice(2)}${tail}`,
            })}`;
          }
        }

        return root;
      }
      case PatternTypes.VCV: {
        this.#log.info("Pattern match", {
          pattern: PatternTypes.VCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          this.#log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (Trigraphs.test(`${head}${pattern}`)) {
            this.#log.info("Exception identified", {
              type: PatternExceptions.Trigraph,
              value: root,
            });

            return `${head}${pattern};${this.#root({ root: tail })}`;
          } else if (ClosedVCVWords.has(root)) {
            this.#log.info("Exception identified", {
              type: "closed syllable",
              value: root,
            });

            return `${head}${pattern.slice(0, 2)};${this.#root({
              root: `${pattern.slice(2)}${tail}`,
            })}`;
          } else {
            return `${head}${pattern.slice(0, 1)};${this.#root({
              root: `${pattern.slice(1)}${tail}`,
            })}`;
          }
        }

        return root;
      }
      case PatternTypes.VV: {
        this.#log.info("Pattern match", {
          pattern: PatternTypes.VV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          this.#log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (Quadgraphs.test(root)) {
            this.#log.info("Exception identified", {
              type: PatternExceptions.Quadgraph,
              value: root,
            });

            return `${head}${pattern}${tail}`;
          } else if (Digraphs.test(pattern, DigraphTypes.Vowel)) {
            this.#log.info("Exception identified", {
              type: PatternExceptions.Digraph.Digraph,
              value: root,
            });

            if ([...tail].some((c) => Vowels.has(c))) {
              return `${head}${pattern};${this.#root({ root: tail })}`;
            }

            return `${head}${pattern}${tail}`;
          } else {
            this.#log.info("No exception identified");

            return `${head}${pattern.at(0)};${this.#root({
              root: `${pattern.at(1)}${tail}`,
            })}`;
          }
        }

        return root;
      }
      default: {
        this.#log.info("No pattern match", {
          value: root,
        });

        return root;
      }
    }
  }

  /**
   * Recursively scans `line` bidirectionally to identify the longest prefix
   * and suffix, then delegates the remaining root to {@link Separator.#root}.
   *
   * On each call one step is advanced on both iterators. The most recently
   * confirmed prefix and suffix boundaries are accumulated in `cache`. When
   * both iterators are exhausted the root is extracted as
   * `line.slice(cache.start, cache.end)` and passed to
   * {@link Separator.#root} for syllabification.
   *
   * > **Note:** On the initial call `cache` is empty, so `cache.start` and
   * > `cache.end` are both `undefined`. JavaScript coerces these to `0` and
   * > `line.length` respectively inside `Array.prototype.slice`, so the full
   * > word is used as the root whenever no affix has been identified.
   *
   * The result is a three-element array `[prefix, root, suffix]` where
   * unidentified affixes are `undefined`. The caller filters falsy values,
   * joins with `;`, and trims any leading or trailing separators.
   *
   * @param {object} options - Parsing state for this call.
   * @param {{ start?: number, end?: number, prefix?: string, suffix?: string, root?: string }} [options.cache={}] - Accumulated prefix/suffix boundaries
   *   and root from previous recursive calls.
   * @param {string} options.line - The full word being parsed.
   * @returns {Array<string|undefined>} A three-element array of
   *   `[prefix, root, suffix]`, where `prefix` and `suffix` are `undefined`
   *   when no affix was identified.
   */
  #separate({ cache = {}, line }) {
    const forward = this.#forward.next();
    const backward = this.#reverse.next();

    if (backward.done && forward.done) {
      this.#log.info("Finished parsing prefix and suffix", {
        prefix: cache.prefix,
        suffix: cache.suffix,
      });

      const suffixStartsWithVowel = cache.suffix && Vowels.has(cache.suffix.at(0));
      const rootEndsWithGeminate = cache.root?.length >= 2 && cache.root.at(-1) === cache.root.at(-2);

      if (suffixStartsWithVowel && rootEndsWithGeminate) {
        this.#log.info("Geminate consonant at suffix boundary", {
          root: cache.root,
          suffix: cache.suffix,
        });

        const adjustedRoot = cache.root.slice(0, -1);
        const adjustedSuffix = `${cache.root.at(-1)}${cache.suffix}`;

        this.#log.debug("Adjusted suffix boundary", {
          root: adjustedRoot,
          suffix: adjustedSuffix,
        });

        const root = this.#root({ root: adjustedRoot });

        this.#log.info("Finished parsing root", {
          root,
        });

        return [cache.prefix, root, adjustedSuffix];
      }

      const root = this.#root(cache);

      this.#log.info("Finished parsing root", {
        root,
      });

      return [cache.prefix, root, cache.suffix];
    } else {
      const [start, prefix] = this.#prefix({
        cache,
        index: forward.value,
        line,
      });

      const [end, suffix] = this.#suffix({
        cache,
        index: backward.value,
        line,
      });

      return this.#separate({
        cache: {
          end,
          prefix,
          root: line.slice(start, end),
          start,
          suffix,
        },
        line,
      });
    }
  }

  /**
   * Tests whether the slice of `line` from `index` to the end is a known
   * suffix.
   *
   * If a match is found the new boundary supersedes the cached values;
   * otherwise the cached `[end, suffix]` pair is returned unchanged,
   * preserving the most recently confirmed suffix across recursive calls.
   *
   * @param {object} options - The suffix inspection options.
   * @param {{ end?: number, suffix?: string }} options.cache - Accumulated parsing state. `cache.end`
   *   and `cache.suffix` hold the last confirmed suffix boundary and string.
   * @param {number} options.index - The current reverse-iterator index;
   *   defines the start of the candidate suffix slice.
   * @param {string} options.line - The full word being parsed.
   * @returns {[number|undefined, string|undefined]} A tuple of
   *   `[endIndex, suffix]`. Both values are `undefined` when no suffix has
   *   been identified yet.
   */
  #suffix({ cache, index, line }) {
    this.#log.debug("Starting suffix parsing", {
      line,
    });

    const suffix = line.slice(index, line.length);

    if (Suffixes.has(suffix) && index >= this.#minLength) {
      this.#log.info("New suffix identified", {
        index,
        suffix,
      });

      return [index, suffix];
    } else {
      this.#log.debug("No new suffix identified", {
        index: cache.end,
        suffix: cache.suffix,
      });

      return [cache.end, cache.suffix];
    }
  }
}
