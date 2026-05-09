<template>
  <div>
    <header>
      <div class="header-container">
        <router-link to="/">
          <div class="logo">
            <img src="/public/svgLogoOutline.svg" alt="Logo" class="logo" />
          </div>
        </router-link>
      </div>
    </header>
    <main>
      <div class="page-title">
        <span>About</span>
        <h1>SYCS PROJECT</h1>
      </div>
      <p>This is the about page.</p>

      <div class="authors">
        <h2>Authors</h2>
        <ul>
          <li>
            <img
              src="https://cdn.discordapp.com/avatars/1161667770900029450/d052f4c05bf8218e9b71d09eae989c30.webp?size=1024
  "
              alt="Username 1"
              width="32"
              height="32"
            />
            <a href="https://github.com/yyyg1114" target="_blank">yyyg1114</a>
          </li>
          <li>
            <img
              src="https://cdn.discordapp.com/avatars/883967557672009739/a1a213f25ebc6eee159a3a2176f36c39.webp?size=1024"
              alt="Username 2"
              width="32"
              height="32"
            />
            <a href="https://github.com/suchgamer" target="_blank">SGR</a>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
//
</script>

<style scoped>
.page-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
header {
  display: flex;
  align-items: center;
  padding: 10px;
  height: 80px;
  background-color: var(--header-bg-color);
  justify-content: flex-start;
  width: 100%;
}
.header-container {
  justify-content: flex-start;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 800px;
  margin: 0 auto;
}
.logo {
  display: flex;
  align-items: center;
  width: 48px;
  height: 48px;
  justify-content: center;
}
.logo img {
  width: 40px;
  height: auto;
}
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: red;
}
.authors {
  margin-top: 20px;
}
.authors ul {
  list-style-type: none;
  padding: 0;
}
.authors li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.authors img {
  aspect-ratio: 1 / 1;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}
.authors a {
  text-decoration: none;
  color: #333;
}
.authors a:hover {
  text-decoration: underline;
}
</style>
