import { ref } from 'vue';

var activityUnread = ref(0);
var dmUnread = ref(0);
var dmUnreadChannels = ref(/* @__PURE__ */ new Set());
var dmLatest = ref(null);
async function init() {
}
function markActivityRead() {
}
function markDmRead(ids) {
}
function hasDmUnread(channelId) {
  return !!dmUnreadChannels.value.has(channelId);
}
function useUnread() {
  return {
    init,
    activityUnread,
    dmUnread,
    dmLatest,
    dmUnreadChannels,
    hasDmUnread,
    markActivityRead,
    markDmRead
  };
}

export { useUnread as u };
//# sourceMappingURL=useUnread-C7Vd8IF6.mjs.map
