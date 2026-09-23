const { sql } = require('drizzle-orm');
const ids = ['11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222'];

const j1 = sql.join(ids.map(id => sql`${id}`), ',');
const q1 = sql`SELECT DISTINCT ON (channel_id) channel_id FROM dm_messages WHERE channel_id IN (${j1}) ORDER BY channel_id, created_at DESC`;
console.log('CHUNKS toSQL:', JSON.stringify(q1.toSQL()));

const j2 = sql.join(ids, ',');
const q2 = sql`SELECT DISTINCT ON (channel_id) channel_id FROM dm_messages WHERE channel_id IN (${j2}) ORDER BY channel_id, created_at DESC`;
console.log('PRIM toSQL:', JSON.stringify(q2.toSQL()));

const q3 = sql`SELECT DISTINCT ON (channel_id) channel_id FROM dm_messages WHERE channel_id IN (${j1}) ORDER BY channel_id, created_at DESC`;
console.log('CHUNKS inline:', JSON.stringify(q3.toSQL({ inlineParams: true })));
const q4 = sql`SELECT DISTINCT ON (channel_id) channel_id FROM dm_messages WHERE channel_id IN (${j2}) ORDER BY channel_id, created_at DESC`;
console.log('PRIM inline:', JSON.stringify(q4.toSQL({ inlineParams: true })));