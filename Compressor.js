import * as log from "./Log.js";

import { Symbol } from "./Compressor.constants.js";
import { ReverseLookup } from "./Helpers.js";

export class Compressor {
  #data;

  constructor(data) {
    log.info("Constructing");

    this.#data = data;
  }

  compress() {
    log.info("Compressing");

    try {
      let value = [];

      for (const key in this.#data) {
        log.info("Starting iteration", {
          key,
        });

        if (typeof this.#data[key] === "object") {
          value = [...value, this.#object({ key, value: this.#data }).join("")];
        } else {
          value = [...value, this.#string({ key, value: this.#data }).join("")];
        }

        log.debug("Insert result", {
          key,
          value: this.#data,
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

  #compress({ stack = [], value }) {
    for (const key in value) {
      log.debug("Starting iteration", {
        key,
      });

      if (typeof value[key] === "object") {
        log.debug("Identified object", {
          key,
          type: "object",
        });
        this.#object({ key, stack, value });
      } else if (typeof value[key] === "string") {
        log.debug("Identified string", {
          key,
          type: "string",
        });
        this.#string({ key, stack, value });
      } else {
        log.warn("Identified uncompressable", {
          key,
          type: typeof value[key],
        });
        continue;
      }

      if (key && this.#isSibling({ value }) && !this.#isLast({ key, value })) {
        log.debug("Identified sibling not in last place", {
          key,
        });
        stack.push(Symbol.Sibling);
      }
    }

    return stack;
  }

  #isConcatenator({ value }) {
    const isConcatenator = Object.keys(value).every((value) => value !== "");
    if (isConcatenator) {
      log.debug("Concatenator", {
        value,
      });
    }
    return isConcatenator;
  }

  #isCombinator({ value }) {
    const isCombinator = Object.keys(value).some((value) => value === "");
    if (isCombinator) {
      log.debug("Combinator", {
        value,
      });
    }
    return isCombinator;
  }

  #isLast({ key, value }) {
    const isLast = Object.keys(value).at(-1) === key;
    if (isLast) {
      log.debug("Last", {
        value,
      });
    }
    return isLast;
  }

  #isSibling({ value }) {
    // prettier-ignore
    const isSibling = Object.keys(value).filter((value) => value !== "").length > 1;
    if (isSibling) {
      log.debug("Sibling", {
        value,
      });
    }
    return isSibling;
  }

  #object({ key, stack = [], value }) {
    if (this.#isCombinator({ value: value[key] })) {
      log.debug("Identified relationship", {
        key,
        relationship: ReverseLookup(Symbol, Symbol.Combinator),
      });

      stack.push(key, Symbol.Combinator);
      log.debug("Starting group", {
        key,
      });

      stack.push(Symbol.GroupStart);
      log.debug("Starting compress", {
        key,
      });

      this.#compress({ stack, value: value[key] });
      log.debug("Finished compress", {
        key,
      });

      stack.push(Symbol.GroupEnd);
      log.debug("Finished group", {
        key,
      });
    } else if (this.#isConcatenator({ value: value[key] })) {
      log.debug("Identified relationship", {
        key,
        relationship: ReverseLookup(Symbol, Symbol.Concatenator),
      });

      stack.push(key, Symbol.Concatenator);
      log.debug("Starting group", {
        key,
      });

      stack.push(Symbol.GroupStart);
      log.debug("Starting compress", {
        key,
      });

      this.#compress({ stack, value: value[key] });
      log.debug("Finished compress", {
        key,
      });

      stack.push(Symbol.GroupEnd);
      log.debug("Finished group", {
        key,
      });
    } else {
      log.debug("Failed to identify relationship", {
        key,
      });
    }

    return stack;
  }

  #string({ key, stack = [] }) {
    stack.push(key);

    return stack;
  }
}
