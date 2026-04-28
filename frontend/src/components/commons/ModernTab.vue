<script setup>
const tabName = defineProps({
  name: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <li class="mainTab">
    {{ name }}
  </li>
</template>
<style scoped>
.mainTab {
  background-color: var(--background);
  width: fit-content;
  height: 45px;
  padding: 10px;
  padding-right: 30px;
  padding-left: 20px;
  line-height: calc(45px - 20px);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  position: relative;
  margin-right: 25px;
  cursor: pointer;
  user-select: none;
}

.mainTab:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.mainTab:hover + .main::after {
  content: "";
  display: block;
  width: 25px;
  height: 25px;
  position: absolute;
  /* 親要素(main)に対して右上に配置する例 */
  top: -25px;
  left: 0;

  /* 背景は透明にする（ここが none だと動かない） */
  background-color: transparent;

  /* 正円を作る */
  border-radius: 50%;

  /* 影で「逆角丸」を塗りつぶす */
  /* 第4引数の「0」はボカシなし、最後は背景と同じ色を指定してね！ */
  box-shadow: -10px 10px 0 0 #0f1715;

  /* 親要素からハミ出しても見えるように */
  z-index: 1;
}

.mainTab::after {
  display: block;
  content: "";
  width: 25px;
  height: 25px;
  position: absolute;
  right: -25px;
  border-radius: 50%;
  bottom: 0;
  box-shadow: -15px 15px 0 var(--background);
}

/* .mainTab::before {
  display: block;
  content: "";
  width: 25px;
  height: 25px;
  position: absolute;
  left: -25px;
  border-radius: 50%;
  bottom: 0;
  box-shadow: 15px 15px 0 var(--background);
} */
</style>
