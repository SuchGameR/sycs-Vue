<script setup lang="ts">
const profileData = defineProps({
  username: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    default: "/kiwibird-discord.png",
  },
});
</script>

<template>
  <div class="profile" @click="$emit('click')">
    <div class="container">
      <div class="profile_avatar_container">
        <img
          :src="avatarUrl || '/kiwibird-discord.png'"
          :alt="username"
          class="profile_avatar"
        />
        <div class="status-indicator"></div>
      </div>
      <div class="profile-info">
        <span class="username">{{ username }}</span>
        <span class="status-text">オンライン</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  width: 100%;
  height: 70px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s;
}

.profile:hover {
  background: rgba(255, 255, 255, 0.05);
}

.container {
  align-items: center;
  display: flex;
  user-select: none;
  padding: 10px 16px;
  width: 100%;
  gap: 12px;
}

.profile_avatar_container {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.profile_avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #23a559;
  border-radius: 50%;
  border: 3px solid var(--surface);
}

.profile-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.username {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
}

@container small (max-width: 170px) {
  .profile-info {
    display: none;
  }
  .container {
    justify-content: center;
    padding: 10px 0;
  }
}
</style>
