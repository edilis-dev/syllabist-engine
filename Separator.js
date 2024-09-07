import * as log from "@std/log";
import { CompoundWords, Prefixes, Suffixes } from "./Separator.constants.js";
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
    log.info("Constructing new instance");

    this.#lines = iter;
  }

  async parse() {
    log.info("Starting parse");

    try {
      let value = [];

      for await (const line of this.#lines) {
        this.#forwardIndex = 0;
        this.#forward = this.iterator(line);

        this.#reverseIndex = line.length;
        this.#reverse = this.reverseIterator(line);

        value = [
          ...value,
          this.#parse({ line }).join(";").replace(/^;|;$/g, ""),
        ];
      }

      log.info("Parse finished");
      log.debug(`Parse result ${JSON.stringify(value)}`);

      return value.join("\n");
    } catch (error) {
      log.error(`Parse errored with reason: ${error.message}`);

      throw error;
    }
  }

  *iterator(line) {
    if (!line) {
      throw new TypeError("Empty line");
    }

    log.debug(`Starting iterator with ${line}`);

    while (this.#forwardIndex < this.#reverseIndex - this.#overlap) {
      log.debug(`Starting iteration ${this.#forwardIndex}`);

      yield this.#forwardIndex++;
    }
  }

  *reverseIterator(line) {
    if (!line) {
      throw new Error("Empty line");
    }

    log.debug(`Starting reverse iterator with ${line}`);

    while (this.#reverseIndex > this.#forwardIndex - this.#overlap) {
      log.debug(`Starting reseverse iteration ${this.#reverseIndex}`);

      yield this.#reverseIndex--;
    }
  }

  #parse({ cache = {}, line }) {
    const forward = this.#forward.next();
    const backward = this.#reverse.next();

    if (backward.done && forward.done) {
      return [cache.prefix, this.#root(cache), cache.suffix];
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

      return this.#parse({
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
    const prefix = line.slice(0, index);

    if (Prefixes.has(prefix)) {
      return [index, prefix];
    } else {
      return [cache.start, cache.prefix];
    }
  }

  #root({ root }) {
    if (root.length <= this.#minLength) {
      return root;
    }

    if (CompoundWords.has(root)) {
      const [a, b] = CompoundWords.get(root);

      return `${this.#root({ root: a })};${this.#root({ root: b })}`;
    }

    const { BlendSounds, Digraphs, GluedSounds, Quadgraphs, Trigraphs } =
      Groups;

    const { LE, VCCCCV, VCCCV, VCCV, VCV, VV } = Patterns;

    const tokens = mergeRepeatedCharacters(root);

    if (LE.test(tokens)) {
      const match = LE.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, end },
        } = match;

        return `${beginning};${this.#root({ root: end })}`;
      }
    } else if (VCCCCV.test(tokens)) {
      const match = VCCCCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        return `${beginning}${middle.at(0)};${middle.at(1)}${middle.at(2)}${middle.at(
          3,
        )}${end}`;
      }
    } else if (VCCCV.test(tokens)) {
      const match = VCCCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        if (
          BlendSounds.test(`${middle.at(0)}${middle.at(1)}`) ||
          Digraphs.test(`${middle.at(0)}${middle.at(1)}`)
        ) {
          return `${beginning}${middle.at(0)}${middle.at(1)};${this.#root({ root: `${middle.at(2)}${end}` })}`;
        } else if (
          BlendSounds.test(`${middle.at(1)}${middle.at(2)}`) ||
          Digraphs.test(`${middle.at(1)}${middle.at(2)}`)
        ) {
          return `${beginning}${middle.at(0)};${this.#root({ root: `${middle.at(1)}${middle.at(2)}${end}` })}`;
        } else if (
          GluedSounds.test(`${beginning.at(-1)}${middle.slice(0, -1)}`)
        ) {
          return `${beginning.slice(0, -1)}${beginning.at(-1)}${middle.at(0)}${middle.at(1)};${this.#root({ root: `${middle.at(2)}${end}` })}`;
        } else {
          return `${beginning}${middle.at(0)};${this.#root({ root: `${middle.at(1)}${middle.at(2)}${end}` })}`;
        }
      }
    } else if (VCCV.test(tokens)) {
      const match = VCCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        // deno-lint-ignore no-debugger
        debugger;

        // if (BlendSounds.test(root)) {
        //   return `${beginning};${middle}${this.#root({ root: end })}`;
        // } else if (Digraphs.test(root)) {
        //   return `${beginning}${middle};${this.#root({ root: end })}`;
        // } else if (Trigraphs.test(root)) {
        //   return `${beginning}${middle}${end}`;
        // } else {
        return `${beginning}${middle.at(0)};${this.#root({ root: `${middle.at(1)}${end}` })}`;
        // }
      }
    } else if (VCV.test(tokens)) {
      const match = VCV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, middle, end },
        } = match;

        return `${beginning};${middle}${this.#root({ root: end })}`;
      }
    } else if (VV.test(tokens)) {
      const match = VV.exec(root);

      if (match?.groups) {
        const {
          groups: { beginning, end },
        } = match;

        if (Quadgraphs.test(root)) {
          return `${beginning}${end}`;
        } else if (Trigraphs.test(root)) {
          return `${beginning}${end}`;
        } else {
          return `${beginning};${this.#root({ root: end })}`;
        }
      }
    }

    return root;
  }

  #suffix({ cache, index, line }) {
    const suffix = line.slice(index, line.length);

    if (Suffixes.has(suffix)) {
      return [index, suffix];
    } else {
      return [cache.end, cache.suffix];
    }
  }
}
