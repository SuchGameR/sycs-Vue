import { $ as $fetch$1, o as useRealtime } from '../virtual/entry.mjs';
import { s as setInterval } from './interval-T_Je0Yfm.mjs';
import { ref, computed } from 'vue';

var PC_CONFIG = {
  iceServers: [
    { urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302"
    ] },
    { urls: "stun:global.stun.twilio.com:3478" },
    { urls: "stun:stun.services.mozilla.com:3478" }
  ],
  iceCandidatePoolSize: 4
};
var turnPromise = null;
async function tryExtendTurnConfig() {
  var _a;
  try {
    const res = await $fetch$1("/api/voice/turn");
    if ((_a = res == null ? void 0 : res.urls) == null ? void 0 : _a.length) {
      const turn = {
        urls: res.urls,
        username: res.username,
        credential: res.credential
      };
      if (!PC_CONFIG.iceServers.some((s) => {
        var _a2, _b;
        return (_b = (_a2 = s.urls) == null ? void 0 : _a2.includes) == null ? void 0 : _b.call(_a2, res.urls[0]);
      })) PC_CONFIG.iceServers.push(turn);
    }
  } catch {
    turnPromise = null;
  }
}
function ensureTurn() {
  if (!turnPromise) turnPromise = tryExtendTurnConfig();
  return turnPromise;
}
var initialized = false;
var me = ref(null);
var activeRoom = ref(null);
var status = ref("idle");
var errorMsg = ref(null);
var muted = ref(false);
var members = ref([]);
var remoteStreams = ref({});
var localStream = ref(null);
var incoming = ref(null);
var presence = ref({});
var connectionState = ref("new");
var speakerMuted = ref(false);
var cameraEnabled = ref(false);
var screenSharing = ref(false);
var localVideoStream = ref(null);
var screenStream = ref(null);
var reactions = ref([]);
var whiteboardEvents = ref([]);
var whiteboardStrokes = ref([]);
var remoteScreenStreams = ref({});
var currentFacing = ref("user");
var callState = computed(() => {
  if (status.value !== "active") return status.value;
  if (connectionState.value === "connected") return "connected";
  if (connectionState.value === "failed" || connectionState.value === "disconnected") return "reconnecting";
  return "connecting";
});
var watchedRooms = /* @__PURE__ */ new Map();
var peers = /* @__PURE__ */ new Map();
var pendingIce = /* @__PURE__ */ new Map();
var lastIceRestart = /* @__PURE__ */ new Map();
var lastOfferAt = /* @__PURE__ */ new Map();
var everConnected = /* @__PURE__ */ new Set();
var hardResets = /* @__PURE__ */ new Map();
var processingOffer = /* @__PURE__ */ new Set();
var remoteScreening = /* @__PURE__ */ new Map();
var watchdog = null;
function queueOrAddIce(userId, candidate) {
  const q = pendingIce.get(userId) || [];
  const pc = peers.get(userId);
  if (!pc || !pc.remoteDescription) {
    q.push(candidate);
    pendingIce.set(userId, q);
    return;
  }
  pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((err) => console.error("Error adding ICE:", err));
}
function flushIce(userId) {
  const pc = peers.get(userId);
  if (!pc || !pc.remoteDescription) return;
  const q = pendingIce.get(userId) || [];
  pendingIce.delete(userId);
  for (const c of q) pc.addIceCandidate(new RTCIceCandidate(c)).catch((err) => console.error("Error flushing ICE:", err));
}
async function ensureMe() {
  if (me.value) return;
  const u = (await $fetch$1("/api/auth/me")).user;
  me.value = {
    userId: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl
  };
}
function signalTo(room, to, signal, attempt = 0) {
  $fetch$1(room.signalPath, {
    method: "POST",
    body: {
      to,
      signal
    }
  }).catch(() => {
    if (attempt < 2 && [
      "offer",
      "answer",
      "ice"
    ].includes(signal.type)) setTimeout(() => signalTo(room, to, signal, attempt + 1), 200 * (attempt + 1));
  });
}
function optionalVideoTracks() {
  if (screenSharing.value && screenStream.value) {
    const t = screenStream.value.getVideoTracks()[0];
    return t ? [t] : [];
  }
  if (cameraEnabled.value && localVideoStream.value) {
    const t = localVideoStream.value.getVideoTracks()[0];
    return t ? [t] : [];
  }
  return [];
}
function videoSourceStream() {
  if (screenSharing.value && screenStream.value) return screenStream.value;
  if (cameraEnabled.value && localVideoStream.value) return localVideoStream.value;
  return null;
}
function attachLocalTracks(pc) {
  syncMicSender(pc);
  syncScreenAudioSender(pc);
  syncOptionalVideoSender(pc);
}
var micSenders = /* @__PURE__ */ new WeakMap();
var screenAudioSenders = /* @__PURE__ */ new WeakMap();
function syncMicSender(pc) {
  var _a;
  const l = localStream.value;
  const mic = (l == null ? void 0 : l.getAudioTracks()[0]) || null;
  let sender = micSenders.get(pc);
  if (mic) {
    if (!sender) try {
      sender = pc.addTrack(mic, l);
      micSenders.set(pc, sender);
    } catch (err) {
      console.error("Error adding mic track:", err);
    }
    else if (((_a = sender.track) == null ? void 0 : _a.id) !== mic.id) sender.replaceTrack(mic).catch((err) => console.error("Error replacing mic track:", err));
  } else if (sender == null ? void 0 : sender.track) sender.replaceTrack(null).catch(() => {
  });
}
function syncScreenAudioSender(pc) {
  var _a, _b;
  const screenAudio = screenSharing.value ? (_a = screenStream.value) == null ? void 0 : _a.getAudioTracks()[0] : null;
  let sender = screenAudioSenders.get(pc);
  if (screenAudio) {
    if (!sender) try {
      sender = pc.addTrack(screenAudio, screenStream.value);
      screenAudioSenders.set(pc, sender);
    } catch (err) {
      console.error("Error adding screen audio track:", err);
    }
    else if (((_b = sender.track) == null ? void 0 : _b.id) !== screenAudio.id) sender.replaceTrack(screenAudio).catch(() => {
    });
  } else if (sender) {
    try {
      pc.removeTrack(sender);
    } catch {
    }
    screenAudioSenders.delete(pc);
  }
}
function syncOptionalVideoSender(pc) {
  var _a;
  const vt = optionalVideoTracks();
  const src = videoSourceStream();
  const vidSender = pc.getSenders().find((s) => {
    var _a2;
    return ((_a2 = s.track) == null ? void 0 : _a2.kind) === "video";
  });
  if (vt.length && src) {
    if (!vidSender) pc.addTrack(vt[0], src);
    else if (((_a = vidSender.track) == null ? void 0 : _a.id) !== vt[0].id) vidSender.replaceTrack(vt[0]).catch(() => {
    });
  } else if (!vt.length && vidSender) vidSender.replaceTrack(null).catch(() => {
  });
}
function refreshTracksAcrossPeers() {
  for (const pc of peers.values()) attachLocalTracks(pc);
}
function isScreenLike(e, uid) {
  if (e.track.kind !== "video") return false;
  if (remoteScreening.get(uid)) return true;
  if (e.track.contentHint === "detail") return true;
  const existing = remoteStreams.value[uid];
  if (existing && existing.getVideoTracks().length > 0) return true;
  return false;
}
async function ensureLocalStream() {
  var _a;
  if (localStream.value) return localStream.value;
  if (!((_a = (void 0).mediaDevices) == null ? void 0 : _a.getUserMedia)) throw new Error("\u3053\u306E\u74B0\u5883\u3067\u306F\u30DE\u30A4\u30AF\u3092\u5229\u7528\u3067\u304D\u307E\u305B\u3093");
  localStream.value = await (void 0).mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: false
  });
  localStream.value.getAudioTracks().forEach((t) => {
    t.enabled = !muted.value;
  });
  refreshTracksAcrossPeers();
  return localStream.value;
}
async function setCamera(on) {
  var _a, _b;
  try {
    if (on) {
      if (!localVideoStream.value) localVideoStream.value = await (void 0).mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: currentFacing.value
        },
        audio: false
      });
      cameraEnabled.value = true;
    } else {
      (_a = localVideoStream.value) == null ? void 0 : _a.getTracks().forEach((t) => t.stop());
      localVideoStream.value = null;
      cameraEnabled.value = false;
    }
  } catch {
    (_b = localVideoStream.value) == null ? void 0 : _b.getTracks().forEach((t) => t.stop());
    localVideoStream.value = null;
    cameraEnabled.value = false;
    throw new Error("\u30AB\u30E1\u30E9\u3092\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093");
  }
  refreshTracksAcrossPeers();
}
async function switchCamera() {
  try {
    const next = currentFacing.value === "user" ? "environment" : "user";
    const cur = localVideoStream.value;
    if (cur) {
      const t = cur.getVideoTracks()[0];
      if (t == null ? void 0 : t.applyConstraints) {
        await t.applyConstraints({ facingMode: next });
        currentFacing.value = next;
        return;
      }
    }
    localVideoStream.value = await (void 0).mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: next
      },
      audio: false
    });
    currentFacing.value = next;
    refreshTracksAcrossPeers();
    cur == null ? void 0 : cur.getTracks().forEach((t) => t.stop());
  } catch {
    throw new Error("\u30AB\u30E1\u30E9\u3092\u5207\u308A\u66FF\u3048\u3089\u308C\u307E\u305B\u3093");
  }
}
async function toggleScreenShare() {
  var _a, _b, _c, _d;
  try {
    if (screenSharing.value) {
      (_a = screenStream.value) == null ? void 0 : _a.getTracks().forEach((t) => t.stop());
      screenStream.value = null;
      screenSharing.value = false;
    } else {
      if (!((_b = (void 0).mediaDevices) == null ? void 0 : _b.getDisplayMedia)) throw new Error("\u3053\u306E\u74B0\u5883\u3067\u306F\u753B\u9762\u5171\u6709\u3092\u5229\u7528\u3067\u304D\u307E\u305B\u3093");
      const stream = await (void 0).mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      screenStream.value = stream;
      screenSharing.value = true;
      const sa = stream.getAudioTracks()[0];
      if (sa) sa.enabled = true;
      (_c = stream.getVideoTracks()[0]) == null ? void 0 : _c.addEventListener("ended", () => {
        screenSharing.value = false;
        screenStream.value = null;
        refreshTracksAcrossPeers();
      });
    }
  } catch {
    (_d = screenStream.value) == null ? void 0 : _d.getTracks().forEach((t) => t.stop());
    screenStream.value = null;
    screenSharing.value = false;
  }
  const room = activeRoom.value;
  if (room && status.value === "active") for (const uid of [...peers.keys()]) signalTo(room, uid, {
    type: "screen",
    data: screenSharing.value
  });
  refreshTracksAcrossPeers();
}
function getPeer(room, member) {
  const existing = peers.get(member.userId);
  if (existing) {
    attachLocalTracks(existing);
    return existing;
  }
  const pc = new RTCPeerConnection(PC_CONFIG);
  peers.set(member.userId, pc);
  lastOfferAt.set(member.userId, Date.now());
  attachLocalTracks(pc);
  pc.onicecandidate = (e) => {
    if (e.candidate) signalTo(room, member.userId, {
      type: "ice",
      data: e.candidate
    });
  };
  pc.ontrack = (e) => {
    const uid = member.userId;
    const ms = e.streams[0] || new MediaStream([e.track]);
    const agg = remoteStreams.value[uid] || new MediaStream();
    if (e.track.kind === "audio") {
      if (!agg.getAudioTracks().some((t) => t.id === e.track.id)) try {
        agg.addTrack(e.track);
      } catch {
      }
      remoteStreams.value = {
        ...remoteStreams.value,
        [uid]: agg
      };
      e.track.addEventListener("ended", () => {
        try {
          agg.removeTrack(e.track);
        } catch {
        }
      });
      return;
    }
    if (isScreenLike(e, uid)) {
      remoteScreenStreams.value = {
        ...remoteScreenStreams.value,
        [uid]: ms
      };
      e.track.addEventListener("ended", () => {
        const next = { ...remoteScreenStreams.value };
        delete next[uid];
        remoteScreenStreams.value = next;
        remoteScreening.delete(uid);
      });
      return;
    }
    if (!agg.getVideoTracks().some((t) => t.id === e.track.id)) try {
      agg.addTrack(e.track);
    } catch {
    }
    remoteStreams.value = {
      ...remoteStreams.value,
      [uid]: agg
    };
  };
  pc.onnegotiationneeded = () => {
    if (!me.value) return;
    if (pc.signalingState !== "stable") return;
    pc.createOffer().then((offer) => pc.setLocalDescription(offer)).then(() => signalTo(room, member.userId, {
      type: "offer",
      data: pc.localDescription
    })).catch((err) => console.error("Error in negotiation:", err));
  };
  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState;
    if (state === "failed" || state === "disconnected") {
      const now = Date.now();
      if (now - (lastIceRestart.get(member.userId) || 0) > 6e3) {
        lastIceRestart.set(member.userId, now);
        if (typeof pc.restartIce === "function") try {
          pc.restartIce();
        } catch {
        }
      }
    }
    if (state === "connected") connectionState.value = "connected";
    markConnection();
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "connected") {
      connectionState.value = "connected";
      everConnected.add(member.userId);
      hardResets.delete(member.userId);
      if (whiteboardStrokes.value.length) wbSyncTo(member.userId);
    } else if (pc.connectionState === "closed") closePeer(member.userId);
    markConnection();
  };
  return pc;
}
function markConnection() {
  if (!peers.size) {
    connectionState.value = "new";
    return;
  }
  const states = [...peers.values()].map((p) => p.connectionState);
  if (states.some((s) => s === "connected")) connectionState.value = "connected";
  else if (states.every((s) => s === "failed" || s === "closed")) connectionState.value = "failed";
  else connectionState.value = "connecting";
}
function closePeer(userId) {
  pendingIce.delete(userId);
  lastIceRestart.delete(userId);
  lastOfferAt.delete(userId);
  everConnected.delete(userId);
  processingOffer.delete(userId);
  remoteScreening.delete(userId);
  const pc = peers.get(userId);
  if (pc) {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onnegotiationneeded = null;
    pc.oniceconnectionstatechange = null;
    pc.onconnectionstatechange = null;
    pc.close();
    peers.delete(userId);
  }
  if (remoteStreams.value[userId]) {
    const next = { ...remoteStreams.value };
    delete next[userId];
    remoteStreams.value = next;
  }
  if (remoteScreenStreams.value[userId]) {
    const next = { ...remoteScreenStreams.value };
    delete next[userId];
    remoteScreenStreams.value = next;
  }
}
function recoverPeers(room) {
  if (!me.value) return;
  const now = Date.now();
  for (const [uid, pc] of peers) {
    if (processingOffer.has(uid)) continue;
    if (everConnected.has(uid) && pc.connectionState === "connected") continue;
    const last = lastOfferAt.get(uid) || 0;
    if (pc.connectionState === "failed" || pc.iceConnectionState === "failed") {
      if (now - last < 8e3) continue;
      const resets = hardResets.get(uid) || 0;
      if (resets >= 5) continue;
      hardResets.set(uid, resets + 1);
      lastOfferAt.set(uid, now);
      const member = members.value.find((m) => m.userId === uid);
      closePeer(uid);
      if (member) ensurePeer(room, member);
      continue;
    }
    switch (pc.signalingState) {
      case "have-local-offer":
        if (now - last < 4e3) break;
        lastOfferAt.set(uid, now);
        if (pc.localDescription) signalTo(room, uid, {
          type: "offer",
          data: pc.localDescription
        });
        break;
      case "have-local-answer":
        if (now - last < 4e3) break;
        lastOfferAt.set(uid, now);
        if (pc.localDescription) signalTo(room, uid, {
          type: "answer",
          data: pc.localDescription
        });
        break;
      case "have-remote-offer":
        if (now - last < 4e3) break;
        lastOfferAt.set(uid, now);
        (async () => {
          try {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            signalTo(room, uid, {
              type: "answer",
              data: pc.localDescription
            });
          } catch {
          }
        })();
        break;
      case "stable":
        if (everConnected.has(uid)) break;
        if (pc.remoteDescription != null && pc.iceConnectionState !== "new") break;
        if (now - last < 1e4) break;
        if (me.value.userId >= uid) break;
        lastOfferAt.set(uid, now);
        pc.createOffer().then((o) => pc.setLocalDescription(o)).then(() => signalTo(room, uid, {
          type: "offer",
          data: pc.localDescription
        })).catch(() => {
        });
        break;
    }
  }
}
function startWatchdog() {
  if (watchdog) return;
  watchdog = setInterval();
}
function stopWatchdog() {
  if (watchdog) {
    clearInterval(watchdog);
    watchdog = null;
  }
}
function ensurePeer(room, member) {
  if (me.value && member.userId === me.value.userId) return;
  const pc = getPeer(room, member);
  flushIce(member.userId);
  if (whiteboardStrokes.value.length) wbSyncTo(member.userId);
  return pc;
}
async function handleSignal(msg) {
  var _a;
  const room = activeRoom.value;
  if (!room || msg.roomKey !== room.roomKey) return;
  if (msg.to && me.value && msg.to !== me.value.userId) return;
  const from = msg.from;
  if (!(from == null ? void 0 : from.userId) || from.userId === ((_a = me.value) == null ? void 0 : _a.userId)) return;
  const signal = msg.signal;
  const isPolite = me.value ? me.value.userId < from.userId : true;
  if (signal.type === "screen") {
    remoteScreening.set(from.userId, !!signal.data);
    if (!signal.data && remoteScreenStreams.value[from.userId]) {
      const next = { ...remoteScreenStreams.value };
      delete next[from.userId];
      remoteScreenStreams.value = next;
    }
    return;
  }
  if (signal.type === "offer") {
    if (processingOffer.has(from.userId)) return;
    const b = from.userId;
    async function applyOffer() {
      if (!localStream.value) try {
        await ensureLocalStream();
      } catch {
      }
      await ensureTurn();
      const pc = getPeer(room, from);
      if (pc.signalingState === "have-remote-offer" || pc.signalingState === "have-local-answer") return;
      if (pc.signalingState !== "stable") {
        if (!isPolite) return;
        await pc.setLocalDescription({ type: "rollback" });
      }
      await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signalTo(room, b, {
        type: "answer",
        data: pc.localDescription
      });
      flushIce(b);
    }
    processingOffer.add(b);
    applyOffer().catch((err) => console.error("Error handling offer:", err)).finally(() => processingOffer.delete(b));
    return;
  } else if (signal.type === "answer") {
    const pc = peers.get(from.userId);
    if (pc && pc.signalingState === "have-local-offer") try {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
      flushIce(from.userId);
    } catch (err) {
      console.error("Error handling answer:", err);
    }
  } else if (signal.type === "ice") queueOrAddIce(from.userId, signal.data);
  else if (signal.type === "decline") {
    errorMsg.value = "\u76F8\u624B\u304C\u901A\u8A71\u3092\u62D2\u5426\u3057\u307E\u3057\u305F";
    await leave();
  } else if (signal.type === "reaction") {
    const id = Date.now() + Math.random();
    reactions.value.push({
      id,
      from: from.userId,
      emoji: signal.data
    });
    setTimeout(() => {
      reactions.value = reactions.value.filter((r) => r.id !== id);
    }, 3200);
  } else if (signal.type === "wb") {
    whiteboardEvents.value.push({
      from: from.userId,
      data: signal.data
    });
    if (applyWbData(signal.data)) scheduleWbSave();
  }
}
function handleUpdate(msg) {
  var _a;
  if (!msg.roomKey) return;
  const count = (msg.members || []).length;
  presence.value = {
    ...presence.value,
    [msg.roomKey]: count
  };
  if (!((_a = me.value) == null ? void 0 : _a.userId)) return;
  const room = activeRoom.value;
  if (room && msg.roomKey === room.roomKey && (status.value === "connecting" || status.value === "active")) {
    const list = msg.members || [];
    members.value = list;
    for (const m of list) if (m.userId !== me.value.userId) ensurePeer(room, m);
    const currentIds = new Set(list.map((m) => m.userId));
    for (const id of [...peers.keys()]) if (!currentIds.has(id)) closePeer(id);
    return;
  }
  if (incoming.value && msg.roomKey === incoming.value.roomKey) {
    if (!(msg.members || []).some((m) => {
      var _a2;
      return m.userId === ((_a2 = incoming.value) == null ? void 0 : _a2.from.userId);
    })) incoming.value = null;
  }
  if (!watchedRooms.has(msg.roomKey) && typeof msg.roomKey === "string" && msg.roomKey.startsWith("dm:")) {
    pendingVoiceUpdates.set(msg.roomKey, msg);
    scheduleDmWatchRefresh();
  }
  tryIncoming(msg);
}
var pendingVoiceUpdates = /* @__PURE__ */ new Map();
function tryIncoming(msg) {
  if (status.value !== "idle" || incoming.value) return;
  const watched = watchedRooms.get(msg.roomKey);
  if (!watched || watched.kind !== "dm") return;
  const caller = (msg.members || []).find((m) => {
    var _a;
    return m.userId !== ((_a = me.value) == null ? void 0 : _a.userId);
  });
  if (caller) incoming.value = {
    room: watched,
    from: caller
  };
}
var dmRefreshTimer = null;
function scheduleDmWatchRefresh() {
  if (dmRefreshTimer) return;
  dmRefreshTimer = setTimeout(() => {
    dmRefreshTimer = null;
    refreshDmRooms().catch(() => {
    });
  }, 500);
}
function init() {
  if (initialized) return;
  initialized = true;
  const { on } = useRealtime();
  on("voice.update", handleUpdate), on("voice.signal", handleSignal), on("realtime.reconnect", handleRealtimeReconnect);
  ensureTurn();
  ensureMe().then(watchAllDmRooms).catch(() => {
  });
}
async function handleRealtimeReconnect() {
  const room = activeRoom.value;
  if (!room || status.value !== "active" && status.value !== "connecting") return;
  $fetch$1(room.joinPath, { method: "POST" }).then((res) => {
    var _a;
    if (res == null ? void 0 : res.members) {
      members.value = res.members || [];
      for (const m of members.value) if (m.userId !== ((_a = me.value) == null ? void 0 : _a.userId)) ensurePeer(room, m);
    }
  }).catch(() => {
  });
  for (const [uid, pc] of peers) {
    if (pc.connectionState === "connected") continue;
    lastOfferAt.set(uid, 0);
    if (pc.signalingState === "stable" || pc.iceConnectionState === "failed") try {
      if (typeof pc.restartIce === "function") pc.restartIce();
    } catch {
    }
  }
  recoverPeers(room);
}
async function watchAllDmRooms() {
  try {
    const data = await $fetch$1("/api/dm/channels");
    for (const ch of data.channels || []) {
      const roomKey = `dm:${ch.id}`;
      const label = (ch.members || []).filter((m) => {
        var _a;
        return m.id !== ((_a = me.value) == null ? void 0 : _a.userId);
      }).map((m) => m.displayName || m.username).join(", ") || "DM\u901A\u8A71";
      watchedRooms.set(roomKey, {
        roomKey,
        joinPath: `/api/dm/channels/${ch.id}/voice/join`,
        leavePath: `/api/dm/channels/${ch.id}/voice/leave`,
        signalPath: `/api/dm/channels/${ch.id}/voice/signal`,
        label,
        kind: "dm"
      });
    }
  } catch {
  }
}
async function refreshDmRooms() {
  for (const key of [...watchedRooms.keys()]) if (key.startsWith("dm:")) watchedRooms.delete(key);
  await ensureMe().catch(() => {
  });
  await watchAllDmRooms();
  for (const msg of [...pendingVoiceUpdates.values()]) tryIncoming(msg);
  pendingVoiceUpdates.clear();
}
function watchRoom(cfg) {
  init();
  watchedRooms.set(cfg.roomKey, cfg);
}
function unwatchRoom(roomKey) {
  var _a;
  watchedRooms.delete(roomKey);
  if (((_a = activeRoom.value) == null ? void 0 : _a.roomKey) === roomKey) leave();
}
var joinSeq = 0;
async function join(cfg) {
  var _a, _b;
  init();
  const seq = ++joinSeq;
  if (cfg && activeRoom.value && activeRoom.value.roomKey !== cfg.roomKey) {
    saveWbNow();
    const prev = activeRoom.value;
    activeRoom.value = null;
    status.value = "idle";
    connectionState.value = "new";
    members.value = [];
    incoming.value = null;
    stopWatchdog();
    for (const id of [...peers.keys()]) closePeer(id);
    remoteStreams.value = {};
    remoteScreenStreams.value = {};
    hardResets.clear();
    everConnected.clear();
    $fetch$1(prev.leavePath, { method: "POST" }).catch(() => {
    });
  }
  if (cfg) activeRoom.value = cfg;
  const room = activeRoom.value;
  if (!room) return;
  status.value = "connecting";
  connectionState.value = "connecting";
  errorMsg.value = null;
  try {
    await ensureTurn();
    await ensureMe();
    if (seq !== joinSeq) return;
    await ensureLocalStream();
    if (seq !== joinSeq) return;
    const res = await $fetch$1(room.joinPath, { method: "POST" });
    if (seq !== joinSeq) return;
    members.value = res.members || [];
    status.value = "active";
    startWatchdog();
    for (const m of res.members || []) if (m.userId !== ((_a = me.value) == null ? void 0 : _a.userId)) ensurePeer(room, m);
    loadWbForRoom(room.roomKey);
  } catch (e) {
    errorMsg.value = ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || (e == null ? void 0 : e.message) || "\u901A\u8A71\u306B\u53C2\u52A0\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F";
    if (seq === joinSeq) {
      activeRoom.value = null;
      status.value = "idle";
      connectionState.value = "new";
    }
  }
}
async function leave() {
  var _a, _b, _c;
  joinSeq++;
  const room = activeRoom.value;
  saveWbNow();
  activeRoom.value = null;
  status.value = "idle";
  connectionState.value = "new";
  members.value = [];
  incoming.value = null;
  stopWatchdog();
  for (const id of [...peers.keys()]) closePeer(id);
  (_a = localStream.value) == null ? void 0 : _a.getTracks().forEach((t) => t.stop());
  localStream.value = null;
  (_b = localVideoStream.value) == null ? void 0 : _b.getTracks().forEach((t) => t.stop());
  localVideoStream.value = null;
  (_c = screenStream.value) == null ? void 0 : _c.getTracks().forEach((t) => t.stop());
  screenStream.value = null;
  cameraEnabled.value = false;
  screenSharing.value = false;
  remoteStreams.value = {};
  remoteScreenStreams.value = {};
  hardResets.clear();
  everConnected.clear();
  if (room) $fetch$1(room.leavePath, { method: "POST" }).catch(() => {
  });
}
async function acceptCall() {
  const inc = incoming.value;
  incoming.value = null;
  if (!inc) return;
  await join(inc.room);
}
async function declineCall() {
  const inc = incoming.value;
  incoming.value = null;
  if (!inc) return;
  $fetch$1(inc.room.signalPath, {
    method: "POST",
    body: {
      to: inc.from.userId,
      signal: { type: "decline" }
    }
  }).catch(() => {
  });
}
function toggleMute() {
  var _a;
  muted.value = !muted.value;
  (_a = localStream.value) == null ? void 0 : _a.getAudioTracks().forEach((t) => {
    t.enabled = !muted.value;
  });
}
function toggleSpeakerMute() {
  speakerMuted.value = !speakerMuted.value;
}
function sendReaction(emoji) {
  var _a;
  const room = activeRoom.value;
  if (!room || status.value !== "active") return;
  const id = Date.now() + Math.random();
  reactions.value.push({
    id,
    from: ((_a = me.value) == null ? void 0 : _a.userId) || "me",
    emoji
  });
  setTimeout(() => {
    reactions.value = reactions.value.filter((r) => r.id !== id);
  }, 3200);
  for (const uid of [...peers.keys()]) signalTo(room, uid, {
    type: "reaction",
    data: emoji
  });
}
var wbSaveTimer = null;
function applyWbData(data) {
  var _a;
  if ((_a = data == null ? void 0 : data.segments) == null ? void 0 : _a.length) whiteboardStrokes.value = [...whiteboardStrokes.value, {
    segments: data.segments,
    color: data.color,
    width: data.width
  }];
  else if (data == null ? void 0 : data.clear) whiteboardStrokes.value = [];
  else if (Array.isArray(data == null ? void 0 : data.sync)) whiteboardStrokes.value = data.sync;
  else return false;
  return true;
}
function wbSyncTo(uid) {
  const room = activeRoom.value;
  if (!room || !whiteboardStrokes.value.length) return;
  signalTo(room, uid, {
    type: "wb",
    data: { sync: whiteboardStrokes.value }
  });
}
function scheduleWbSave() {
  if (!activeRoom.value || status.value !== "active") return;
  if (wbSaveTimer) clearTimeout(wbSaveTimer);
  wbSaveTimer = setTimeout(() => {
    wbSaveTimer = null;
    saveWbNow();
  }, 2e3);
}
function saveWbNow() {
  const room = activeRoom.value;
  if (!room) return;
  if (wbSaveTimer) {
    clearTimeout(wbSaveTimer);
    wbSaveTimer = null;
  }
  $fetch$1("/api/whiteboard", {
    method: "POST",
    body: {
      roomKey: room.roomKey,
      strokes: whiteboardStrokes.value
    }
  }).catch(() => {
  });
}
async function loadWbForRoom(roomKey) {
  try {
    const res = await $fetch$1(`/api/whiteboard/${encodeURIComponent(roomKey)}`);
    if (Array.isArray(res == null ? void 0 : res.strokes)) whiteboardStrokes.value = res.strokes;
  } catch {
  }
  for (const uid of [...peers.keys()]) wbSyncTo(uid);
}
function sendWhiteboard(data) {
  const room = activeRoom.value;
  if (!room) return;
  if (applyWbData(data)) scheduleWbSave();
  for (const uid of [...peers.keys()]) signalTo(room, uid, {
    type: "wb",
    data
  });
}
function useVoiceCall() {
  init();
  return {
    me,
    activeRoom,
    status,
    connectionState,
    callState,
    errorMsg,
    muted,
    speakerMuted,
    members,
    remoteStreams,
    localStream,
    cameraEnabled,
    screenSharing,
    localVideoStream,
    screenStream,
    incoming,
    presence,
    reactions,
    whiteboardEvents,
    whiteboardStrokes,
    remoteScreenStreams,
    currentFacing,
    watchRoom,
    unwatchRoom,
    refreshDmRooms,
    join,
    leave,
    acceptCall,
    declineCall,
    toggleMute,
    toggleSpeakerMute,
    setCamera,
    switchCamera,
    toggleScreenShare,
    sendReaction,
    sendWhiteboard
  };
}

export { useVoiceCall as u };
//# sourceMappingURL=useVoiceCall-c99S1h1A.mjs.map
