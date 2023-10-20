import { FakeTime } from "https://deno.land/std@0.204.0/testing/time.ts";

import { Stubs } from "./Stubs.js";
import { Updater } from "./Updater.js";

Deno.bench({
  name: "should save artifact and update manifest on first run",
  fn: async (bench) => {
    const time = new FakeTime(0);

    const fetchMock = Stubs.fetch({ success: { text: "success" } });
    const readMock = Stubs.readTextFile({
      success: { contents: '{"latest": {}}' },
    });
    const writeMock = Stubs.writeTextFile({ success: true });

    bench.start();

    await new Updater().update();

    bench.end();

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
  },
  ignore: false,
});

Deno.bench({
  name: "should save artifact and update manifest if file changed",
  fn: async (bench) => {
    const time = new FakeTime("March 1, 1970 00:00:00 UTC");

    const fetchMock = Stubs.fetch({
      success: {
        text: "success",
      },
    });
    const readMock = Stubs.readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26"}}',
      },
    });
    const writeMock = Stubs.writeTextFile({ success: true });

    bench.start();

    await new Updater().update();

    bench.end();

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
  },
});

Deno.bench({
  name: "should prune obsolete artifacts and update manifest if file changed",
  fn: async (bench) => {
    const time = new FakeTime("December 1, 1970 00:00:00 UTC");

    const fetchMock = Stubs.fetch({
      success: {
        text: "success",
      },
    });
    const removeMock = Stubs.remove({ success: true });
    const readMock = Stubs.readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f28"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-06-01T00:00:00.000Z","obsoleted":"1970-01-01T00:00:00.000Z"}}',
      },
    });
    const writeMock = Stubs.writeTextFile({ success: true });

    bench.start();

    await new Updater().update();

    bench.end();

    fetchMock.restore();
    readMock.restore();
    removeMock.restore();
    writeMock.restore();

    time.restore();
  },
});

Deno.bench({
  name: "should not save artifact or update manifest if file unchanged",
  fn: async (bench) => {
    const fetchMock = Stubs.fetch({
      success: {
        json: { data: "success" },
      },
    });
    const readMock = Stubs.readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"49b5b9c202ff82293960108c8b8eb808dd558103b3cf673e1b644b6bb7e604d6"}}',
      },
    });
    const writeMock = Stubs.writeTextFile({ success: true });

    bench.start();

    await new Updater().update();

    bench.end();

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();
  },
});
