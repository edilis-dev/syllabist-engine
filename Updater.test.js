import { assertRejects } from "@std/assert";
import { assertSpyCallArgs, assertSpyCalls } from "@std/testing/mock";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { FakeTime } from "@std/testing/time";

import { fetch, readTextFile, remove, writeTextFile } from "./Stubs.js";
import { Updater } from "./Updater.js";

Deno.test({
  name: "should save artifact and update manifest on first run",
  fn: async () => {
    const time = new FakeTime(0);

    const fetchMock = fetch({ success: { text: "success" } });
    const readMock = readTextFile({
      success: { contents: '{"latest": {}}' },
    });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);

    assertSpyCalls(writeMock, 3);
    assertSpyCallArgs(writeMock, 0, 1, ["success"]);
    assertSpyCallArgs(writeMock, 1, 1, [
      '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"}}',
    ]);
    assertSpyCallArgs(writeMock, 2, 1, [
      '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"}}',
    ]);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should save artifact and update manifest if file changed",
  fn: async () => {
    const time = new FakeTime("March 1, 1970 00:00:00 UTC");

    const fetchMock = fetch({
      success: {
        text: "success",
      },
    });
    const readMock = readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26"}}',
      },
    });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);

    assertSpyCalls(writeMock, 3);
    assertSpyCallArgs(writeMock, 0, 1, ["success"]);
    assertSpyCallArgs(writeMock, 1, 1, [
      '{"latest":{"created":"1970-03-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-01-01T00:00:00.000Z","obsoleted":"1970-03-01T00:00:00.000Z"}}',
    ]);
    assertSpyCallArgs(writeMock, 2, 1, [
      '{"latest":{"created":"1970-03-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-01-01T00:00:00.000Z","obsoleted":"1970-03-01T00:00:00.000Z"}}',
    ]);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should prune obsolete artifacts and update manifest if file changed",
  fn: async () => {
    const time = new FakeTime("December 1, 1970 00:00:00 UTC");

    const fetchMock = fetch({
      success: {
        text: "success",
      },
    });
    const removeMock = remove({ success: true });
    const readMock = readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f28"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-06-01T00:00:00.000Z","obsoleted":"1970-01-01T00:00:00.000Z"}}',
      },
    });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);
    assertSpyCalls(removeMock, 1);
    assertSpyCalls(writeMock, 3);
    assertSpyCallArgs(writeMock, 0, 1, ["success"]);
    assertSpyCallArgs(writeMock, 1, 1, [
      '{"latest":{"created":"1970-12-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f28":{"created":"1970-06-01T00:00:00.000Z","obsoleted":"1970-12-01T00:00:00.000Z"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-06-01T00:00:00.000Z","obsoleted":"1970-01-01T00:00:00.000Z"}}',
    ]);
    assertSpyCallArgs(writeMock, 2, 1, [
      '{"latest":{"created":"1970-12-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f28":{"created":"1970-06-01T00:00:00.000Z","obsoleted":"1970-12-01T00:00:00.000Z"}}',
    ]);

    fetchMock.restore();
    readMock.restore();
    removeMock.restore();
    writeMock.restore();

    time.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should not save artifact or update manifest if file unchanged",
  fn: async () => {
    const fetchMock = fetch({
      success: {
        json: { data: "success" },
      },
    });
    const readMock = readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"49b5b9c202ff82293960108c8b8eb808dd558103b3cf673e1b644b6bb7e604d6"}}',
      },
    });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);
    assertSpyCalls(writeMock, 1);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw a Text error if file fetch failed",
  fn: async () => {
    const fetchMock = fetch({
      failure: {
        text: "failure",
      },
    });

    await assertRejects(() => new Updater().update(), TypeError, "failure");

    assertSpyCalls(fetchMock, 1);

    fetchMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw a JSON error if file fetch failed",
  fn: async () => {
    const fetchMock = fetch({
      failure: {
        json: {
          error: "failure",
        },
      },
    });

    await assertRejects(
      () => new Updater().update(),
      TypeError,
      '{"error":"failure"}',
    );

    assertSpyCalls(fetchMock, 1);

    fetchMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw statusText if file fetch failed",
  fn: async () => {
    const fetchMock = fetch({
      failure: true,
    });

    await assertRejects(
      () => new Updater().update(),
      TypeError,
      STATUS_TEXT[STATUS_CODE.BadRequest],
    );

    assertSpyCalls(fetchMock, 1);

    fetchMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should not throw if removing obsolete artifact failed",
  fn: async () => {
    Deno.env.set("lifetime", "1");

    const time = new FakeTime("December 1, 1970 00:00:00 UTC");

    const fetchMock = fetch({ success: { text: "success" } });
    const removeMock = remove({ failure: true });
    const readMock = readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f28"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-06-01T00:00:00.000Z","obsoleted":"1970-01-01T00:00:00.000Z"}}',
      },
    });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);
    assertSpyCalls(removeMock, 1);
    assertSpyCalls(writeMock, 3);

    fetchMock.restore();
    readMock.restore();
    removeMock.restore();
    writeMock.restore();

    time.restore();
  },
  ignore: false,
});
