import { Symbol } from "./Constants.js";
import { ReverseLookup } from "./Helpers.js";

export class Compressor {
  #data;

  constructor(data) {
    console.info("Constructing new instance");

    this.#data = data;
  }

  parse() {
    console.info("Starting parse");

    let value = [];

    for (const key in this.#data) {
      console.trace(`Found key ${key} in ${JSON.stringify(this.#data)}`);

      if (typeof this.#data[key] === "object") {
        value = [...value, this.#object({ key, value: this.#data }).join("")];
      } else {
        value = [...value, this.#string({ key, value: this.#data }).join("")];
      }
    }

    console.info("Parse finished");
    console.trace(`Parse result ${JSON.stringify(value)}`);

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
      console.trace(
        `Identified relationship for key ${key} as ${
          ReverseLookup(
            Symbol,
            Symbol.Combinator,
          )
        }`,
      );
      stack.push(key, Symbol.Combinator);

      console.trace(`Starting group of ${key}`);
      stack.push(Symbol.GroupStart);
      console.trace(`Starting parse of ${key}`);
      this.#parse({ stack, value: value[key] });
      console.trace(`Finished parse of ${key}`);
      stack.push(Symbol.GroupEnd);
      console.trace(`Finished group of ${key}`);
    } else if (this.#isConcatenator({ value: value[key] })) {
      console.trace(
        `Identified relationship for ${key} as ${
          ReverseLookup(
            Symbol,
            Symbol.Concatenator,
          )
        }`,
      );
      stack.push(key, Symbol.Concatenator);

      console.trace(`Starting group of ${key}`);
      stack.push(Symbol.GroupStart);
      console.trace(`Starting parse of ${key}`);
      this.#parse({ stack, value: value[key] });
      console.trace(`Finished parse of ${key}`);
      stack.push(Symbol.GroupEnd);
    } else {
      console.trace(`Failed to identify relationship for key ${key}`);
    }

    return stack;
  }

  #parse({ stack = [], value }) {
    for (const key in value) {
      console.trace(`Starting iteration with key ${key}`);

      if (typeof value[key] === "object") {
        console.trace(`Identified ${key} as object`);
        this.#object({ key, stack, value });
      } else if (typeof value[key] === "string") {
        console.trace(`Identified ${key} as string`);
        this.#string({ key, stack, value });
      } else {
        console.warn(
          `Identified ${key} as unparseable type ${typeof value[key]}`,
        );
        continue;
      }

      if (key && this.#isSibling({ value }) && !this.#isLast({ key, value })) {
        console.trace(`Identified ${key} as a sibling not in last place `);
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
