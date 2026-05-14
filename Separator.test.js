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

    await assertRejects(() => new Separator(iter).separate(), TypeError, "Empty line");
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
        yield "dimly";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "dim;ly";

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
  name: "should return separated VCCV words containing word-final trigraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "gadget";
        yield "budget";
        yield "badger";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "gad;get\nbud;get\nbad;ger";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated VV vowel digraph words with following syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "autumn";
        yield "nautical";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "au;tumn\nnau;tic;al";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated closed VCV pattern words",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "camel";
        yield "lemon";
        yield "robin";
        yield "magic";
        yield "body";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "cam;el\nlem;on\nrob;in\nmag;ic\nbod;y";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated qu cluster word with VCCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "liquid";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "liq;uid";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return unseparated single syllable for silent initial gn pair",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "gnome";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "gnome";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated gnostic for silent initial gn pair",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "gnostic";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "gnos;tic";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated climbing for silent final mb pair",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "climbing";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "climb;ing";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated number unaffected by silent final mb pair",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "number";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "num;ber";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated x as two consonants",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "exit";
        yield "taxi";
        yield "oxen";
        yield "maximum";
        yield "luxury";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "ex;it\ntax;i\nox;en\nmax;i;mum\nlux;u;ry";

    assertEquals(actual, expected);
  },
  ignore: false,
});

Deno.test({
  name: "should return separated qu cluster words",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "quiet";
        yield "sequence";
      },
    };

    const actual = await new Separator(iter).separate();

    const expected = "qui;et\nse;quence";

    assertEquals(actual, expected);
  },
  ignore: false,
});
