import { readdir, lstat, realpath, unlink, rm, cp } from 'node:fs/promises'
import { join, relative } from 'node:path'

// Nitro/nf3 は .output/server/node_modules 配下に依存をシンボリックリンク
// (Windows ではジャンクション) で展開する。リンク先が絶対パスになるため、
// Docker のバインドマウント経由だとコンテナ内でリンクが壊れ ENOENT になる。
// リンクを実ファイルのコピーに置き換えて .output を自己完結させる。

const root = process.argv[2] || '.output/server/node_modules'

let replaced = 0

async function removeLink(path) {
  try {
    await unlink(path)
  } catch {
    await rm(path, { recursive: false, force: true })
  }
}

async function dereference(dir, depth = 0) {
  if (depth > 50) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    let st
    try {
      st = await lstat(full)
    } catch {
      continue
    }
    if (st.isSymbolicLink()) {
      let target
      try {
        target = await realpath(full)
      } catch {
        continue
      }
      await removeLink(full)
      await cp(target, full, { recursive: true, dereference: true })
      replaced += 1
      console.log(`[dereference-output] ${relative(process.cwd(), full)}`)
      await dereference(full, depth + 1)
    } else if (st.isDirectory()) {
      await dereference(full, depth + 1)
    }
  }
}

await dereference(root)
console.log(
  replaced === 0
    ? '[dereference-output] no symlinks found'
    : `[dereference-output] replaced ${replaced} symlink(s) with real files`
)
