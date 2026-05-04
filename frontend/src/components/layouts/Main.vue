<script setup>
import PrimarySidebar from "../commons/PrimarySidebar.vue";
import Vertical from "../configurations/Vertical.vue";
import ModernTab from "../commons/ModernTab.vue";
</script>

<template>
  <main>
    <Vertical class="mainContainer">
      <section class="optionUtilTabs">
        <ModernTab name="グローバル" ui="Globe" url="/global" />
        <ModernTab name="ローカル" ui="GlobeLock" url="/local" />
        <ModernTab name="フォロー" ui="UserCheck" url="/follow" />
        <ModernTab name="タイムライン" ui="UtilityPole" url="/timeline" />
      </section>
      <aside>
        <p>Main Component</p>
      </aside>
    </Vertical>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--background);
  color: var(--text-primary);
}
.mainContainer {
  width: 100%;
}
.optionUtilTabs {
  height: calc(45px - var(--tiny-gap));
  width: calc(100% - var(--tiny-gap));
  margin-bottom: var(--tiny-gap);
  margin-top: var(--tiny-gap);
  display: flex;
  list-style: none;
  overflow: hidden;
}
aside {
  width: calc(100% - var(--tiny-gap));
  /* width: 60px; */
  display: flex;
  flex-direction: column;
  /* height: calc(100vh - var(--tiny-gap) * 2 - 45px); */
  height: 100vh;
  background-color: var(--background);
  color: var(--text-primary);
  padding: var(--sidebar-paddingSize);
  /* add */
  margin: var(--tiny-gap);
  border-radius: calc(var(--tiny-gap) * 2);
  position: relative;

  /* not include */
  margin-left: 0px;
  margin-top: 0px;
}
</style>
