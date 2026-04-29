<script setup>
import PrimaryButton from "../commons/PrimaryButton.vue";
</script>

<template>
  <PrimaryButton name="ホーム" ui="Armchair" url="/" />
  <PrimaryButton name="メッセージ" ui="MessageCircle" url="message" />
  <PrimaryButton name="通知" ui="BellRing" url="notice" />
  <PrimaryButton name="お気に入り" ui="Heart" url="favorite" />
  <hr />
  <PrimaryButton name="サーバー" ui="Plus" />
</template>

<style scoped>
hr {
  border: none;
  border-top: solid 3px var(--primary);
  opacity: 0.1;
  border-radius: 3px;
  margin: var(--sidebar-paddingSize);
  margin-top: calc(var(--sidebar-paddingSize) * 2);
  margin-bottom: calc(var(--sidebar-paddingSize) * 2);
}
</style>
