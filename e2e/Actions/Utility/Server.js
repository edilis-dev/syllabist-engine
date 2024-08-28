import { serveFile } from "@std/http/file-server";

Deno.serve(
  async (req) => await serveFile(req, `${Deno.cwd()}/Input/source.txt`),
);
