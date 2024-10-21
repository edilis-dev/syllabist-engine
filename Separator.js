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
  Groups,
  LEPattern,
  mergeRepeatedCharacters,
  PatternTypes,
  VPattern,
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

    const { BlendSounds, Digraphs, GluedSounds, Quadgraphs, Trigraphs } =
      Groups;

    const tokens = mergeRepeatedCharacters(root);

    log.debug("Tokenised word characters", {
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
        log.info("Pattern match", {
          pattern: PatternTypes.LE,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern },
          } = match;

          log.debug("Match groups", {
            head,
            pattern,
          });

          return `${head};${this.#root({ root: pattern })}`;
        }

        return root;
      }
      case PatternTypes.VCCCCV: {
        log.info("Pattern match", {
          pattern: PatternTypes.VCCCCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          return `${head}${pattern.slice(0, 2)};${pattern.slice(2)}${tail}`;
        }

        return root;
      }
      case PatternTypes.VCCCV: {
        log.info("Pattern match", {
          pattern: PatternTypes.VCCCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (GluedSounds.test(pattern)) {
            log.info("Exception identified", {
              type: PatternExceptions.Glued,
              value: pattern,
            });

            return `${head}${pattern.slice(0, 3)};${
              this.#root({
                root: `${pattern.slice(3)}${tail}`,
              })
            }`;
          } else {
            log.info("No exception identified");

            return `${head}${pattern.slice(0, 2)};${
              this.#root({
                root: `${pattern.slice(2)}${tail}`,
              })
            }`;
          }
        }

        return root;
      }
      case PatternTypes.VCCV: {
        log.info("Pattern match", {
          pattern: PatternTypes.VCCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (BlendSounds.test(pattern, BlendTypes.R)) {
            log.info("Exception identified", {
              type: PatternExceptions.Blend.R,
              value: pattern,
            });

            return `${head}${pattern.slice(0, 1)};${
              this.#root({
                root: `${pattern.slice(1)}${tail}`,
              })
            }`;
          } else if (Digraphs.test(pattern, DigraphTypes.Consonant)) {
            log.info("Exception identified", {
              type: PatternExceptions.Digraph.Consonant,
              value: pattern,
            });

            return `${head}${pattern.slice(0, 3)};${
              this.#root({
                root: `${pattern.slice(3)}${tail}`,
              })
            }`;
          } else if (Trigraphs.test(root)) {
            log.info("Exception identified", {
              type: PatternExceptions.Trigraph,
              value: root,
            });

            return `${head}${pattern}${tail}`;
          } else {
            log.info("No exception identified");

            return `${head}${pattern.slice(0, 2)};${
              this.#root({
                root: `${pattern.slice(2)}${tail}`,
              })
            }`;
          }
        }

        return root;
      }
      case PatternTypes.VCV: {
        log.info("Pattern match", {
          pattern: PatternTypes.VCV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (Trigraphs.test(`${head}${pattern}`)) {
            log.info("Exception identified", {
              type: PatternExceptions.Trigraph,
              value: root,
            });

            return `${head}${pattern};${this.#root({ root: tail })}`;
          } else {
            return `${head}${pattern.slice(0, 1)};${
              this.#root({
                root: `${pattern.slice(1)}${tail}`,
              })
            }`;
          }
        }

        return root;
      }
      case PatternTypes.VV: {
        log.info("Pattern match", {
          pattern: PatternTypes.VV,
        });

        const match = exec(root);

        if (match?.groups) {
          const {
            groups: { head, pattern, tail },
          } = match;

          log.debug("Match groups", {
            head,
            pattern,
            tail,
          });

          if (Quadgraphs.test(root)) {
            log.info("Exception identified", {
              type: PatternExceptions.Quadgraph,
              value: root,
            });

            return `${head}${pattern}${tail}`;
          } else if (Digraphs.test(root)) {
            log.info("Exception identified", {
              type: PatternExceptions.Digraph.Digraph,
              value: root,
            });

            return `${head}${pattern}${tail}`;
          } else {
            log.info("No exception identified");

            return `${head}${pattern.at(0)};${
              this.#root({
                root: `${pattern.at(1)}${tail}`,
              })
            }`;
          }
        }

        return root;
      }
      default: {
        log.info("No pattern match", {
          value: root,
        });

        return root;
      }
    }
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
