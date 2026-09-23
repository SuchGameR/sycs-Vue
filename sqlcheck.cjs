const { sql } = require('drizzle-orm');
const { PgDialect } = require('drizzle-orm/pg-core');
const d = new PgDialect();
const ids = ['11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222'];

// A: param elements + raw separator
const jA = sql.join(ids.map(id => sql.param(id)), sql.raw(','));
const qA = sql`SELECT DISTINCT ON (channel_id) channel_id FROM dm_messages WHERE channel_id IN (${jA}) ORDER BY channel_id, created_at DESC`;
console.log('A (param+raw sep):', JSON.stringify(d.sqlToQuery(qA)));

// B: sql.array -> ANY(...)
const qB = sql`SELECT DISTINCT ON (channel_id) channel_id FROM dm_messages WHERE channel_id = ANY(${sql.array(ids)}) ORDER BY channel_id, created_at DESC`;
console.log('B (ANY array)     :', JSON.stringify(d.sqlToQuery(qB)));

// C: raw ids interp (no params)
const jC = sql.join(ids, sql.raw(','));
const qC = sql`SELECT DISTINCT ON (channel_id) channel_id FROM dm_messages WHERE channel_id IN (${jC}) ORDER BY channel_id, created_at DESC`;
console.log('C (raw interp)    :', JSON.stringify(d.sqlToQuery(qC)));