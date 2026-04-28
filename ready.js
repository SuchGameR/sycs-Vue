// ready.js
import chalk from "chalk"; // もし入ってなければ npm install chalk

console.log(`
${chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}
   ${chalk.magenta.bold("🚀 SYCS Development Environment Ready!")}
${chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}

  ${chalk.blue("🌐 Frontend:")}  ${chalk.underline("http://localhost:5173")}
  ${chalk.green("🔌 Backend :")}  ${chalk.underline("http://localhost:3000")}
  ${chalk.yellow("💬 Mode    :")}  Community & Direct Messages

${chalk.gray("[SYCS] It's working fine now!")}
`);
