import * as log from "./Log.js";

import { Charset, Symbol, Type } from "./Expander.constants.js";
import { ReverseLookup } from "./Helpers.js";

export class Expander {
  #forward;
  #lines;

  constructor(iter) {
    log.info("Constructing");

    this.#lines = iter;
  }

  async expand() {
    log.info("Expanding");

    try {
      let value = {};

      for await (const line of this.#lines) {
        log.info("Starting iteration", {
          line,
        });

        this.#forward = this.iterator(line);

        value = {
          ...value,
          ...this.#expand(),
        };

        log.debug("Insert result", {
          value,
        });
      }

      log.info("Result", {
        value,
      });

      return value;
    } catch (error) {
      log.error("Error", {
        reason: error.message,
      });

      throw error;
    }
  }

  *iterator(line) {
    let counter = 0;

    if (!line) {
      throw new TypeError("Empty line");
    }

    log.debug("Starting iterator", {
      line,
    });

    while (counter < line.length) {
      log.debug("Iteration", {
        index: counter,
      });

      yield line[counter++];
    }
  }

  #insert({ key, stack, type, value }) {
    if (!key) {
      log.debug("Inserting without key", {
        type: type.toUpperCase(),
        value,
      });

      return value;
    } else {
      log.debug("Inserting with key", {
        type: type.toUpperCase(),
        value,
      });
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
        log.debug("Insert result", {
          value,
        });
        return value;
      case Type.Group:
        target[key] = {};
        log.debug("Insert result", {
          value,
        });
        return value;
      case Type.Value:
        target[key] = key;
        log.debug("Insert result", {
          value,
        });
        return value;
      default:
        log.warning(`Insert result unexpectedly unchanged`, {
          value,
        });
        return value;
    }
  }

  #expand({ key = "", stack = [], value = {} } = {}) {
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
      log.warn("Unexpandable character", {
        char,
      });

      return this.#expand({
        key,
        stack,
        value,
      });
    }

    switch (char) {
      case Symbol.Combinator: {
        log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbol, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Empty,
          value,
        });

        const newStack = stack.concat(key);

        log.debug("Pushed key onto stack", {
          key,
          stack: newStack,
        });

        return this.#expand({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.Concatenator: {
        log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbol, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Group,
          value,
        });

        const newStack = stack.concat(key);

        log.debug("Pushed key onto stack", {
          key,
          stack: newStack,
        });

        return this.#expand({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.GroupEnd: {
        log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbol, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        const newStack = stack.slice(0, -1);

        log.debug("Popped from stack", {
          key,
          stack: newStack,
        });

        return this.#expand({
          stack: newStack,
          value: newValue,
        });
      }
      case Symbol.GroupStart: {
        log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbol, char),
        });

        return this.#expand({
          key,
          stack,
          value,
        });
      }
      case Symbol.Sibling: {
        log.debug("Identified character", {
          char,
          symbol: ReverseLookup(Symbol, char),
        });

        const newValue = this.#insert({
          key,
          stack,
          type: Type.Value,
          value,
        });

        return this.#expand({
          stack,
          value: newValue,
        });
      }
      default: {
        log.debug("Identified alphabetical character", {
          char,
        });

        return this.#expand({
          key: `${key}${char}`,
          stack,
          value,
        });
      }
    }
  }
}
