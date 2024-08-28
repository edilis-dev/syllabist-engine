import { spy, stub } from "@std/testing/mock";
import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";

export function fetch({ success, failure } = {}) {
  if (success) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        success.json
          ? Response.json(success.json, {
            status: success.status ?? STATUS_CODE.OK,
            statusText: success.statusText ?? STATUS_TEXT[STATUS_CODE.OK],
          })
          : new Response(success.text, {
            status: success.status ?? STATUS_CODE.OK,
            statusText: success.statusText ?? STATUS_TEXT[STATUS_CODE.OK],
          }),
      ));
  } else if (failure) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        failure.json
          ? Response.json(failure.json, {
            status: failure.status ?? STATUS_CODE.BadRequest,
            statusText: failure.statusText ??
              STATUS_TEXT[STATUS_CODE.BadRequest],
          })
          : new Response(failure.text, {
            status: failure.status ?? STATUS_CODE.BadRequest,
            statusText: failure.statusText ??
              STATUS_TEXT[STATUS_CODE.BadRequest],
          }),
      ));
  } else {
    return spy(globalThis, "fetch");
  }
}

export function readTextFile({ failure, success } = {}) {
  if (success) {
    return stub(
      Deno,
      "readTextFile",
      () => Promise.resolve(success.contents ?? "success"),
    );
  } else if (failure) {
    return stub(
      Deno,
      "readTextFile",
      () => Promise.reject(new Error(failure.contents ?? "failure")),
    );
  } else {
    return spy(Deno, "readTextFile");
  }
}

export function remove({ failure, success } = {}) {
  if (success) {
    return stub(
      Deno,
      "remove",
      () => Promise.resolve(success.contents ?? "success"),
    );
  } else if (failure) {
    return stub(
      Deno,
      "remove",
      () => Promise.reject(new Error(failure.contents ?? "failure")),
    );
  } else {
    return spy(Deno, "remove");
  }
}

export function writeTextFile({ failure, success } = {}) {
  if (success) {
    return stub(
      Deno,
      "writeTextFile",
      () => Promise.resolve(success.contents ?? "success"),
    );
  } else if (failure) {
    return stub(
      Deno,
      "writeTextFile",
      () => Promise.reject(new Error(failure.contents ?? "failure")),
    );
  } else {
    return spy(Deno, "writeTextFile");
  }
}
