import { spy, stub } from "https://deno.land/std@0.205.0/testing/mock.ts";
import {
  Status,
  STATUS_TEXT,
} from "https://deno.land/std@0.205.0/http/status.ts";

export function fetch({ success, failure } = {}) {
  if (success) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        success.json
          ? Response.json(success.json, {
            status: success.status ?? Status.OK,
            statusText: success.statusText ?? STATUS_TEXT[Status.OK],
          })
          : new Response(success.text, {
            status: success.status ?? Status.OK,
            statusText: success.statusText ?? STATUS_TEXT[Status.OK],
          }),
      ));
  } else if (failure) {
    return stub(globalThis, "fetch", () =>
      Promise.resolve(
        failure.json
          ? Response.json(failure.json, {
            status: failure.status ?? Status.BadRequest,
            statusText: failure.statusText ?? STATUS_TEXT[Status.BadRequest],
          })
          : new Response(failure.text, {
            status: failure.status ?? Status.BadRequest,
            statusText: failure.statusText ?? STATUS_TEXT[Status.BadRequest],
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
