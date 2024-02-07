export const Type = Object.freeze({
  Empty: "empty",
  Group: "group",
  Value: "value",
});

export const Symbol = Object.freeze({
  Combinator: "~",
  Concatenator: ">",
  GroupEnd: "]",
  GroupStart: "[",
  Sibling: "|",
});

export const Standard = Object.freeze({
  JSON: "json",
  Text: "text",
});

export const Charset = new RegExp(`[${Object.values(Symbol).join("\\")}a-z-]`);
