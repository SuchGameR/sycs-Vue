import { readonly, ref } from 'vue';

var compact = ref(false);
function useScrollCompact() {
  return {
    compact: readonly(compact),
    setCompact(value) {
      compact.value = value;
    }
  };
}

export { useScrollCompact as u };
//# sourceMappingURL=useScrollCompact-j_xEyUxM.mjs.map
