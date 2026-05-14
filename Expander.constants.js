export const Type = Object.freeze({
  Empty: "empty",
  Group: "group",
  Value: "value",
});

export const Symbols = Object.freeze({
  Combinator: "~",
  Concatenator: ">",
  GroupEnd: "]",
  GroupStart: "[",
  Sibling: "|",
});

export const Charset = new RegExp(`[${Object.values(Symbols).join("\\")}a-z-]`);
