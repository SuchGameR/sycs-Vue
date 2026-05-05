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
        <div class="profile_status_rings"></div>
        <img
          :src="avatarUrl || '/kiwibird-discord.png'"
          :alt="username"
          class="profile_avatar"
        />
      </div>
      <div class="username">
        {{ username }}
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  padding: 0 ;
  margin: 0 ;
  box-sizing: border-box;
}

.profile {
  display: flex;
  width: 100%;
  height: 60px;
  line-height: 30px;
  overflow: hidden;
  font-size: 0.9rem;
  cursor: pointer;
}

.profile * {
  font-family: IBMPlexSansJP-B, sans-serif;
}

.container {
  align-items: center;
  display: flex;
  user-select: none;
  padding: 10px;
  width: 100%;
}

.profile_avatar_container {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.profile_status_rings {
  width: 35px;
  border-radius: 100%;
  aspect-ratio: 1/1;
  position: absolute;
}

.profile_avatar {
  outline: solid 2.8px rgb(50, 170, 92);
  border: solid 1.8px white;
  border-radius: 100%;
  outline-offset: 0px;
  width: 35px;
  aspect-ratio: 1/1;
}

.username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@container small (max-width: 170px) {
  .username {
    display: none;
  }
  .container {
    justify-content: center;
    padding: 10px 0;
  }
  .profile_avatar_container {
    margin-right: 0;
  }
}
</style>