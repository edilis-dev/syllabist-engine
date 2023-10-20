import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.204.0/http/http_status.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
  assertRejects,
} from "https://deno.land/std@0.204.0/testing/asserts.ts";

import { Stubs } from "./Stubs.js";

Deno.test({
  name: "fetch stub should return success",
  fn: async () => {
    const expected = {
      status: Status.OK,
      statusText: STATUS_TEXT[Status.OK],
    };

    const stub = await Stubs.fetch({ success: true });

    const response = await stub();

    assertEquals(response.ok, true);
    assertObjectMatch(expected, {
      status: response.status,
      statusText: response.statusText,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return success JSON",
  fn: async () => {
    const expected = {
      json: {
        data: "success",
      },
      status: Status.OK,
      statusText: STATUS_TEXT[Status.OK],
    };

    const stub = await Stubs.fetch({
      success: {
        json: expected.json,
      },
    });

    const response = await stub();

    const json = await response.json();

    assertEquals(response.ok, true);
    assertObjectMatch(expected, {
      json,
      status: response.status,
      statusText: response.statusText,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return success with JSON and status",
  fn: async () => {
    const expected = {
      json: {
        data: "success",
      },
      status: Status.Accepted,
      statusText: STATUS_TEXT[Status.Accepted],
    };

    const stub = await Stubs.fetch({ success: expected });

    const response = await stub();

    const json = await response.json();

    assertEquals(response.ok, true);
    assertObjectMatch(expected, {
      json,
      status: response.status,
      statusText: response.statusText,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return success Text",
  fn: async () => {
    const expected = {
      status: Status.OK,
      statusText: STATUS_TEXT[Status.OK],
      text: "success",
    };

    const stub = await Stubs.fetch({
      success: {
        text: expected.text,
      },
    });

    const response = await stub();

    const text = await response.text();

    assertEquals(response.ok, true);
    assertObjectMatch(expected, {
      status: response.status,
      statusText: response.statusText,
      text,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return success Text and status",
  fn: async () => {
    const expected = {
      status: Status.Accepted,
      statusText: STATUS_TEXT[Status.Accepted],
      text: "success",
    };

    const stub = await Stubs.fetch({ success: expected });

    const response = await stub();

    const text = await response.text();

    assertEquals(response.ok, true);
    assertObjectMatch(expected, {
      status: response.status,
      statusText: response.statusText,
      text,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return failure",
  fn: async () => {
    const expected = {
      status: Status.BadRequest,
      statusText: STATUS_TEXT[Status.BadRequest],
    };

    const stub = await Stubs.fetch({ failure: true });

    const response = await stub();

    assertEquals(response.ok, false);
    assertObjectMatch(expected, {
      status: response.status,
      statusText: response.statusText,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return failure JSON",
  fn: async () => {
    const expected = {
      json: {
        error: "failure",
      },
      status: Status.BadRequest,
      statusText: STATUS_TEXT[Status.BadRequest],
    };

    const stub = await Stubs.fetch({
      failure: {
        json: expected.json,
      },
    });

    const response = await stub();

    const json = await response.json();

    assertEquals(response.ok, false);
    assertObjectMatch(expected, {
      json,
      status: response.status,
      statusText: response.statusText,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return failure JSON and status",
  fn: async () => {
    const expected = {
      json: {
        error: "failure",
      },
      status: Status.InternalServerError,
      statusText: STATUS_TEXT[Status.InternalServerError],
    };

    const stub = await Stubs.fetch({ failure: expected });

    const response = await stub();

    const json = await response.json();

    assertEquals(response.ok, false);
    assertObjectMatch(expected, {
      json,
      status: response.status,
      statusText: response.statusText,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return failure Text",
  fn: async () => {
    const expected = {
      text: "failure",
      status: Status.BadRequest,
      statusText: STATUS_TEXT[Status.BadRequest],
    };

    const stub = await Stubs.fetch({
      failure: {
        text: expected.text,
      },
    });

    const response = await stub();

    const text = await response.text();

    assertEquals(response.ok, false);
    assertObjectMatch(expected, {
      status: response.status,
      statusText: response.statusText,
      text,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch stub should return failure Text and status",
  fn: async () => {
    const expected = {
      text: "failure",
      status: Status.InternalServerError,
      statusText: STATUS_TEXT[Status.InternalServerError],
    };

    const stub = await Stubs.fetch({ failure: expected });

    const response = await stub();

    const text = await response.text();

    assertEquals(response.ok, false);
    assertObjectMatch(expected, {
      status: response.status,
      statusText: response.statusText,
      text,
    });

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "fetch spy",
  fn: async () => {
    const stub = await Stubs.fetch();

    assertInstanceOf(stub, Function);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "readTextFile stub should return success",
  fn: async () => {
    const expected = "success";

    const stub = await Stubs.readTextFile({ success: true });

    const actual = await stub();

    assertEquals(actual, expected);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "readTextFile stub should return success Text",
  fn: async () => {
    const expected = "successful";

    const stub = await Stubs.readTextFile({
      success: {
        contents: expected,
      },
    });

    const actual = await stub();

    assertEquals(actual, expected);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "readTextFile stub should return failure",
  fn: async () => {
    const stub = await Stubs.readTextFile({ failure: true });

    await assertRejects(
      () => stub(),
      Error,
      "failure",
    );

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "readTextFile stub should return failure Text",
  fn: async () => {
    const stub = await Stubs.readTextFile({
      failure: {
        contents: "failed",
      },
    });

    await assertRejects(
      () => stub(),
      Error,
      "failed",
    );

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "readTextFile spy",
  fn: async () => {
    const stub = await Stubs.readTextFile();

    assertInstanceOf(stub, Function);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "remove stub should return success",
  fn: async () => {
    const expected = "success";

    const stub = await Stubs.remove({ success: true });

    const actual = await stub();

    assertEquals(actual, expected);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "remove stub should return success Text",
  fn: async () => {
    const expected = "successful";

    const stub = await Stubs.remove({
      success: {
        contents: "successful",
      },
    });

    const actual = await stub();

    assertEquals(actual, expected);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "remove stub should return failure",
  fn: async () => {
    const stub = await Stubs.remove({ failure: true });

    await assertRejects(
      () => stub(),
      Error,
      "failure",
    );

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "remove stub should return failure Text",
  fn: async () => {
    const stub = await Stubs.remove({
      failure: {
        contents: "failed",
      },
    });

    await assertRejects(
      () => stub(),
      Error,
      "failed",
    );

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "remove spy",
  fn: async () => {
    const stub = await Stubs.remove();

    assertInstanceOf(stub, Function);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "writeTextFile stub should return success",
  fn: async () => {
    const expected = "success";

    const stub = await Stubs.writeTextFile({ success: true });

    const actual = await stub();

    assertEquals(actual, expected);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "writeTextFile stub should return success Text",
  fn: async () => {
    const expected = "successful";

    const stub = await Stubs.writeTextFile({
      success: {
        contents: "successful",
      },
    });

    const actual = await stub();

    assertEquals(actual, expected);

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "writeTextFile stub should return failure",
  fn: async () => {
    const stub = await Stubs.writeTextFile({ failure: true });

    await assertRejects(
      () => stub(),
      Error,
      "failure",
    );

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "writeTextFile stub should return failure Text",
  fn: async () => {
    const stub = await Stubs.writeTextFile({
      failure: {
        contents: "failed",
      },
    });

    await assertRejects(
      () => stub(),
      Error,
      "failed",
    );

    stub.restore();
  },
  ignore: false,
});

Deno.test({
  name: "writeTextFile spy",
  fn: async () => {
    const stub = await Stubs.writeTextFile();

    assertInstanceOf(stub, Function);

    stub.restore();
  },
  ignore: false,
});
