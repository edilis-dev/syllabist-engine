import { Charset, Symbol, Type } from "./Constants.js";
import { ReverseLookup } from "./Helpers.js";

export class Expander {
  #forward;
  #lines;

  constructor(iter) {
    console.info("Constructing new instance");

    this.#lines = iter;
  }

  async parse() {
    console.info("Starting parse");

    try {
      let value = {};

      for await (const line of this.#lines) {
        this.#forward = this.iterator(line);

        value = {
          ...value,
          ...this.#parse(),
        };
      }

      console.info("Parse finished");
      console.trace(`Parse result ${JSON.stringify(value)}`);

      return value;
    } catch (error) {
      console.error(`Parse errored with reason: ${error.message}`);

      throw error;
    }
  }

  *iterator(line) {
    let counter = 0;

    if (!line) {
      throw new TypeError("Empty line");
    }

    console.trace(`Starting iterator with ${line}`);

    while (counter < line.length) {
      console.trace(`Starting iteration ${counter}`);
      yield line[counter++];
    }
  }

  #insert({ key, stack, type, value }) {
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

    const target = stack.reduce(
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

  #parse({ key = "", stack = [], value = {} } = {}) {
    const { value: char, done } = this.#forward.next();

    if (done) {
      console.trace("Parsing last character", {
        character: key ? key : null,
      });

      if (key) {
        this.#insert({
          key,
          stack,
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
        stack,
        value,
      });
    }

    switch (char) {
      case Symbol.Combinator: {
        console.trace(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Empty,
          value,
        });

        const newStack = stack.concat(key);

        console.trace(`Pushed ${key} onto stack ${newStack}`);

        return this.#parse({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.Concatenator: {
        console.trace(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Group,
          value,
        });

        const newStack = stack.concat(key);

        console.trace(`Pushed ${key} onto stack ${newStack}`);

        return this.#parse({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.GroupEnd: {
        console.trace(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        const newStack = stack.slice(0, -1);

        console.trace(`Popped ${key} from stack ${newStack}`);

        return this.#parse({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.GroupStart: {
        console.trace(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        return this.#parse({
          key,
          stack,
          value,
        });
      }
      case Symbol.Sibling: {
        console.trace(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        return this.#parse({
          stack,
          value: newValue,
        });
      }
      default: {
        console.trace(`Identified alphabetical character ${char}`);

        return this.#parse({
          key: `${key}${char}`,
          stack,
          value,
        });
      }
    }
  }
}
