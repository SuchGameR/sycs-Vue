import { ref, watch } from 'vue';

function useInfiniteScroll(onLoad, options = {}) {
  const sentinel = ref(null);
  const loading = ref(false);
  const done = ref(false);
  let observer = null;
  async function loadMore() {
    if (loading.value || done.value) return;
    loading.value = true;
    try {
      const result = await onLoad();
      const hasMore = result && typeof result === "object" && "hasMore" in result ? !!result.hasMore : result !== false;
      done.value = !hasMore;
    } finally {
      loading.value = false;
    }
  }
  function reset() {
    done.value = false;
  }
  function observe(el) {
    observer == null ? void 0 : observer.disconnect();
    observer = null;
  }
  watch(sentinel, (el) => observe(), { immediate: true });
  return {
    sentinel,
    loading,
    done,
    loadMore,
    reset,
    observe
  };
}

export { useInfiniteScroll as u };
//# sourceMappingURL=useInfiniteScroll-BXxYHd5b.mjs.map
