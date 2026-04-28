<script setup lang="ts">
const profileData = defineProps({
  username: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="profile">
    <div class="container">
      <div class="profile_avatar_container">
        <div class="profile_status_rings"></div>
        <img
          src="../../../public/kiwibird-discord.png"
          alt="{{ username }}"
          class="profile_avatar"
        />
      </div>
      <div>
        {{ username }}
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.profile {
  display: flex;
  /* background-color: #e4e4e4; */
  width: 100%;
  height: 60px;
  /* border-radius: calc(var(--tiny-gap) * 2); */
  line-height: 30px;
  overflow: hidden;
  font-size: 0.9rem;
}

.profile * {
  font-family: IBMPlexSansJP-B, sans-serif;
}

.container {
  align-items: center;
  display: flex;
  user-select: none;
  padding: 10px;
}

.profile_avatar_container {
  position: relative; /* 子要素のabsoluteの基準にするよ */
  width: 42px; /* アウトライン分を含めたサイズに調整 */
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
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
</style>
