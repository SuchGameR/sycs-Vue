import { m as useState } from '../virtual/entry.mjs';
import { computed } from 'vue';

var MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i;
function isModelAttachment(att) {
  if (String((att == null ? void 0 : att.mime) || (att == null ? void 0 : att.type) || "").toLowerCase().startsWith("model/")) return true;
  return MODEL_EXT.test(String((att == null ? void 0 : att.url) || ""));
}
function mediaKindOf(post) {
  const atts = (post == null ? void 0 : post.attachments) || [];
  if (atts.some((a) => String(a.mime || a.type || "").startsWith("video"))) return "video";
  if (atts.some((a) => String(a.mime || a.type || "").startsWith("audio"))) return "audio";
  if (atts.some(isModelAttachment)) return "model";
  if (atts.some((a) => String(a.mime || a.type || "").startsWith("image"))) return "image";
  if (atts.length) return "file";
  return "text";
}
function useMediaPane() {
  const selected = useState("media-pane:post", () => null);
  const sourceLabel = useState("media-pane:source", () => "");
  const width = useState("media-pane:width", () => {
    return 460;
  });
  const mobileFull = useState("media-pane:mobile-full", () => false);
  const mobileMinimized = useState("media-pane:mobile-min", () => false);
  const isOpen = computed(() => !!selected.value);
  const kind = computed(() => mediaKindOf(selected.value));
  function openPost(post, label = "") {
    var _a;
    if (!post) return;
    if (((_a = selected.value) == null ? void 0 : _a.id) === post.id) {
      close();
      return;
    }
    selected.value = post;
    sourceLabel.value = label;
    mobileFull.value = false;
    mobileMinimized.value = false;
  }
  function togglePost(post, label = "") {
    openPost(post, label);
  }
  function close() {
    selected.value = null;
    sourceLabel.value = "";
    mobileFull.value = false;
    mobileMinimized.value = false;
  }
  function setWidth(value) {
    width.value = Math.min(Math.max(value, 320), 900);
  }
  function openMobileFull(post, label = "") {
    if (post) {
      selected.value = post;
      sourceLabel.value = label;
    }
    mobileFull.value = true;
    mobileMinimized.value = false;
  }
  function minimizeMobile() {
    mobileFull.value = false;
    mobileMinimized.value = true;
  }
  function closeMobile() {
    mobileFull.value = false;
    mobileMinimized.value = false;
    close();
  }
  function updatePost(post) {
    var _a;
    if (((_a = selected.value) == null ? void 0 : _a.id) === post.id) selected.value = post;
  }
  return {
    selected,
    sourceLabel,
    width,
    mobileFull,
    mobileMinimized,
    isOpen,
    kind,
    openPost,
    togglePost,
    close,
    setWidth,
    openMobileFull,
    minimizeMobile,
    closeMobile,
    updatePost
  };
}

export { useMediaPane as u };
//# sourceMappingURL=useMediaPane-BrRmAswF.mjs.map
