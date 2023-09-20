import { Expander } from "./Expander.js";

Deno.bench({
  name: "should ignore unparseable characters",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a+b=-o.u*t";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name: "should merge multiple lines",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>bout";
        yield "ac>com>[pa>[ni>[ment]|ny~[ing]]|plice|plish~[ment]]";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name: "should return a stucture from a single syllable",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name: "should return a structure with two concatenated syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>bout";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name: "should return a structure with two sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>[bout|ble]";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name: "should return a structure with two combining syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "wa>ter~[borne]";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name:
    "should return a structure with combining syllables within sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>ban>[don~[ment]|doned]";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name: "should return a structure with adjacent sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>[bra>[sion|sive]|bun>[dance|dant]]";
      },
    };

    await new Expander(iter).parse();
  },
});

Deno.bench({
  name:
    "should return a structure with combining syllables, concatenating syllables and adjacent sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "ac>com>[pa>[ni>[ment]|ny~[ing]]|plice|plish~[ment]]";
      },
    };

    await new Expander(iter).parse();
  },
});

// Deno.bench({
//   name: "should return a structure with several concatenated syllables",
//   fn: async () => {
//     await new Expander("a>dapt>a>bil>i>ty").parse();
//   },
// });

// Deno.bench({
//   name: "should return a structure with several sibling syllables",
//   fn: async () => {
//     await new Expander("a>[ble|bout|lone|long|void]").parse();
//   },
// });

// Deno.bench({
//   name: "should return a structure with several combining syllables",
//   fn: async () => {
//     await new Expander("wa>ter~[borne|course|craft|fall]").parse();
//   },
// });
