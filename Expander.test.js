import { assertEquals, assertRejects } from "@std/assert";

import { Expander } from "./Expander.js";

Deno.test({
  name: "should throw an error for missing data",
  fn: async () => {
    await assertRejects(() => new Expander().parse(), TypeError);
  },
  ignore: false,
});

Deno.test({
  name: "should throw an error when for empty line",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "";
      },
    };

    await assertRejects(
      () => new Expander(iter).parse(),
      TypeError,
      "Empty line",
    );
  },
  ignore: false,
});

Deno.test({
  name: "should ignore unparseable characters",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a+b=-o.u*t";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      "ab-out": "ab-out",
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should merge multiple lines",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>bout";
        yield "ac>com>[pa>[ni>[ment]|ny~[ing]]|plice|plish~[ment]]";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      a: {
        bout: "bout",
      },
      ac: {
        com: {
          pa: {
            ni: {
              ment: "ment",
            },
            ny: {
              "": "",
              ing: "ing",
            },
          },
          plice: "plice",
          plish: {
            "": "",
            ment: "ment",
          },
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a stucture with a single syllable",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      a: "a",
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with two concatenated syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>bout";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      a: {
        bout: "bout",
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with two sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>[bout|ble]";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      a: {
        ble: "ble",
        bout: "bout",
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with two combining syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "wa>ter~[borne]";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      wa: {
        ter: {
          "": "",
          borne: "borne",
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name:
    "should return a structure with combining syllables within sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>ban>[don~[ment]|doned]";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      a: {
        ban: {
          don: {
            "": "",
            ment: "ment",
          },
          doned: "doned",
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a structure with adjacent sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a>[bra>[sion|sive]|bun>[dance|dant]]";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      a: {
        bra: {
          sion: "sion",
          sive: "sive",
        },
        bun: {
          dance: "dance",
          dant: "dant",
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name:
    "should return a structure with combining syllables, concatenating syllables and adjacent sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "ac>com>[pa>[ni>[ment]|ny~[ing]]|plice|plish~[ment]]";
      },
    };

    const actual = await new Expander(iter).parse();

    const expected = {
      ac: {
        com: {
          pa: {
            ni: {
              ment: "ment",
            },
            ny: {
              "": "",
              ing: "ing",
            },
          },
          plice: "plice",
          plish: {
            "": "",
            ment: "ment",
          },
        },
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});
