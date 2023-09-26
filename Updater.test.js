import { assertRejects } from "https://deno.land/std@0.202.0/testing/asserts.ts";
import {
  assertSpyCallArgs,
  assertSpyCalls,
} from "https://deno.land/std@0.202.0/testing/mock.ts";
import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.202.0/http/http_status.ts";
import { FakeTime } from "https://deno.land/std@0.202.0/testing/time.ts";

import { Stubs } from "./Stubs.js";
import { Updater } from "./Updater.js";

Deno.test({
  name: "should save artifact and update manifest on first run",
  fn: async () => {
    const time = new FakeTime(0);

    const fetchMock = Stubs.fetch({ success: { text: "success" } });
    const readMock = Stubs.readTextFile({
      success: { contents: '{"latest": {}}' },
    });
    const writeMock = Stubs.writeTextFile({ success: true });

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
    const fetchMock = Stubs.fetch({
      failure: {
        text: "failure",
      },
    });

    await assertRejects(
      () => new Updater().update(),
      Error,
      "failure",
    );

    assertSpyCalls(fetchMock, 1);

    fetchMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw a JSON error if file fetch failed",
  fn: async () => {
    const fetchMock = Stubs.fetch({
      failure: {
        json: {
          error: "failure",
        },
      },
    });

    const err = await assertRejects(
      () => new Updater().update(),
      Error,
      '{"error":"failure"}',
    );

    console.log(err.status);

    assertSpyCalls(fetchMock, 1);

    fetchMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw statusText if file fetch failed",
  fn: async () => {
    const fetchMock = Stubs.fetch({
      failure: true,
    });

    await assertRejects(
      () => new Updater().update(),
      Error,
      STATUS_TEXT[Status.BadRequest],
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

    const fetchMock = Stubs.fetch({ success: { text: "success" } });
    const removeMock = Stubs.remove({ failure: true });
    const readMock = Stubs.readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f28"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-06-01T00:00:00.000Z","obsoleted":"1970-01-01T00:00:00.000Z"}}',
      },
    });
    const writeMock = Stubs.writeTextFile({ success: true });

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
