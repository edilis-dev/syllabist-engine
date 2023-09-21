import { Symbol } from "./Constants.js";
import { reverseLookup } from "./Helpers.js";

export class Compressor {
  #data;
  #lines;
  #stack;

  /**
   * @param {Object} data to be parsed into flat map format
   */
  constructor(data) {
    console.info("Constructing new instance");

    this.#data = data;
  }

  /**
   * @returns a `String` containing the parsed data in flat map format
   */
  parse() {
    console.info("Starting parse");

    this.#lines = [];

    for (const key in this.#data) {
      console.trace(`Found key ${key} in ${JSON.stringify(this.#data)}`);

      this.#stack = [];

      if (typeof this.#data[key] === "object") {
        this.#object({ key, value: this.#data });
      } else {
        this.#string({ key, value: this.#data });
      }

      this.#lines = [...this.#lines, this.#stack.join("")];
    }

    console.info("Parse finished");
    console.trace(`Parse result ${JSON.stringify(this.#lines)}`);

    return this.#lines.join("\n");
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

  #object({ key, value }) {
    if (this.#isCombinator({ value: value[key] })) {
      console.trace(
        `Identified relationship for key ${key} as ${
          reverseLookup(
            Symbol,
            Symbol.Combinator,
          )
        }`,
      );
      this.#stack.push(key, Symbol.Combinator);

      console.trace(`Starting group of ${key}`);
      this.#stack.push(Symbol.GroupStart);
      console.trace(`Starting parse of ${key}`);
      this.#parse({ value: value[key] });
      console.trace(`Finished parse of ${key}`);
      this.#stack.push(Symbol.GroupEnd);
      console.trace(`Finished group of ${key}`);
    } else if (this.#isConcatenator({ value: value[key] })) {
      console.trace(
        `Identified relationship for ${key} as ${
          reverseLookup(
            Symbol,
            Symbol.Concatenator,
          )
        }`,
      );
      this.#stack.push(key, Symbol.Concatenator);

      console.trace(`Starting group of ${key}`);
      this.#stack.push(Symbol.GroupStart);
      console.trace(`Starting parse of ${key}`);
      this.#parse({ value: value[key] });
      console.trace(`Finished parse of ${key}`);
      this.#stack.push(Symbol.GroupEnd);
    } else {
      console.trace(`Failed to identify relationship for key ${key}`);
    }
  }

  #parse({ value }) {
    for (const key in value) {
      console.trace(`Starting iteration with key ${key}`);

      if (typeof value[key] === "object") {
        console.trace(`Identified ${key} as object`);
        this.#object({ key, value });
      } else if (typeof value[key] === "string") {
        console.trace(`Identified ${key} as string`);
        this.#string({ key, value });
      } else {
        console.warn(
          `Identified ${key} as unparseable type ${typeof value[key]}`,
        );
        continue;
      }

      if (key && this.#isSibling({ value }) && !this.#isLast({ key, value })) {
        console.trace(`Identified ${key} as a sibling not in last place `);
        this.#stack.push(Symbol.Sibling);
      }
    }
  }

  #string({ key }) {
    this.#stack.push(key);
  }
}
