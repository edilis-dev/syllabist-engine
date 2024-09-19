import { assertEquals, assertRejects } from "@std/assert";

import { Separator } from "./Separator.js";

Deno.test({
  name: "should throw an error for missing data",
  fn: async () => {
    await assertRejects(() => new Separator().separate(), TypeError);
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
      () => new Separator(iter).separate(),
      TypeError,
      "Empty line",
    );
  },
  ignore: false,
});

Deno.test({
  name: "should return separated LE pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "candle";
        yield "cradle";
        yield "handle";
        yield "saddle";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "can;dle\ncra;dle\nhan;dle\nsad;dle";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCCCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "construct";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "con;struct";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "complex";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `com;plex`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCCV Pattern with blend",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "complex";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `com;plex`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCCV Pattern with glued",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "bankrupt";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `bank;rupt`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "basket";
        yield "blossom";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `bas;ket\nblos;som`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCV Pattern with blend",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "secret";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `se;cret`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCV Pattern with digraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "gather";
        yield "rocket";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `gath;er\nrock;et`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCCV pattern with trigraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "fudge";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `fudge`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "lazy";
        yield "tiger";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `la;zy\nti;ger`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VCV Pattern with trigraph ",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "glare";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `glare`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "lion";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `li;on`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VV Pattern with digraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "reindeer";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `re;in;deer`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VV pattern with quadgraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "laugh";
        yield "through";
        yield "weigh";
        yield "weight";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `laugh\nthrough\nweigh\nweight`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return unseperated single syllable",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "car";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "car";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated compound words",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "football";
        yield "handbag";
        yield "withstand";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = `foot;ball\nhand;bag\nwith;stand`;

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated prefix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "refresh";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "re;fresh";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated suffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "dainty";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "dain;ty";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return a separated prefix and sufffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "reify";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "re;ify";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separared prefix, root and sufffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "destabilise";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "de;sta;bil;ise";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should not fail VCCCV ",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "complimentary";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "com;pli;men;ta;ry";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should not fail VCV ",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "camel";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "cam;el";

    assertEquals(actual, expected);
  },
  ignore: false,
});
