/**
 * @module Constants
 */

/**
 * Key identification types.
 *
 * @see <a href="Expander.html##insert"><code>Expander#insert</code></a>
 */
export const Type = Object.freeze({
  Group: "group",
  Empty: "empty",
  Value: "value",
});

/**
 * Group identification symbols.
 *
 * @see <a href="Compressor.html##object"><code>Compressor#object</code></a>
 * @see <a href="Expander.html##parse"><code>Expander#parse</code></a>
 */
export const Symbol = Object.freeze({
  Combinator: "~",
  Concatenator: ">",
  GroupEnd: "]",
  GroupStart: "[",
  Sibling: "|",
});

/**
 * Supported standardisation formats.
 *
 * @see [Format#Standardise]{@linkcode module:Format.Standardise}
 */
export const Standard = {
  JSON: "json",
  Text: "text",
};

/**
 * Valid character set, including alphabetical characters, hyphens and [Symbols]{@linkcode module:Constants.Symbol}.
 * @see <a href="Expander.html##parse"><code>Expander#parse</code></a>
 */
export const Charset = new RegExp(`[${Object.values(Symbol).join("\\")}a-z-]`);
