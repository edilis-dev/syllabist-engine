import * as log from "@std/log";
import { Symbol } from "./Constants.js";
import { ReverseLookup } from "./Helpers.js";

export class Compressor {
  #data;

  constructor(data) {
    log.info("Constructing new instance");

    this.#data = data;
  }

  parse() {
    log.info("Starting parse");

    let value = [];

    for (const key in this.#data) {
      log.debug(`Found key ${key} in ${JSON.stringify(this.#data)}`);

      if (typeof this.#data[key] === "object") {
        value = [...value, this.#object({ key, value: this.#data }).join("")];
      } else {
        value = [...value, this.#string({ key, value: this.#data }).join("")];
      }
    }

    log.info("Parse finished");
    log.debug(`Parse result ${JSON.stringify(value)}`);

    return value.join("\n");
  }

  #isConcatenator({ value }) {
    return Object.keys(value).every((value) => value !== "");
  }

  #isCombinator({ value }) {
    return Object.keys(value).some((value) => value === "");
  }

  #isLast({ key, value }) {
    return Object.keys(value).at(-1) === key;
  }

  #isSibling({ value }) {
    return Object.keys(value).filter((value) => value !== "").length > 1;
  }

  #object({ key, stack = [], value }) {
    if (this.#isCombinator({ value: value[key] })) {
      log.debug(
        `Identified relationship for key ${key} as ${ReverseLookup(
          Symbol,
          Symbol.Combinator,
        )}`,
      );
      stack.push(key, Symbol.Combinator);

      log.debug(`Starting group of ${key}`);
      stack.push(Symbol.GroupStart);
      log.debug(`Starting parse of ${key}`);
      this.#parse({ stack, value: value[key] });
      log.debug(`Finished parse of ${key}`);
      stack.push(Symbol.GroupEnd);
      log.debug(`Finished group of ${key}`);
    } else if (this.#isConcatenator({ value: value[key] })) {
      log.debug(
        `Identified relationship for ${key} as ${ReverseLookup(
          Symbol,
          Symbol.Concatenator,
        )}`,
      );
      stack.push(key, Symbol.Concatenator);

      log.debug(`Starting group of ${key}`);
      stack.push(Symbol.GroupStart);
      log.debug(`Starting parse of ${key}`);
      this.#parse({ stack, value: value[key] });
      log.debug(`Finished parse of ${key}`);
      stack.push(Symbol.GroupEnd);
    } else {
      log.debug(`Failed to identify relationship for key ${key}`);
    }

    return stack;
  }

  #parse({ stack = [], value }) {
    for (const key in value) {
      log.debug(`Starting iteration with key ${key}`);

      if (typeof value[key] === "object") {
        log.debug(`Identified ${key} as object`);
        this.#object({ key, stack, value });
      } else if (typeof value[key] === "string") {
        log.debug(`Identified ${key} as string`);
        this.#string({ key, stack, value });
      } else {
        log.warning(
          `Identified ${key} as unparseable type ${typeof value[key]}`,
        );
        continue;
      }

      if (key && this.#isSibling({ value }) && !this.#isLast({ key, value })) {
        log.debug(`Identified ${key} as a sibling not in last place `);
        stack.push(Symbol.Sibling);
      }
    }

    return stack;
  }

  #string({ key, stack = [] }) {
    stack.push(key);

    return stack;
  }
}
