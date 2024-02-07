export class Transformer {
  #lines;

  constructor(iter) {
    console.info("Constructing new instance");

    this.#lines = iter;
  }

  async transform(separator = ";") {
    console.info("Starting transformer");
    console.trace(`Separation character ${separator}`);

    try {
      let value = {};

      for await (const line of this.#lines) {
        console.trace(`Starting iteration with ${line}`);

        const keys = line.split(separator);

        if (keys.length > 1) {
          console.trace(`Line with ${keys.length} parts`);
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

        console.trace(`Insert result ${JSON.stringify(value)}`);
      }

      console.info("Transform finished");
      console.trace(`Transform result ${JSON.stringify(value)}`);

      return value;
    } catch (error) {
      console.error(`Transform errored with reason ${error.message}`);

      throw error;
    }
  }

  #insert({ key = "", keys, value }) {
    if (!key) {
      console.trace("Exhausted keys list");

      return value;
    } else if (typeof value[key] === "object") {
      console.trace(`Entering existing key ${key} in ${JSON.stringify(value)}`);

      return {
        ...value,
        [key]: this.#insert({
          key: keys.at(0),
          keys: keys.splice(1),
          value: value[key],
        }),
      };
    } else if (typeof value[key] === "string") {
      console.trace(`Found sibling of key ${key} in ${JSON.stringify(value)}`);

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
      console.trace(`Inserting key ${key} into ${JSON.stringify(value)}`);

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
