const BASE = 'http://localhost:3000'
const PASSWORD = 'password123'

async function req(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (token) headers['Cookie'] = `sycs_token=${token}`
  if (body !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body) }
  const res = await fetch(BASE + path, { method, headers, body, redirect: 'manual' })
  const setCookie = res.headers.get('set-cookie')
  let data = null
  try { data = await res.json() } catch { /* noop */ }
  return { status: res.status, data, setCookie }
}

function tokenFrom(setCookie) {
  const m = setCookie?.match(/sycs_token=([^;]+)/)
  return m?.[1] || null
}

async function signup(email, username, displayName) {
  let r = await req('/api/auth/signup', { method: 'POST', body: { email, username, displayName, password: PASSWORD } })
  if (r.status === 409) {
    r = await req('/api/auth/signin', { method: 'POST', body: { email, password: PASSWORD } })
  }
  if (r.status !== 200 && r.status !== 201) throw new Error(`signup ${email} failed: ${r.status} ${JSON.stringify(r.data)}`)
  return tokenFrom(r.setCookie)
}

async function collectEvents(token, ms, predicate) {
  const events = []
  const res = await fetch(BASE + '/api/events', { headers: { Cookie: `sycs_token=${token}` } })
  if (res.status !== 200) return { error: res.status, events }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  const deadline = Date.now() + ms
  try {
    while (Date.now() < deadline) {
      const timer = new Promise(r => setTimeout(() => r(Symbol('timeout')), deadline - Date.now()))
      const result = await Promise.race([reader.read(), timer])
      if (result === Symbol('timeout')) break
      const { done, value } = result
      if (done) break
      buf += decoder.decode(value, { stream: true })
      let idx
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const raw = buf.slice(0, idx); buf = buf.slice(idx + 2)
        let data = ''
        for (const line of raw.split('\n')) {
          if (line.startsWith('data:')) data += line.slice(5).trim()
        }
        if (data && data !== 'ping') {
          try {
            const p = JSON.parse(data)
            if (p && p.type !== 'connected') {
              events.push(p)
              if (predicate?.(p)) { await reader.cancel().catch(() => {}); return { events, matched: p } }
            }
          } catch { /* ignore */ }
        }
      }
    }
  } catch { /* stream closed */ }
  await reader.cancel().catch(() => {})
  return { events }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

const adminToken = await signup('rtadmin@test.dev', 'rtadmin', 'RT Admin')
const memberToken = await signup('rtmember@test.dev', 'rtmember', 'RT Member')
console.log('tokens ok', !!adminToken, !!memberToken)

let r = await req('/api/servers', { method: 'POST', token: adminToken, body: { name: 'Realtime Test' } })
console.log('create server', r.status)
const serverId = r.data?.server?.id
if (!serverId) throw new Error('no serverId')

const serverData = (await req(`/api/servers/${serverId}`, { token: adminToken })).data
const channelId = serverData.channels[0].id

let inv = await req(`/api/servers/${serverId}/invites`, { method: 'POST', token: adminToken, body: {} })
const code = inv.data?.invite?.code
r = await req(`/api/servers/join/${code}`, { method: 'POST', token: memberToken })
console.log('join', r.status)

// Give the member a role with VIEW_CHANNEL + SEND_MESSAGES (mask 3)
let role = await req(`/api/servers/${serverId}/roles`, { method: 'POST', token: adminToken, body: { name: 'Member', permissionsMask: 3 } })
console.log('create role', role.status)
const membersData = (await req(`/api/servers/${serverId}`, { token: adminToken })).data.members
const memberRow = membersData.find(m => m.userId !== serverData.server.ownerId)
if (!memberRow) throw new Error('member row not found')
r = await req(`/api/servers/${serverId}/members/${memberRow.userId}`, { method: 'PUT', token: adminToken, body: { roleId: role.data?.role?.id } })
console.log('assign role', r.status, JSON.stringify(r.data))

const listenerA = collectEvents(adminToken, 10000, p => p.type === 'message.new' && p.channelId === channelId)
const listenerB = collectEvents(memberToken, 10000, p => p.type === 'server.updated')
await sleep(1500)

r = await req(`/api/servers/${serverId}/channels/${channelId}/messages`, { method: 'POST', token: memberToken, body: { content: 'hello realtime' } })
console.log('post message', r.status)

const resA = await listenerA
const gotMsg = resA.matched?.message?.content === 'hello realtime'
console.log('A(admin) got message.new:', gotMsg, JSON.stringify(resA.matched))

r = await req(`/api/servers/${serverId}`, { method: 'PUT', token: adminToken, body: { name: 'Realtime Test v2' } })
console.log('rename server', r.status)

const resB = await listenerB
console.log('B(member) got server.updated:', resB.matched?.type === 'server.updated', JSON.stringify(resB.matched))

if (!gotMsg) { console.log('FAIL: admin did not receive message.new'); process.exit(1) }
if (!resB.matched) { console.log('FAIL: member did not receive server.updated'); process.exit(1) }
console.log('ALL REALTIME TESTS PASSED')
process.exit(0)
