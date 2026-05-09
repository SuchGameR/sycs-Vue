<script setup lang="ts"></script>

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
      <p>
        学生が共同で開発しているコミュニティプロジェクトです。<br />
        2026年1月上旬から開発を開始し、現在もアップデートを続けています。<br />
      </p>

      <div class="urls">
        <hr />
        <div>
          <a href="https://github.com/yyyg1114/SYCS" target="_blank">
            <img src="../../public/github.svg" alt="GitHub" class="icon" />
          </a>
          <a href="https://github.com/suchgamer/sycs-Vue" target="_blank">
            <img src="../../public/github.svg" alt="GitHub" class="icon" />
          </a>
        </div>
      </div>
      <br />

      <div class="authors">
        <h4>Team Members</h4>
        <br />
        <ul>
          <li>
            <img
              src="https://cdn.discordapp.com/avatars/1161667770900029450/d052f4c05bf8218e9b71d09eae989c30.webp?size=1024
  "
              alt="Main Author"
              width="32"
              height="32"
            />
            <a href="https://github.com/yyyg1114" target="_blank">YYYG1114</a>
            <span>PHP based Author</span>
          </li>
          <li>
            <img
              src="https://cdn.discordapp.com/avatars/832876102573097020/d81525b08cd6b150386e9adfea3e393a.webp?size=1024"
              alt="Debugger"
              width="32"
              height="32"
            />
            <a href="https://github.com/FNTS-HAYA" target="_blank">FNTS-HAYA</a>
            <span>Debugger</span>
          </li>
          <li>
            <img
              src="https://cdn.discordapp.com/avatars/883967557672009739/a1a213f25ebc6eee159a3a2176f36c39.webp?size=1024"
              alt="Sub Author"
              width="32"
              height="32"
            />
            <a href="https://github.com/suchgamer" target="_blank">SuchGameR</a>
            <span>VueJS based Author</span>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.urls {
  display: flex;
  margin-top: 20px;
}
.url div {
  display: flex;
  align-items: center;
}
.urls hr {
  flex: 1;
  border: none;
  border-top: 1px solid var(--border);
  margin: 16px 0px;
  margin-right: 16px;
}
.urls .icon {
  width: 32px;
  height: 32px;
}
.urls a {
}
.page-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  color: var(--primary);
}
.page-title span {
  font-size: 0.9rem;
  font-weight: 600;
}
.page-title h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
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
}
.authors {
  display: block;
  margin: 0 auto;
  margin-top: 20px;
}
.authors span {
  margin-left: 10px;
  font-size: 0.7rem;
  color: white;
  background: #333;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
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
