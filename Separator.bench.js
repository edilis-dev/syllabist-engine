import { Separator } from "./Separator.js";

Deno.bench({
  name: "should return separated LE pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "candle";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCCCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "construct";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "complex";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCCV Pattern with blend",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "complex";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCCV Pattern with glued",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "bankrupt";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "basket";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCV Pattern with blend",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "secret";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCV Pattern with digraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "gather";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCCV pattern with trigraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "fudge";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "lazy";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VCV Pattern with trigraph ",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "glare";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VV pattern",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "lion";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VV Pattern with digraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "reindeer";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated VV pattern with quadgraph",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "laugh";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return unseperated single syllable",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "car";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated compound words",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "football";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated prefix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "refresh";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separated suffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "dainty";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return a separated prefix and sufffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "reify";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should return separared prefix, root and sufffix",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "destabilise";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should not fail VCCCV ",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "complimentary";
      },
    };

    await new Separator(iter).separate();
  },
});

Deno.bench({
  name: "should not fail VCV ",
  fn: async () => {
    const iter = {
      async *[Symbol.asyncIterator]() {
        yield "camel";
      },
    };

    await new Separator(iter).separate();
  },
});
