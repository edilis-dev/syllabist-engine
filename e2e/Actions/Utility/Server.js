import { serve } from "https://deno.land/std@0.205.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.205.0/http/file_server.ts";

serve(async (req) => await serveFile(req, `${Deno.cwd()}/Input/source.txt`));
