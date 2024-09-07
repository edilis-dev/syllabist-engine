import { assertEquals } from "@std/assert";
import { Separator } from "./Separator.js";

Deno.test({
  name: "should return a single syllable word complete",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "car";
      },
    };

    const actual = await new Separator(iter).parse();

    const expected = "car";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a word with a prefix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "refresh";
      },
    };

    const actual = await new Separator(iter).parse();

    const expected = "re;fresh";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a word with a sufffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "dainty";
      },
    };

    const actual = await new Separator(iter).parse();

    const expected = "dain;ty";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a word with a prefix and a sufffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "deify";
      },
    };

    const actual = await new Separator(iter).parse();

    const expected = "de;ify";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a word with a prefix, a root and a sufffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "destabilise";
      },
    };

    const actual = await new Separator(iter).parse();

    const expected = "de;sta;bil;ise";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should correctly separate split digraphs",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "destabilise";
      },
    };

    const actual = await new Separator(iter).parse();

    const expected = "de;sta;bil;ise";

    assertEquals(actual, expected);
  },
  ignore: false,
});

// MISSING:
// digraphs
// trigraphs: hatch, fudge
// quadgraphs: laugh, naught / cough, through / eight weigh
// blends
// glues
// compounds
// problem child: giraffe, conglomerate
// VCCCCV
// VCCCV
// VCCV
// VCV
// VV: lion
// LE: candle, cradle
