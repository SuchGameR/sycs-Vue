<script setup>
import { columnSlot } from "../gimmicks/columnSlot.vue";
import { PrimaryButton } from "../commons/PrimaryButton.vue";
import { Sidebar } from "../gimmicks/Sidebar.vue";
</script>

<template>
  <Sidebar>
    <columnSlot>
      <PrimaryButton name="AAAA" ui="Home" />
      <PrimaryButton name="AAAA" ui="Video" />
      <PrimaryButton name="AAAA" ui="Home" />
    </columnSlot>
  </Sidebar>
</template>

<style scoped></style>
