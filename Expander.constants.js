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

export const Charset = new RegExp(`[${Object.values(Symbol).join("\\")}a-z-]`);
