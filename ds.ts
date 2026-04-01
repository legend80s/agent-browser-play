import { $, sleep } from "bun"
import { execSync } from "node:child_process"
// 1
// ❯ agent-browser --profile ~/.deepseek-profile open https://chat.deepseek.com/
// 出现  ✓ DeepSeek - 探索未至之境
// https://chat.deepseek.com/
// 2. bun ds.ts

// # open https://chat.deepseek.com/ ask and click copy to clipboard, then run this script to paste the content into a file named "ds.txt"

const { textboxRef, sendBtnRef } = await getRefs()

console.log("textboxRef:", { textboxRef, sendBtnRef })

// # fill
console.time("fill")
const command = `agent-browser fill @${textboxRef} "简单介绍嘉兴粽子"`

execSync(command)

// 使用转义后的字符串
// await $`agent-browser fill @${textboxRef} ${escaped}`;

// await $(['agent-browser', 'fill', `@${textboxRef}`, '简单介绍 AI'])
// await $`agent-browser fill @${textboxRef} '简单介绍 AI'`

await sleep(100)
// # send
await $`agent-browser click @${sendBtnRef}`
console.timeEnd("fill") // [919.25ms] fill

console.time("networkidle")
// await sleep(3000);
// # wait for the response to be generated
const fn = `document.querySelector('path[d="M8.3125 0.981587C8.66767 1.0545 8.97902 1.20558 9.2627 1.43374C9.48724 1.61438 9.73029 1.85933 9.97949 2.10854L14.707 6.83608L13.293 8.25014L9 3.95717V15.0431H7V3.95717L2.70703 8.25014L1.29297 6.83608L6.02051 2.10854C6.26971 1.85933 6.51277 1.61438 6.7373 1.43374C6.97662 1.24126 7.28445 1.04542 7.6875 0.981587C7.8973 0.94841 8.1031 0.956564 8.3125 0.981587Z"]').closest('[role=button]').ariaDisabled === 'true'
`
await $`agent-browser wait --fn "${fn}"`
// await $`agent-browser wait --load networkidle`;
// [1.69s] networkidle
// const
console.timeEnd("networkidle")

console.time("clipboard")
await sleep(500)
const { copyBtnRef } = await getRefs()
console.log(`$ agent-browser click @${copyBtnRef}`)
await $`agent-browser click @${copyBtnRef}`
await sleep(500)

// await $`agent-browser clipboard read`;
await $`agent-browser clipboard read > ds.md`
// [861.97ms] clipboard
console.timeEnd("clipboard")

function extractRef(item?: string): string {
  // "  - button [ref=e29]".match(/\[ref=([^\]]+)\]/)?.[1] // e29
  // or
  // "  - button [disabled, ref=e37]"

  const ref = item?.match(/\bref=([^\]]+)\]/)?.[1]

  if (!ref) {
    throw new Error(`ref not match in \`${item}\`]`)
  }

  return ref
}

type IRefs = {
  textboxRef: string
  sendBtnRef: string
  copyBtnRef: string
}

async function getRefs(): Promise<IRefs> {
  const output = (await $`agent-browser snapshot -i`).text()

  // console.log('output:', output);

  const list = output.split("\n").map((item) => item.trim())
  // console.log('list:', list);
  const textboxIndex = list.findIndex((item) => item.startsWith("- textbox "))

  const btns = list.slice(textboxIndex - 5, textboxIndex + 5)

  // console.log('btns:', btns.length, JSON.stringify(btns, null, 2));

  const textboxRef = extractRef(btns.at(5))
  const sendBtnRef = extractRef(btns.at(-1))
  const copyBtnRef = extractRef(btns.at(0))
  console.log({
    textboxRef,
    sendBtnRef,
    copyBtnRef,
  })

  return {
    textboxRef,
    sendBtnRef,
    copyBtnRef,
  }
}
