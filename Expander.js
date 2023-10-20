import { Charset, Symbol, Type } from "./Constants.js";
import { ReverseLookup } from "./Helpers.js";

/**
 * The Expander <code>class</code> is responsible for expanding a Syllabist structure into a <code>JSON</code> structure.
 */
export class Expander {
  /**
   * <code>Iterator</code> which returns a character at a time from the current line.
   *
   * @alias &num;forward
   * @memberof Expander
   * @private
   * @type {Iterator<string>}
   */
  #forward;

  /**
   * <code>AsyncIterableIterator</code> which returns a line of text representing a single Syllabist word.
   *
   * @alias &num;lines
   * @memberof Expander
   * @private
   * @type {AsyncIterableIterator<string>}
   */
  #lines;

  /**
   * @param {AsyncIterableIterator<string>} iter A collection of Syllabist words.
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
   * @returns {Promise<Record<string, string>>} Resolves with the expanded Syllabist structure.
   * @throws {TypeError} If <a href="#*iterator"><code>*iterator</code></a> returns an empty line.
   */
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

  /**
   * Iterates through a given <code>string</code> a character at a time.
   *
   * @alias &ast;iterator
   * @memberof Expander
   * @generator
   * @private
   * @param {string} line The current line being expanded.
   * @returns {Generator<string, void, void>}
   * @yields {string}
   */
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

  /**
   * Inserts key into value, the depth at which the current value is inserted is determined by the stack and the type of value to be inserted is
   * determined by type.
   *
   * @alias &num;insert
   * @function
   * @memberof Expander
   * @param {Object} [properties={}]
   * @param {string} properties.key The current character set which represents part of a Syllabist word
   * @param {Array<string>} properties.stack The sets of characters which represent the ancestors of the current set of characters
   * @param {string} properties.type The type of value to be inserted into the JSON structure
   * @param {Record<string, string>} properties.value The JSON structure to insert the set
   * @private
   * @returns {Record<string, string>}
   * @see [Expander#Type]{@linkcode module:Constants.Type}
   */
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

  /**
   * Recursively reads the characters of the current line by calling <code><a href="##forward">#forward</a></code>  and either inserts the character directly
   * or adds the character to the current stack. Once a stack is finalised it will be inserted as a group.
   *
   * @alias &num;parse
   * @function
   * @memberof Expander
   * @param {Object} [properties={}]
   * @param {string} [properties.key=""] properties.key The current character set which represents part of a Syllabist word
   * @param {Array<string>} [properties.stack=[]] properties.stack The sets of characters which represent the ancestors of the current set of characters
   * @param {Record<string,string>} [properties.value={}] properties.value The JSON structure to insert the set
   * @private
   * @returns {Record<string, string>}
   */
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
