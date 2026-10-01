import { f as useState, $ as $fetch$1 } from '../virtual/entry.mjs';

function useAccounts() {
  const accounts = useState("sycs:accounts-list", () => {
    return [];
  });
  function addAccount(user, token) {
    if (!(user == null ? void 0 : user.id) || !token) return;
    const existing = accounts.value.find((a) => a.id === user.id);
    if (existing) {
      existing.token = token;
      existing.username = user.username;
      existing.displayName = user.displayName;
      existing.avatarUrl = user.avatarUrl;
    } else accounts.value.push({
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatarUrl: user.avatarUrl || null,
      token,
      savedAt: Date.now()
    });
  }
  async function captureStoredToken() {
  }
  async function switchAccount(account) {
    await $fetch$1("/api/auth/swap", {
      method: "POST",
      body: { token: account.token }
    });
  }
  function removeAccount(id) {
    accounts.value = accounts.value.filter((a) => a.id !== id);
  }
  const switcherOpen = useState("sycs:account-switcher-open", () => false);
  function openSwitcher() {
    switcherOpen.value = true;
  }
  function closeSwitcher() {
    switcherOpen.value = false;
  }
  return {
    accounts,
    addAccount,
    captureStoredToken,
    switchAccount,
    removeAccount,
    switcherOpen,
    openSwitcher,
    closeSwitcher
  };
}

export { useAccounts as u };
//# sourceMappingURL=useAccounts-SBXochGK.mjs.map
