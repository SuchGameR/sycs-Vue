import { m as useState, $ as $fetch$1 } from '../virtual/entry.mjs';

function usePlaylists() {
  const playlists = useState("playlists-list", () => []);
  const loading = useState("playlists-loading", () => false);
  const addTarget = useState("playlist-add-target", () => null);
  async function fetchList(force = false, postId) {
    if (loading.value) return;
    if (!force && playlists.value.length && !postId) return;
    loading.value = true;
    try {
      const data = await $fetch$1("/api/playlists", { params: postId ? { postId } : {} });
      playlists.value = data.playlists || [];
    } catch {
      playlists.value = [];
    } finally {
      loading.value = false;
    }
  }
  async function create(name, description) {
    const data = await $fetch$1("/api/playlists", {
      method: "POST",
      body: {
        name,
        description
      }
    });
    playlists.value = [data.playlist, ...playlists.value];
    return data.playlist;
  }
  async function remove(id) {
    await $fetch$1(`/api/playlists/${id}`, { method: "DELETE" });
    playlists.value = playlists.value.filter((p) => p.id !== id);
  }
  async function addItem(playlistId, postId) {
    await $fetch$1(`/api/playlists/${playlistId}/items`, {
      method: "POST",
      body: { postId }
    });
    const list = playlists.value.find((p) => p.id === playlistId);
    if (list) {
      list.count = (list.count || 0) + 1;
      list.contains = true;
    }
  }
  async function removeItem(playlistId, postId) {
    await $fetch$1(`/api/playlists/${playlistId}/items/${postId}`, { method: "DELETE" });
    const list = playlists.value.find((p) => p.id === playlistId);
    if (list) {
      list.count = Math.max(0, (list.count || 0) - 1);
      list.contains = false;
    }
  }
  function openAdd(post) {
    addTarget.value = post;
  }
  function closeAdd() {
    addTarget.value = null;
  }
  return {
    playlists,
    loading,
    addTarget,
    fetchList,
    create,
    remove,
    addItem,
    removeItem,
    openAdd,
    closeAdd
  };
}

export { usePlaylists as u };
//# sourceMappingURL=usePlaylists-B4pGRAuh.mjs.map
