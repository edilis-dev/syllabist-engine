export const Type = Object.freeze({
  Group: "group",
  Empty: "empty",
  Value: "value",
});

export const Symbol = Object.freeze({
  Combinator: "~",
  Concatenator: ">",
  GroupEnd: "]",
  GroupStart: "[",
  Sibling: "|",
});

export const Standard = {
  JSON: "json",
  Text: "text",
};

export const Charset = new RegExp(`[${Object.values(Symbol).join("\\")}a-z-]`);
