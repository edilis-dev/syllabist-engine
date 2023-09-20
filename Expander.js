import { Charset, Symbol, Type } from "./Constants.js";
import { reverseLookup } from "./Helpers.js";

export class Expander {
  #char;
  #lines;
  #stack;
  #value;

  /**
   * @param {AsyncIterableIterator<String>} iter an asynchronous iterator returning a
   * `String` from a collection. This could be a constructed `Iterator` or a `FileReader`.
   */
  constructor(iter) {
    console.info("Constructing new instance");

    this.#lines = iter;
    this.#value = {};
  }

  /**
   * This function consumes the `Iterator` passed into the instance of `Expander`. If no `Iterator`
   * has been previously set, or it returns an invalid value this function will throw.
   *
   * @returns a Promise which may resolve with an Object or reject with an Error
   */
  async parse() {
    console.info("Starting parse");

    try {
      for await (const line of this.#lines) {
        this.#char = this.iterator(line);
        this.#stack = [];
        this.#value = {
          ...this.#value,
          ...this.#parse(this.#value),
        };
      }

      console.info("Parse finished");
      console.trace(`Parse result ${JSON.stringify(this.#value)}`);

      return this.#value;
    } catch (error) {
      console.error(`Parse errored with reason: ${error.message}`);

      throw error;
    }
  }

  /**
   * This function is public as iterators cannot be made private,
   * however it should _not_ be used directly
   */
  *iterator(line) {
    let counter = 0;

    if (!line) {
      throw new Error("Empty line");
    }

    console.trace(`Starting iterator with ${line}`);

    while (counter < line.length) {
      console.trace(`Starting iteration ${counter}`);
      yield line[counter++];
    }
  }

  #insert({ key, type, value }) {
    if (!key) {
      console.trace(
        `Inserting ${type.toUpperCase()} without key into ${
          JSON.stringify(
            value,
          )
        }`,
      );

      return value;
    } else {
      console.trace(
        `Inserting ${type.toUpperCase()} with key "${key}" into ${
          JSON.stringify(
            value,
          )
        }`,
      );
    }

    const target = this.#stack.reduce(
      (previousValue, currentValue) => previousValue[currentValue],
      value,
    );

    if (target) {
      console.trace("Stack entry found");
    } else {
      console.warn("No stack entry found");
    }

    switch (type) {
      case Type.Empty:
        target[key] = { "": "" };
        console.trace(`Insert result ${JSON.stringify(value)}`);
        return value;
      case Type.Group:
        target[key] = {};
        console.trace(`Insert result ${JSON.stringify(value)}`);
        return value;
      case Type.Value:
        target[key] = key;
        console.trace(`Insert result ${JSON.stringify(value)}`);
        return value;
      default:
        console.warn(
          `Insert result unexpectedly unchanged ${JSON.stringify(value)}`,
        );
        return value;
    }
  }

  #parse({ key = "", value = {} } = {}) {
    const { value: char, done } = this.#char.next();

    if (done) {
      console.trace("Parsing last character", {
        character: key ? key : null,
      });

      if (key) {
        this.#insert({
          key,
          type: Type.Value,
          value,
        });
      }

      return value;
    }

    if (!Charset.test(char)) {
      console.warn(`Unparseable character ${char}`);

      return this.#parse({
        key,
        value,
      });
    }

    switch (char) {
      case Symbol.Combinator: {
        console.trace(
          `Idefinited character ${char} as ${reverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          type: Type.Empty,
          value,
        });

        this.#stack.push(key);
        console.trace(`Pushed ${key} onto stack ${this.#stack}`);

        return this.#parse({
          value: newValue,
        });
      }
      case Symbol.Concatenator: {
        console.trace(
          `Idefinited character ${char} as ${reverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          type: Type.Group,
          value,
        });

        this.#stack.push(key);
        console.trace(`Pushed ${key} onto stack ${this.#stack}`);

        return this.#parse({
          value: newValue,
        });
      }
      case Symbol.GroupEnd: {
        console.trace(
          `Idefinited character ${char} as ${reverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          type: Type.Value,
          value,
        });

        this.#stack.pop();
        console.trace(`Popped ${key} from stack ${this.#stack}`);

        return this.#parse({
          value: newValue,
        });
      }
      case Symbol.GroupStart: {
        console.trace(
          `Idefinited character ${char} as ${reverseLookup(Symbol, char)}`,
        );

        return this.#parse({ key, value });
      }
      case Symbol.Sibling: {
        console.trace(
          `Idefinited character ${char} as ${reverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          type: Type.Value,
          value,
        });

        return this.#parse({
          value: newValue,
        });
      }
      default: {
        console.trace(`Identified alphabetical character ${char}`);

        return this.#parse({
          key: `${key}${char}`,
          value,
        });
      }
    }
  }
}
