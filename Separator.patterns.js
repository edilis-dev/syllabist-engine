/**
 * @fileoverview Pattern-matching utilities used by {@link Separator} to
 * identify syllable boundaries within a word root. Exports the phoneme group
 * testers, pattern-type constants, and the individual pattern classes consumed
 * by {@link Separator.#root}.
 */

import {
  BlendTypes,
  ConsonantDigraphs,
  Consonants,
  DigraphTypes,
  FinalDigraphs,
  GluedSounds,
  InitialDigraphs,
  LBlends,
  OtherBlends,
  Quadgraphs,
  RBlends,
  SBlends,
  Trigraphs,
  VowelDigraphs,
  Vowels,
} from "./Separator.constants.js";

/**
 * Normalises a string for pattern matching by collapsing consecutive identical
 * characters into one, except when the pair forms a recognised phoneme unit.
 *
 * A repeated pair is **preserved** when it:
 * - forms a blend sound (e.g. a double letter that is also an S-blend entry)
 * - forms a digraph (e.g. `ss` as a final digraph)
 * - forms a glued sound
 * - belongs to the exception set: `bb`, `cc`, `dd`, `ff`, `gg`, `ll`, `mm`,
 *   `nn`, `pp`, `rr`, `tt`, `zz` — genuine doubled consonants that must be
 *   retained so VCCV/VCV pattern matching fires correctly (e.g. `"dinner"`
 *   must remain `"dinner"` not `"diner"`)
 *
 * @param {string} str - The root string to normalise.
 * @returns {string} The normalised string with non-phonemic repeats collapsed.
 *
 * @example
 * mergeRepeatedCharacters("dinner"); // → "dinner"  (nn preserved)
 * mergeRepeatedCharacters("pupil");  // → "pupil"   (no repeats)
 */
export function mergeRepeatedCharacters(str) {
  const Exceptions = new Set(["bb", "cc", "dd", "ff", "gg", "ll", "mm", "nn", "pp", "rr", "tt", "zz"]);

  return [...str].reduce((previousValue, currentValue) => {
    const previousChar = previousValue.at(-1);

    if (currentValue === previousChar) {
      if (Groups.BlendSounds.test(`${previousChar}${currentValue}`)) {
        return `${previousChar}${currentValue}`;
      } else if (Groups.Digraphs.test(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      } else if (Groups.GluedSounds.test(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      } else if (Exceptions.has(`${previousChar}${currentValue}`)) {
        return `${previousValue}${currentValue}`;
      }

      return previousValue;
    }

    return `${previousValue}${currentValue}`;
  });
}

/**
 * A collection of phoneme-group test functions used throughout syllabification
 * pattern matching. Each member exposes a `test(str)` method that returns
 * `true` when the string contains a member of that phoneme group.
 *
 * `BlendSounds.test` and `Digraphs.test` accept an optional second argument
 * (a {@link BlendTypes} or {@link DigraphTypes} value) to restrict the search
 * to a specific sub-category; omitting it tests against the union of all
 * sub-categories.
 */
export const Groups = {
  /**
   * Tests whether a string contains a consonant blend sound.
   *
   * @param {string} str - The string to test.
   * @param {string} [type] - Optional {@link BlendTypes} value to restrict to
   *   a single blend category (`L`, `R`, `S`, or `Other`).
   * @returns {boolean}
   */
  BlendSounds: {
    test: (str, type) => {
      switch (type) {
        case BlendTypes.L: {
          return new RegExp(Array.from(LBlends).join("|")).test(str);
        }
        case BlendTypes.R: {
          return new RegExp(Array.from(RBlends).join("|")).test(str);
        }
        case BlendTypes.S: {
          return new RegExp(Array.from(SBlends).join("|")).test(str);
        }
        case BlendTypes.Other: {
          return new RegExp(Array.from(OtherBlends).join("|")).test(str);
        }
        default: {
          return new RegExp(
            `${Array.from(LBlends).join("|")}|${Array.from(RBlends).join(
              "|",
            )}|${Array.from(SBlends).join("|")}|${Array.from(OtherBlends).join("|")}`,
          ).test(str);
        }
      }
    },
  },
  /**
   * Tests whether a string contains a digraph.
   *
   * @param {string} str - The string to test.
   * @param {string} [position] - Optional {@link DigraphTypes} value to
   *   restrict to a single digraph category (`Consonant`, `Final`, `Initial`,
   *   or `Vowel`).
   * @returns {boolean}
   */
  Digraphs: {
    test: (str, position) => {
      switch (position) {
        case DigraphTypes.Consonant: {
          return new RegExp(Array.from(ConsonantDigraphs).join("|")).test(str);
        }
        case DigraphTypes.Final: {
          return new RegExp(Array.from(FinalDigraphs).join("|")).test(str);
        }
        case DigraphTypes.Initial: {
          return new RegExp(Array.from(InitialDigraphs).join("|")).test(str);
        }
        case DigraphTypes.Vowel: {
          return new RegExp(Array.from(VowelDigraphs).join("|")).test(str);
        }
        default: {
          return new RegExp(
            `${Array.from(ConsonantDigraphs).join("|")}|${Array.from(FinalDigraphs).join(
              "|",
            )}|${Array.from(InitialDigraphs).join("|")}|${Array.from(VowelDigraphs).join("|")}`,
          ).test(str);
        }
      }
    },
  },
  /** Tests whether a string contains a glued sound. @param {string} str @returns {boolean} */
  GluedSounds: {
    test: (str) =>
      new RegExp(
        `${Array.from(GluedSounds).join("|")}|${Array.from(Vowels)
          .map((v) => `${v}nk`)
          .join("|")}|${Array.from(Vowels)
          .map((v) => `${v}ng`)
          .join("|")}`,
      ).test(str),
  },
  /** Tests whether a string contains a quadgraph. @param {string} str @returns {boolean} */
  Quadgraphs: {
    test: (str) => new RegExp(Array.from(Quadgraphs).join("|")).test(str),
  },
  /** Tests whether a string contains a trigraph. @param {string} str @returns {boolean} */
  Trigraphs: {
    test: (str) => new RegExp(Array.from(Trigraphs).join("|")).test(str),
  },
};

/**
 * Identifiers for the six syllabification patterns, listed in descending
 * specificity order. {@link Separator.#root} selects whichever pattern fires
 * earliest in the string; ties are broken by this ordering.
 *
 * | Key      | Abbreviation | Consonants between the two vowels |
 * |----------|--------------|-----------------------------------|
 * | `LE`     | –            | Terminal consonant-`le` (e.g. `-dle`) |
 * | `VCCCCV` | V-4C-V       | 4 |
 * | `VCCCV`  | V-3C-V       | 3 |
 * | `VCCV`   | V-2C-V       | 2 |
 * | `VCV`    | V-1C-V       | 1 |
 * | `VV`     | V-V          | 0 (adjacent vowels) |
 */
export const PatternTypes = {
  LE: "le",
  VCCCCV: "vccccv",
  VCCCV: "vcccv",
  VCCV: "vccv",
  VCV: "vcv",
  VV: "vv",
};

/**
 * Matches the terminal consonant-`le` pattern (e.g. `-dle`, `-tle`, `-ble`).
 *
 * Words ending in this pattern are split so that the consonant-`le` unit
 * begins the final syllable: `"candle"` → head `"can"`, pattern `"dle"`.
 * The match is anchored to the end of the string and requires exactly one
 * consonant immediately before `le`.
 */
export class LEPattern {
  #consonants = Array.from(Consonants).join("");

  /**
   * Executes the pattern against `str`, returning a match object with named
   * capture groups `head` and `pattern`, or `null` if no match.
   *
   * @param {string} str - The root string to test.
   * @returns {RegExpExecArray | null}
   */
  exec(str) {
    return new RegExp(`(?<head>[a-z]*?)(?<pattern>[${this.#consonants}]le$)`).exec(str);
  }

  /**
   * Returns the string index at which the pattern begins, or `null` if the
   * string does not end with a consonant-`le` sequence.
   *
   * @param {string} str - The root string to test.
   * @returns {number | null}
   */
  findIndex(str) {
    const match = new RegExp(`(?:[a-z]*?)(?:[${this.#consonants}]le$)`).exec(str);

    return match ? match.index : null;
  }

  /**
   * Returns `true` if the string ends with a consonant-`le` sequence.
   *
   * @param {string} str - The root string to test.
   * @returns {boolean}
   */
  test(str) {
    return new RegExp(`(?:[a-z]*[${this.#consonants}]le$)`).test(str);
  }
}

/**
 * Handles pre- and post-processing of the `qu` consonant cluster.
 *
 * `u` in `qu` would otherwise be misidentified as a vowel by the VPattern
 * regex, causing incorrect VCV matches (e.g. `"liquid"` → `i–q–u` as VCV
 * instead of `i–qu–i` as VCCV). The fix is to substitute `[vowel]qu` →
 * `[vowel]kw` before pattern matching, then restore `kw` → `qu` (and `k;w`
 * → `q;u` for the split case) in the result.
 */
export class QUPatterns {
  /**
   * Replaces every `[vowel]qu` occurrence with `[vowel]kw` to prevent `u`
   * from being treated as a vowel during pattern matching.
   *
   * @param {string} str - The root string to preprocess.
   * @returns {string}
   */
  replace(str) {
    return str.replace(/([aeiouy])qu/g, "$1kw");
  }

  /**
   * Restores `kw` → `qu` in the syllabified result, handling both the
   * inline case (`kw` within a syllable) and the split case (`k;w` across
   * a syllable boundary).
   *
   * @param {string} str - The syllabified result string to restore.
   * @returns {string}
   */
  replaceAll(str) {
    return str.replaceAll("kw", "qu").replaceAll("k;w", "q;u");
  }

  /**
   * Returns `true` if the string contains a vowel immediately followed by
   * `qu` — the condition that triggers preprocessing.
   *
   * @param {string} str - The root string to test.
   * @returns {boolean}
   */
  test(str) {
    return new RegExp(/([aeiouy])qu/).test(str);
  }
}

/**
 * Matches the generic Vowel–(N Consonants)–Vowel pattern, where `N` is
 * provided at construction time via `consonantCount`.
 *
 * Instantiate once for each consonant count required:
 * - `consonantCount: 0` → VV (adjacent vowels)
 * - `consonantCount: 1` → VCV
 * - `consonantCount: 2` → VCCV
 * - `consonantCount: 3` → VCCCV
 * - `consonantCount: 4` → VCCCCV
 *
 * `exec` captures three named groups — `head` (text before the pattern),
 * `pattern` (the matched V–C*–V span), and `tail` (text after) — which
 * {@link Separator.#root} uses to determine the split point.
 */
export class VPattern {
  /** @type {number} */
  #consonantCount;

  /** @type {string} */
  #consonants = Array.from(Consonants).join("");

  /** @type {string} */
  #vowels = Array.from(Vowels).join("");

  /**
   * @param {object} [options={ consonantCount: 0 }] - Pattern options.
   * @param {number} [options.consonantCount=0] - The number of consonants
   *   between the two vowels that this instance will match.
   */
  constructor({ consonantCount } = { consonantCount: 0 }) {
    this.#consonantCount = consonantCount;
  }

  /**
   * Executes the pattern against `str`, returning a match object with named
   * capture groups `head`, `pattern`, and `tail`, or `null` if no match.
   *
   * @param {string} str - The root string to test.
   * @returns {RegExpExecArray | null}
   */
  exec(str) {
    return new RegExp(
      `(?<head>[a-z]*?)(?<pattern>[${this.#vowels}][${this.#consonants}]{${this.#consonantCount}}[${this.#vowels}])(?<tail>[a-z]*)`,
    ).exec(str);
  }

  /**
   * Returns the index of the first match in `str`, or `null` if the pattern
   * is not present.
   *
   * @param {string} str - The root string to test.
   * @returns {number | null}
   */
  findIndex(str) {
    const match = new RegExp(`[${this.#vowels}][${this.#consonants}]{${this.#consonantCount}}[${this.#vowels}]`).exec(str);

    return match ? match.index : null;
  }

  /**
   * Returns `true` if `str` contains the V–(N consonants)–V pattern
   * anywhere within it.
   *
   * @param {string} str - The root string to test.
   * @returns {boolean}
   */
  test(str) {
    return new RegExp(
      `(?:[a-z]*?)(?:[${this.#vowels}][${this.#consonants}]{${this.#consonantCount}}[${this.#vowels}])(?:[a-z]*)`,
    ).test(str);
  }
}

/**
 * Handles pre- and post-processing of `x` between two vowels.
 *
 * `x` represents the phoneme cluster /ks/ (two consonants), but the regex
 * character class treats it as a single consonant, causing VCV to fire
 * incorrectly (e.g. `"exit"` → `e–x–i` as VCV instead of `e–ks–i` as VCCV).
 * The fix mirrors {@link QUPatterns}: substitute `[vowel]x[vowel]` →
 * `[vowel]ks[vowel]` before matching, then restore in the result.
 */
export class XPatterns {
  /**
   * Replaces every `[vowel]x[vowel]` occurrence with `[vowel]ks[vowel]` so
   * that `x` contributes two consonant positions to the pattern match.
   *
   * @param {string} str - The root string to preprocess.
   * @returns {string}
   */
  replace(str) {
    return str.replace(/([aeiouy])x([aeiouy])/g, "$1ks$2");
  }

  /**
   * Restores `ks` → `x` in the syllabified result, handling both the inline
   * case (`[vowel]ks[vowel]` within a syllable) and the split case
   * (`[vowel]k;s` across a boundary).
   *
   * @param {string} str - The syllabified result string to restore.
   * @returns {string}
   */
  replaceAll(str) {
    return str.replace(/([aeiouy])k;s/g, "$1x;").replace(/([aeiouy])ks([aeiouy])/g, "$1x$2");
  }

  /**
   * Returns `true` if the string contains `x` flanked by vowels on both
   * sides — the condition that triggers preprocessing.
   *
   * @param {string} str - The root string to test.
   * @returns {boolean}
   */
  test(str) {
    return new RegExp(/([aeiouy])x([aeiouy])/).test(str);
  }
}
