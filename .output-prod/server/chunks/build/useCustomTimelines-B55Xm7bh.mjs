import { m as useState } from '../virtual/entry.mjs';
import { computed } from 'vue';

var fixedTabs = [
  {
    id: "following",
    label: "\u30D5\u30A9\u30ED\u30FC\u4E2D",
    fixed: true,
    preset: "following",
    conditions: {
      scope: "following",
      sort: "latest"
    }
  },
  {
    id: "recommended",
    label: "\u30AA\u30B9\u30B9\u30E1",
    fixed: true,
    preset: "recommended",
    conditions: {
      scope: "recommended",
      sort: "popular"
    }
  },
  {
    id: "latest",
    label: "\u6700\u65B0",
    fixed: true,
    preset: "latest",
    conditions: {
      scope: "global",
      sort: "latest"
    }
  }
];
var TIMELINE_PRESETS = [
  {
    key: "video",
    label: "\u52D5\u753B",
    icon: "lucide:video",
    conditions: {
      scope: "global",
      mediaType: "video",
      sort: "latest"
    }
  },
  {
    key: "image",
    label: "\u753B\u50CF",
    icon: "lucide:image",
    conditions: {
      scope: "global",
      mediaType: "image",
      sort: "latest"
    }
  },
  {
    key: "audio",
    label: "\u97F3\u697D",
    icon: "lucide:music",
    conditions: {
      scope: "global",
      mediaType: "audio",
      sort: "latest"
    }
  },
  {
    key: "text",
    label: "\u30C6\u30AD\u30B9\u30C8",
    icon: "lucide:type",
    conditions: {
      scope: "global",
      mediaType: "text",
      sort: "latest"
    }
  },
  {
    key: "trending",
    label: "\u6025\u4E0A\u6607",
    icon: "lucide:trending-up",
    conditions: {
      scope: "global",
      sort: "popular"
    }
  },
  {
    key: "following",
    label: "\u30D5\u30A9\u30ED\u30FC\u4E2D",
    icon: "lucide:users",
    conditions: {
      scope: "following",
      sort: "latest"
    }
  },
  {
    key: "local",
    label: "\u30ED\u30FC\u30AB\u30EB",
    icon: "lucide:heart-handshake",
    conditions: {
      scope: "local",
      sort: "latest"
    }
  },
  {
    key: "similar",
    label: "\u4F3C\u3066\u308B\u3082\u306E",
    icon: "lucide:sparkles",
    conditions: {
      scope: "recommended",
      sort: "popular",
      includeRelated: true
    }
  }
];
function loadPersisted() {
  return {
    tabs: [],
    activeId: "following"
  };
}
function useCustomTimelines() {
  const customTabs = useState("timelines:custom", () => loadPersisted().tabs);
  const activeId = useState("timelines:active", () => loadPersisted().activeId);
  function persist() {
  }
  const pinnedTabs = computed(() => customTabs.value.filter((t) => t.pinned));
  const unpinnedTabs = computed(() => customTabs.value.filter((t) => !t.pinned));
  const allTabs = computed(() => [...fixedTabs, ...customTabs.value]);
  const activeTab = computed(() => allTabs.value.find((t) => t.id === activeId.value) || fixedTabs[0]);
  function setActive(id) {
    activeId.value = id;
  }
  function addTab(tab) {
    const id = tab.id || `custom-${Date.now().toString(36)}`;
    customTabs.value = [...customTabs.value, {
      ...tab,
      id,
      fixed: false
    }];
    activeId.value = id;
    return id;
  }
  function updateTab(id, patch) {
    customTabs.value = customTabs.value.map((t) => t.id === id ? {
      ...t,
      ...patch
    } : t);
  }
  function removeTab(id) {
    customTabs.value = customTabs.value.filter((t) => t.id !== id);
    if (activeId.value === id) activeId.value = fixedTabs[0].id;
  }
  function togglePin(id) {
    customTabs.value = customTabs.value.map((t) => t.id === id ? {
      ...t,
      pinned: !t.pinned
    } : t);
  }
  function buildQuery(tab) {
    const c = (tab || activeTab.value).conditions;
    const params = {
      scope: c.scope,
      sort: c.sort || "latest",
      limit: 10
    };
    if (c.mediaType) params.mediaType = c.mediaType;
    if (c.includeRelated) params.related = "true";
    if (c.serverId) params.serverId = c.serverId;
    if (c.channelId) params.channelId = c.channelId;
    return params;
  }
  return {
    fixedTabs,
    customTabs,
    pinnedTabs,
    unpinnedTabs,
    allTabs,
    activeId,
    activeTab,
    setActive,
    addTab,
    updateTab,
    removeTab,
    togglePin,
    buildQuery,
    persist
  };
}

export { TIMELINE_PRESETS as T, useCustomTimelines as u };
//# sourceMappingURL=useCustomTimelines-B55Xm7bh.mjs.map
