export class Transformer {
  #lines;
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
   * @param {String} separator character representing the break in lines
   * @returns a Promise which may resolve with an Object or reject with an Error
   */
  async transform(separator = ";") {
    console.info("Starting transformer");
    console.trace(`Separation character ${separator}`);

    try {
      for await (const line of this.#lines) {
        console.trace(`Starting iteration with ${line}`);

        const keys = line.split(separator);

        if (keys.length > 1) {
          console.trace(`Line with ${keys.length} parts`);
        } else if (keys.length == 1) {
          console.warn(`Line ${line} has only ${keys.length} part`);
        }

        this.#value = this.#insert({
          key: keys.at(0),
          keys: keys.splice(1),
          value: this.#value,
        });

        console.trace(`Insert result ${JSON.stringify(this.#value)}`);
      }

      console.info("Transform finished");
      console.trace(`Transform result ${JSON.stringify(this.#value)}`);

      return this.#value;
    } catch (error) {
      console.error(`Transform errored with reason ${error.message}`);

      throw error;
    }
  }

  #insert({ key, keys, value }) {
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
