import { assertRejects } from "@std/assert";
import { resolve } from "@std/path";
import { assertSpyCallArgs, assertSpyCalls, stub } from "@std/testing/mock";
import { FakeTime } from "@std/testing/time";

import { fetch, readTextFile, remove, writeTextFile } from "./Stubs.js";
import { Updater } from "./Updater.js";

Deno.test({
  name: "should save the artifact and update the manifest on first run",
  fn: async () => {
    const time = new FakeTime(0);

    const fetchMock = fetch({ success: true });
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
  name: "should save the artifact and update the manifest when the source changes",
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
  name: "should prune obsolete artifacts when the source changes",
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
  name: "should not save the artifact or update the manifest when the source is unchanged",
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
  name: "should throw a TypeError if the fetch fails with a text error body",
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
  name: "should throw a TypeError if the fetch fails with a JSON error body",
  fn: async () => {
    const fetchMock = fetch({
      failure: {
        json: {
          error: "failure",
        },
      },
    });

    await assertRejects(() => new Updater().update(), TypeError, '{"error":"failure"}');

    assertSpyCalls(fetchMock, 1);

    fetchMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw a TypeError if the fetch fails with no body configured",
  fn: async () => {
    const fetchMock = fetch({
      failure: true,
    });

    await assertRejects(() => new Updater().update(), TypeError, "failure");

    assertSpyCalls(fetchMock, 1);

    fetchMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw a TypeError if the manifest read fails",
  fn: async () => {
    const fetchMock = fetch({ success: true });
    const readMock = readTextFile({ failure: true });

    await assertRejects(() => new Updater().update(), Error, "failure");

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);

    fetchMock.restore();
    readMock.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should throw a TypeError if the artifact write fails",
  fn: async () => {
    const fetchMock = fetch({ success: true });
    const readMock = readTextFile({ success: { contents: '{"latest":{}}' } });
    const writeMock = writeTextFile({ failure: true });

    await assertRejects(() => new Updater().update(), Error, "failure");

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
  name: "should throw a TypeError if the manifest write fails",
  fn: async () => {
    const time = new FakeTime(0);

    const fetchMock = fetch({ success: true });
    const readMock = readTextFile({ success: { contents: '{"latest":{}}' } });

    let writeCallCount = 0;
    const writeMock = stub(Deno, "writeTextFile", () => {
      writeCallCount++;
      return writeCallCount === 1 ? Promise.resolve("success") : Promise.reject(new Error("failure"));
    });

    await assertRejects(() => new Updater().update(), Error, "failure");

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);
    assertSpyCalls(writeMock, 2);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should call fetch with the provided source URL",
  fn: async () => {
    const time = new FakeTime(0);

    const fetchMock = fetch({ success: true });
    const readMock = readTextFile({ success: { contents: '{"latest":{}}' } });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update("https://example.com/words.txt");

    assertSpyCallArgs(fetchMock, 0, 0, ["https://example.com/words.txt"]);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
  },
  ignore: false,
});

Deno.test({
  name: "should use the artifacts environment variable as the artifact directory",
  fn: async () => {
    Deno.env.set("artifacts", "custom-artifacts");

    const time = new FakeTime(0);

    const fetchMock = fetch({ success: true });
    const readMock = readTextFile({ success: { contents: '{"latest":{}}' } });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCallArgs(readMock, 0, 0, [resolve("custom-artifacts", "manifest.json")]);
    assertSpyCallArgs(writeMock, 0, 0, [
      resolve("custom-artifacts", "aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27.txt"),
      "success",
    ]);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
    Deno.env.delete("artifacts");
  },
  ignore: false,
});

Deno.test({
  name: "should use the manifest environment variable as the manifest filename",
  fn: async () => {
    Deno.env.set("manifest", "custom.json");

    const time = new FakeTime(0);

    const fetchMock = fetch({ success: true });
    const readMock = readTextFile({ success: { contents: '{"latest":{}}' } });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCallArgs(readMock, 0, 0, [resolve("artifacts", "custom.json")]);
    assertSpyCallArgs(writeMock, 1, 0, [
      resolve("artifacts", "custom.json"),
      '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"}}',
    ]);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
    Deno.env.delete("manifest");
  },
  ignore: false,
});

Deno.test({
  name: "should use the latest environment variable as the current-version key",
  fn: async () => {
    Deno.env.set("latest", "latest");

    const time = new FakeTime(0);

    const fetchMock = fetch({ success: true });
    const readMock = readTextFile({ success: { contents: '{"latest":{}}' } });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCallArgs(writeMock, 1, 1, [
      '{"latest":{"created":"1970-01-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"}}',
    ]);

    fetchMock.restore();
    readMock.restore();
    writeMock.restore();

    time.restore();
    Deno.env.delete("latest");
  },
  ignore: false,
});

Deno.test({
  name: "should remove all expired files when multiple artifacts are obsolete",
  fn: async () => {
    const time = new FakeTime("December 1, 1970 00:00:00 UTC");

    const fetchMock = fetch({ success: true });
    const removeMock = remove({ success: true });
    const readMock = readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-03-01T00:00:00.000Z","obsoleted":"1970-01-01T00:00:00.000Z"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f25":{"created":"1970-02-01T00:00:00.000Z","obsoleted":"1970-02-01T00:00:00.000Z"}}',
      },
    });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);
    assertSpyCalls(removeMock, 2);
    assertSpyCalls(writeMock, 1);
    assertSpyCallArgs(writeMock, 0, 1, [
      '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"}}',
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
  name: "should keep entries within the retention window and remove only expired ones",
  fn: async () => {
    const time = new FakeTime("December 1, 1970 00:00:00 UTC");

    const fetchMock = fetch({ success: true });
    const removeMock = remove({ success: true });
    const readMock = readTextFile({
      success: {
        contents:
          '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f26":{"created":"1970-03-01T00:00:00.000Z","obsoleted":"1970-01-01T00:00:00.000Z"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f25":{"created":"1970-10-01T00:00:00.000Z","obsoleted":"1970-11-01T00:00:00.000Z"}}',
      },
    });
    const writeMock = writeTextFile({ success: true });

    await new Updater().update();

    assertSpyCalls(fetchMock, 1);
    assertSpyCalls(readMock, 1);
    assertSpyCalls(removeMock, 1);
    assertSpyCalls(writeMock, 1);
    assertSpyCallArgs(writeMock, 0, 1, [
      '{"latest":{"created":"1970-06-01T00:00:00.000Z","digest":"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f27"},"aee408847d35e44e99430f0979c3357b85fe8dbb4535a494301198adbee85f25":{"created":"1970-10-01T00:00:00.000Z","obsoleted":"1970-11-01T00:00:00.000Z"}}',
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
  name: "should not throw if removing an obsolete artifact fails",
  fn: async () => {
    Deno.env.set("lifetime", "1");

    const time = new FakeTime("December 1, 1970 00:00:00 UTC");

    const fetchMock = fetch({ success: true });
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
    Deno.env.delete("lifetime");
  },
  ignore: false,
});
