import { c as defineEventHandler, r as requireAuth, aa as readMultipartFormData, m as createError, aC as validateFile, aD as saveFile } from '../../_/nitro.mjs';
import 'crypto';
import 'drizzle-orm';
import 'jose';
import 'bcryptjs';
import 'fs';
import 'fs/promises';
import 'path';
import 'sharp';
import 'opentype.js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const upload_post = defineEventHandler(async (event) => {
  await requireAuth(event);
  const body = await readMultipartFormData(event);
  if (!(body == null ? void 0 : body.length)) throw createError({ statusCode: 400, message: "\u30D5\u30A1\u30A4\u30EB\u304C\u3042\u308A\u307E\u305B\u3093" });
  const files = body.filter((p) => p.filename && p.data);
  if (files.length > 8) throw createError({ statusCode: 400, message: "\u30D5\u30A1\u30A4\u30EB\u306F\u6700\u59278\u500B\u307E\u3067\u3067\u3059" });
  const results = [];
  for (const file of files) {
    validateFile(file.filename, file.type || "", file.data);
    const { url, blurUrl, originalUrl, originalName } = await saveFile(file.data, file.filename);
    results.push({ url, blurUrl, originalUrl, originalName, type: file.type, mime: file.type, name: file.filename });
  }
  return { files: results };
});

export { upload_post as default };
//# sourceMappingURL=upload.post.mjs.map
