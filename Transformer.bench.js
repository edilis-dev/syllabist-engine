import { Transformer } from "./Transformer.js";

Deno.bench({
  name: "should return a syllable group",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a";
      },
    };

    await new Transformer(iter).transform();
  },
});

Deno.bench({
  name: "should return groups of adjacent syllable",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;zal;ea";
        yield "aard;vark";
      },
    };

    await new Transformer(iter).transform();
  },
});

Deno.bench({
  name: "should return a group with sibling syllables",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "a;ble";
        yield "a;bout";
      },
    };

    await new Transformer(iter).transform();
  },
});

Deno.bench({
  name: "should return a group with combining siblings",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "wa;ter";
        yield "wa;ter;borne";
      },
    };

    await new Transformer(iter).transform();
  },
});

Deno.bench({
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

    await new Transformer(iter).transform();
  },
});

Deno.bench({
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

    await new Transformer(iter).transform();
  },
});
