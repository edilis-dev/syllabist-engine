import * as log from "@std/log";

export class Transformer {
  #lines;

  constructor(iter) {
    log.info("Constructing new instance");

    this.#lines = iter;
  }

  async transform(separator = ";") {
    log.info("Starting transformer");
    log.debug(`Separation character ${separator}`);

    try {
      let value = {};

      for await (const line of this.#lines) {
        log.debug(`Starting iteration with ${line}`);

        const keys = line.split(separator);

        if (keys.length > 1) {
          log.debug(`Line with ${keys.length} parts`);
        } else if (keys.length === 1) {
          console.warn(`Line ${line} has only ${keys.length} part`);
        }

        value = {
          ...value,
          ...this.#insert({
            key: keys.at(0),
            keys: keys.splice(1),
            value,
          }),
        };

        log.debug(`Insert result ${JSON.stringify(value)}`);
      }

      log.info("Transform finished");
      log.debug(`Transform result ${JSON.stringify(value)}`);

      return value;
    } catch (error) {
      log.error(`Transform errored with reason ${error.message}`);

      throw error;
    }
  }

  #insert({ key = "", keys, value }) {
    if (!key) {
      log.debug("Exhausted keys list");

      return value;
    } else if (typeof value[key] === "object") {
      log.debug(`Entering existing key ${key} in ${JSON.stringify(value)}`);

      return {
        ...value,
        [key]: this.#insert({
          key: keys.at(0),
          keys: keys.splice(1),
          value: value[key],
        }),
      };
    } else if (typeof value[key] === "string") {
      log.debug(`Found sibling of key ${key} in ${JSON.stringify(value)}`);

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
      log.debug(`Inserting key ${key} into ${JSON.stringify(value)}`);

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
