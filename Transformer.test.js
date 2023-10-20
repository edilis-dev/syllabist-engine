import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.204.0/testing/asserts.ts";

import { Transformer } from "./Transformer.js";

Deno.test({
  name: "should throw an error for missing data",
  fn: async () => {
    await assertRejects(() => new Transformer().transform(), TypeError);
  },
  ignore: false,
});

Deno.test({
  name: "should work with customised separator",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a+zal+ea";
        yield "aard+vark";
      },
    };

    const actual = await new Transformer(iter).transform("+");

    const expected = {
      a: {
        zal: {
          ea: "ea",
        },
      },
      aard: {
        vark: "vark",
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a syllable group",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: "a",
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return groups of adjacent syllable",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;zal;ea";
        yield "aard;vark";
      },
    };

    const actual = await new Transformer(iter).transform();

    const expected = {
      a: {
        zal: {
          ea: "ea",
        },
      },
      aard: {
        vark: "vark",
      },
    };

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a group with sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;ble";
        yield "a;bout";
      },
    };

    const actual = await new Transformer(iter).transform();

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
  name: "should return a group with combining siblings",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "wa;ter";
        yield "wa;ter;borne";
      },
    };

    const actual = await new Transformer(iter).transform();

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
        yield "a;bra;sion";
        yield "a;bra;sive";
        yield "a;bun;dance";
        yield "a;bun;dant";
      },
    };

    const actual = await new Transformer(iter).transform();

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
    "should return a group with combining syllables, concatenating syllables and adjacent sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "ac;com;pa;ni;ment";
        yield "ac;com;pa;ny";
        yield "ac;com;pa;ny;ing";
        yield "ac;com;plice";
        yield "ac;com;plish";
        yield "ac;com;plish;ment";
      },
    };

    const actual = await new Transformer(iter).transform();

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
