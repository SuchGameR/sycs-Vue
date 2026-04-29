import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frames = ["⸫", "⸪"];
let index = 0;

// 1. ロゴと初期メッセージを一回だけ出す
try {
  const logoPath = path.join(__dirname, "logo.txt");
  const logoArt = fs.readFileSync(logoPath, "utf-8");
  process.stdout.write("\x1Bc"); // 画面をリセット
  console.log(chalk.hex("#BFFF00").bold(logoArt));
} catch (e) {}

console.log(
  chalk.magenta.bold("𝝙 Credit by "),
  chalk.white("@SuchGameR "),
  chalk.gray("and "),
  chalk.white("@yyyg1114 "),
  chalk.gray("(SYCS PROJECT) \n"),
);
console.log(chalk.green("╭ "), chalk.white("Setup Logs"));
console.log(chalk.green("│"));
console.log(
  chalk.hex("#BFFF00")("•"),
  chalk.gray("- "),
  chalk.hex("#BFFF00")("Launch Frontend"),
);
console.log(
  chalk.green("│ "),
  chalk.white("Frontend: "),
  chalk.green("http://localhost:5173"),
);
console.log(chalk.green("│"));
console.log(
  chalk.hex("#BFFF00")("•"),
  chalk.gray("- "),
  chalk.hex("#BFFF00")("Launch Backend"),
);
console.log(
  chalk.green("│ "),
  chalk.white("Backend: "),
  chalk.green("http://localhost:3000"),
);
console.log(chalk.green("│"));
console.log(
  chalk.hex("#BFFF00")("•"),
  chalk.gray("- "),
  chalk.hex("#BFFF00")("Successful!"),
);
console.log(chalk.green("│"));
// console.log(chalk.green("╰ "), chalk.white("\n"));
// 2. 1行だけで「くるくる」させる（readlineを使わない）
setInterval(() => {
  const frame = frames[index];
  // \r (キャリッジリターン) だけで行頭に戻る。これなら安全！
  process.stdout.write(
    `\r${chalk.white(frame)}  ${chalk.gray("WORKING NOW...")}    [CTRL + C]`,
  );
  index = (index + 1) % frames.length;
}, 100);
