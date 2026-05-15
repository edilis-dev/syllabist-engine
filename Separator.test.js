import { assertEquals, assertRejects } from "@std/assert";

import { Separator } from "./Separator.js";

Deno.test({
  name: "separate should throw a TypeError for missing data",
  fn: async () => {
    await assertRejects(() => new Separator().separate(), TypeError);
  },
  ignore: false,
});

Deno.test({
  name: "separate should throw a TypeError for an empty line",
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
  name: "separate should return a single-syllable word unseparated",
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
  name: "separate should return a word split by the LE pattern",
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
  name: "separate should return a word split by the VCCCCV pattern",
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
  name: "separate should return a word split by the VCCCV pattern",
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
  name: "separate should return a VCCCV word that keeps a glued sound together",
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
  name: "separate should return a multisyllabic word with the VCCCV pattern correctly separated",
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
  name: "separate should return a word split by the VCCV pattern",
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
  name: "separate should return a VCCV word where an R-blend determines the split point",
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
  name: "separate should return a VCCV word where a consonant digraph keeps two letters together",
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
  name: "separate should return a VCCV word where a trigraph suppresses the split",
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
  name: "separate should return a VCCV word split before a word-final trigraph",
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
  name: "separate should treat qu as a unit when determining the VCCV split point",
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
  name: "separate should return a word split by the VCV pattern",
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
  name: "separate should return a VCV word where a trigraph keeps the head and pattern together",
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
  name: "separate should return a word split by the closed VCV pattern",
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
  name: "separate should return a word split by the VV pattern",
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
  name: "separate should return a VV word that is not split across a vowel digraph",
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
  name: "separate should return a VV word that is not split across a quadgraph",
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
  name: "separate should return a word with a vowel digraph split across further syllable boundaries",
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
  name: "separate should return a compound word split at its compound boundary",
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
  name: "separate should return a word split at its prefix boundary",
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
  name: "separate should return a word split at its suffix boundary",
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
  name: "separate should return a word split at its prefix boundary when the root begins with a vowel",
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
  name: "separate should return a word split at its prefix and internal syllable boundaries",
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
  name: "separate should return a word with a silent initial gn pair as a single syllable",
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
  name: "separate should return a word with a silent initial gn pair split across syllable boundaries",
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
  name: "separate should keep a silent final mb pair within its syllable",
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
  name: "separate should split a word where mb occurs at a normal syllable boundary",
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
  name: "separate should treat x as two consonants when determining the split point",
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
  name: "separate should treat qu as a single unit when splitting",
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
