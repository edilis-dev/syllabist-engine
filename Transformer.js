/**
 * The Transformer <code>class</code> is responsible for expanding a collection of separated syllables into a <code>JSON</code> structure.
 *
 * @see The output of <code>transformer</code> is expected to be identical to the output of [Expander]{@linkcode Expander}. However, this class should
 * be used for a generic word list with a single separator character. <code>Expander</code> should be solely used for compressed Syllabist format.
 */
export class Transformer {
  /**
   * <code>AsyncIterableIterator</code> which returns a line of text representing a single word split by a common separator character.
   *
   * @alias &num;lines
   * @memberof Transformer
   * @private
   * @type {AsyncIterableIterator<string>}
   */
  #lines;

  /**
   * @param {AsyncIterableIterator<string>} iter A collection of words split by a common separator character.
   * @public
   */
  constructor(iter) {
    console.info("Constructing new instance");

    this.#lines = iter;
  }

  /**
   * Iterates through all the lines of text provided by <code><a href="##lines">#lines</a></code>. Creates a new JSON object containing nested syllables which when traversed in a
   * depth-first search represent a complete word.
   *
   * @async
   * @param {string} [separator=;] Common separator character
   * @public
   * @returns {Promise<Record<string, string>>} Resolves with the expanded Syllabist structure.
   */
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

  /**
   * Inserts key into value, the depth at which the current value is inserted is determined by the keys.
   *
   * @alias &num;insert
   * @function
   * @memberof Transformer
   * @param {Object} properties
   * @param {string} [properties.key=""] The current character set which represents part of a Syllabist word
   * @param {Array<string>} properties.keys The sets of characters which represent the ancestors of the current set of characters
   * @param {Record<string, unknown>} properties.value The JSON structure to insert the set
   * @private
   * @returns {Record<string, string>}
   */
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
