import * as log from "./Log.js";

import {
  BlendTypes,
  CompoundWords,
  DigraphTypes,
  PatternExceptions,
  Prefixes,
  Suffixes,
} from "./Separator.constants.js";
import {
  mergeRepeatedCharacters,
  Groups,
  Patterns,
} from "./Separator.patterns.js";

export class Separator {
  #forward;
  #forwardIndex;
  #lines;
  #minLength = 3;
  #overlap = 1;
  #reverse;
  #reverseIndex;

  constructor(iter) {
    log.info("Constructing");

    this.#lines = iter;
  }

  async separate() {
    log.debug("Separating");

    try {
      let value = [];

      for await (const line of this.#lines) {
        log.info("Starting iteration", {
          line,
        });

        this.#forwardIndex = 0;
        this.#forward = this.forwardIterator(line);

        this.#reverseIndex = line.length;
        this.#reverse = this.reverseIterator(line);

        value = [
          ...value,
          this.#separate({ line })
            .filter(Boolean)
            .join(";")
            .replace(/^;|;$/g, ""),
        ];

        log.debug("Inserting result", {
          value,
        });
      }

      log.info("Result", {
        value,
      });

      return value.join("\n");
    } catch (error) {
      log.error("Error", {
        reason: error.message,
      });

      throw error;
    }
  }

  *forwardIterator(line) {
    if (!line) {
      throw new TypeError("Empty line");
    }

    log.debug("Starting forward iterator", {
      line,
    });

    while (this.#forwardIndex < this.#reverseIndex - this.#overlap) {
      log.debug("Forward iteration", {
        index: this.#forwardIndex,
      });

      yield this.#forwardIndex++;
    }

    return this.#forwardIndex;
  }

  *reverseIterator(line) {
    if (!line) {
      throw new Error("Empty line");
    }

    log.debug("Starting reverse iterator", {
      line,
    });

    while (this.#reverseIndex > this.#forwardIndex - this.#overlap) {
      log.debug("Reseverse iteration", {
        index: this.#reverseIndex,
      });

      yield this.#reverseIndex--;
    }

    return this.#reverseIndex;
  }

  #separate({ cache = {}, line }) {
    const forward = this.#forward.next();
    const backward = this.#reverse.next();

    if (backward.done && forward.done) {
      log.info("Finished parsing prefix and suffix", {
        prefix: cache.prefix,
        suffix: cache.suffix,
      });

      const root = this.#root(cache);

      log.info("Finished parsing root", {
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

  #prefix({ cache, index, line }) {
    log.debug("Starting prefix parsing", {
      line,
    });

    const prefix = line.slice(0, index);

    if (Prefixes.has(prefix)) {
      log.info("New prefix identified", {
        prefix,
      });

      return [index, prefix];
    } else {
      log.debug("No new prefix identified", {
        index: cache.start,
        prefix: cache.prefix,
      });

      return [cache.start, cache.prefix];
    }
  }

  #root({ root }) {
    log.debug("Starting root parsing", {
      root,
    });

    if (root.length <= this.#minLength) {
      log.info("Word root less than or equal to minimum length", {
        minLenghth: this.#minLength,
        length: root.length,
      });

      return root;
    }

    if (CompoundWords.has(root)) {
      const [a, b] = CompoundWords.get(root);

      log.info("Identified compound word", {
        word: root,
        parts: [a, b],
      });

      return `${this.#root({ root: a })};${this.#root({ root: b })}`;
    }

    // prettier-ignore
    const { BlendSounds, Digraphs, GluedSounds, Quadgraphs, Trigraphs } = Groups;

    const { LE, VCCCCV, VCCCV, VCCV, VCV, VV } = Patterns;

    const tokens = mergeRepeatedCharacters(root);

    log.debug("Tokenised word characters", {
      tokens,
    });

    if (LE.test(tokens)) {
      log.info("Pattern match", {
        pattern: "LE",
      });

      const match = LE.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, end },
        } = match;

        log.debug("Match groups", {
          beginning,
          end,
        });

        return `${beginning};${this.#root({ root: end })}`;
      }
    } else if (VCCCCV.test(tokens)) {
      log.info("Pattern match", {
        pattern: "VCCCCV",
      });

      const match = VCCCCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        log.debug("Match groups", {
          beginning,
          middle,
          end,
        });

        // prettier-ignore
        return `${beginning}${middle.at(0)};${middle.at(1)}${middle.at(2)}${middle.at(3)}${end}`;
      }
    } else if (VCCCV.test(tokens)) {
      log.info("Pattern match", { pattern: "VCCCV" });

      const match = VCCCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        log.debug("Match groups", {
          beginning,
          middle,
          end,
        });

        if (GluedSounds.test(`${beginning.at(-1)}${middle.slice(0, -1)}`)) {
          log.info("Exception identified", {
            type: PatternExceptions.Glued,
            value: `${beginning.at(-1)}${middle.slice(0, -1)}`,
          });

          return `${beginning.slice(0, -1)}${beginning.at(-1)}${middle.at(0)}${middle.at(1)};${this.#root({ root: `${middle.at(2)}${end}` })}`;
        } else {
          log.info("No exception identified");

          return `${beginning}${middle.at(0)};${this.#root({ root: `${middle.slice(1)}${end}` })}`;
        }
      }
    } else if (VCCV.test(tokens)) {
      log.info("Pattern match", {
        pattern: "VCCV",
      });

      const match = VCCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        log.debug("Match groups", {
          beginning,
          middle,
          end,
        });

        if (BlendSounds.test(middle, BlendTypes.R)) {
          log.info("Exception identified", {
            type: PatternExceptions.Blend.R,
            value: middle,
          });

          return `${beginning};${middle}${this.#root({ root: end })}`;
        } else if (Digraphs.test(middle, DigraphTypes.Consonant)) {
          log.info("Exception identified", {
            type: PatternExceptions.Digraph.Consonant,
            value: middle,
          });

          return `${beginning}${middle};${this.#root({ root: end })}`;
        } else if (Trigraphs.test(root)) {
          log.info("Exception identified", {
            type: PatternExceptions.Trigraph,
            value: root,
          });

          return `${beginning}${middle}${end}`;
        } else {
          log.info("No exception identified");

          return `${beginning}${middle.at(0)};${this.#root({ root: `${middle.at(1)}${end}` })}`;
        }
      }
    } else if (VCV.test(tokens)) {
      log.info("Pattern match", {
        pattern: "VCV",
      });

      const match = VCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        log.debug("Match groups", {
          beginning,
          middle,
          end,
        });

        if (Trigraphs.test(root)) {
          log.info("Exception identified", {
            type: PatternExceptions.Trigraph,
            value: root,
          });

          return `${beginning}${middle}${end}`;
        } else {
          return `${beginning};${middle}${this.#root({ root: end })}`;
        }
      }
    } else if (VV.test(tokens)) {
      log.info("Pattern match", {
        pattern: "VV",
      });

      const match = VV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, end },
        } = match;

        log.debug("Match groups", {
          beginning,
          end,
        });

        if (Quadgraphs.test(root)) {
          log.info("Exception identified", {
            type: PatternExceptions.Quadgraph,
            value: root,
          });

          return `${beginning}${end}`;
        } else if (Digraphs.test(root)) {
          log.info("Exception identified", {
            type: PatternExceptions.Digraph.Digraph,
            value: root,
          });

          return `${beginning}${end}`;
        } else {
          log.info("No exception identified");

          return `${beginning};${this.#root({ root: end })}`;
        }
      }
    }

    log.info("No pattern match", {
      value: root,
    });

    return root;
  }

  #suffix({ cache, index, line }) {
    log.debug("Starting suffix parsing", {
      line,
    });

    const suffix = line.slice(index, line.length);

    if (Suffixes.has(suffix)) {
      log.info("New suffix identified", {
        index,
        suffix,
      });

      return [index, suffix];
    } else {
      log.debug("No new suffix identified", {
        index: cache.end,
        suffix: cache.suffix,
      });

      return [cache.end, cache.suffix];
    }
  }
}
