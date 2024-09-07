import * as log from "@std/log";
import { Charset, Symbol, Type } from "./Constants.js";
import { ReverseLookup } from "./Helpers.js";

export class Expander {
  #forward;
  #lines;

  constructor(iter) {
    log.info("Constructing new instance");

    this.#lines = iter;
  }

  async parse() {
    log.info("Starting parse");

    try {
      let value = {};

      for await (const line of this.#lines) {
        this.#forward = this.iterator(line);

        value = {
          ...value,
          ...this.#parse(),
        };
      }

      log.info("Parse finished");
      log.debug(`Parse result ${JSON.stringify(value)}`);

      return value;
    } catch (error) {
      log.error(`Parse errored with reason: ${error.message}`);

      throw error;
    }
  }

  *iterator(line) {
    let counter = 0;

    if (!line) {
      throw new TypeError("Empty line");
    }

    log.debug(`Starting iterator with ${line}`);

    while (counter < line.length) {
      log.debug(`Starting iteration ${counter}`);
      yield line[counter++];
    }
  }

  #insert({ key, stack, type, value }) {
    if (!key) {
      log.debug(
        `Inserting ${type.toUpperCase()} without key into ${
          JSON.stringify(
            value,
          )
        }`,
      );

      return value;
    } else {
      log.debug(
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
      log.debug("Stack entry found");
    } else {
      log.warning("No stack entry found");
    }

    switch (type) {
      case Type.Empty:
        target[key] = { "": "" };
        log.debug(`Insert result ${JSON.stringify(value)}`);
        return value;
      case Type.Group:
        target[key] = {};
        log.debug(`Insert result ${JSON.stringify(value)}`);
        return value;
      case Type.Value:
        target[key] = key;
        log.debug(`Insert result ${JSON.stringify(value)}`);
        return value;
      default:
        log.warning(
          `Insert result unexpectedly unchanged ${JSON.stringify(value)}`,
        );
        return value;
    }
  }

  #parse({ key = "", stack = [], value = {} } = {}) {
    const { value: char, done } = this.#forward.next();

    if (done) {
      log.debug("Parsing last character", {
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
      log.warning(`Unparseable character ${char}`);

      return this.#parse({
        key,
        stack,
        value,
      });
    }

    switch (char) {
      case Symbol.Combinator: {
        log.debug(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Empty,
          value,
        });

        const newStack = stack.concat(key);

        log.debug(`Pushed ${key} onto stack ${newStack}`);

        return this.#parse({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.Concatenator: {
        log.debug(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Group,
          value,
        });

        const newStack = stack.concat(key);

        log.debug(`Pushed ${key} onto stack ${newStack}`);

        return this.#parse({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.GroupEnd: {
        log.debug(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        const newStack = stack.slice(0, -1);

        log.debug(`Popped ${key} from stack ${newStack}`);

        return this.#parse({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.GroupStart: {
        log.debug(
          `Idefinited character ${char} as ${ReverseLookup(Symbol, char)}`,
        );

        return this.#parse({
          key,
          stack,
          value,
        });
      }
      case Symbol.Sibling: {
        log.debug(
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
        log.debug(`Identified alphabetical character ${char}`);

        return this.#parse({
          key: `${key}${char}`,
          stack,
          value,
        });
      }
    }
  }
}
