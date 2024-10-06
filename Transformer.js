import * as log from "./Log.js";

export class Transformer {
  #lines;

  constructor(iter) {
    log.info("Constructing");

    this.#lines = iter;
  }

  async transform(separator = ";") {
    log.debug("Transforming", {
      separator,
    });

    try {
      let value = {};

      for await (const line of this.#lines) {
        log.info("Starting iteration", {
          line,
        });

        const keys = line.split(separator);

        if (keys.length > 1) {
          log.debug("Line has parts", { parts: keys.length });
        } else if (keys.length === 1) {
          log.warn("Line has too few parts", {
            line,
            parts: keys.length,
          });
        }

        value = {
          ...value,
          ...this.#insert({
            key: keys.at(0),
            keys: keys.splice(1),
            value,
          }),
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

  #insert({ key = "", keys, value }) {
    if (!key) {
      log.debug("Exhausted keys list");

      return value;
    } else if (typeof value[key] === "object") {
      log.debug("Entering existing key", {
        key,
        value,
      });

      return {
        ...value,
        [key]: this.#insert({
          key: keys.at(0),
          keys: keys.splice(1),
          value: value[key],
        }),
      };
    } else if (typeof value[key] === "string") {
      log.debug("Found sibling", {
        key,
        value,
      });

      const next = keys.at(0);

      return this.#insert({
        keys,
        value: {
          ...value,
          [key]: keys.length
            ? {
              "": "",
              [next]: next,
            }
            : key,
        },
      });
    } else {
      log.debug("Inserting key", {
        key,
        value,
      });

      return this.#insert({
        key,
        keys,
        value: {
          ...value,
          [key]: keys.length ? {} : key,
        },
      });
    }
  }
}
