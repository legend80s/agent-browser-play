import { execSync } from "node:child_process"
import { $, sleep } from "bun"

// Usage:
// bun deepseek.ts ./13.md

// 1
// ❯ agent-browser --profile ~/.deepseek-profile open https://chat.deepseek.com/
// 出现  ✓ DeepSeek - 探索未至之境
// https://chat.deepseek.com/
// 2. bun deepseek.ts

// # open https://chat.deepseek.com/ ask and click copy to clipboard, then run this script to paste the content into a file named "deepseek.txt"

// console.log("textboxRef:", { textboxRef, sendBtnRef })
// console.log("process.argv:", process.argv)

async function main() {
  const filepath = process.argv[2]

  if (!filepath) {
    process.exitCode = 1
    console.error("filepath to translate is required")
    return
  }

  const text: string = await Bun.file(filepath).text()

  console.log("filepath:", filepath)
  console.log("content length:", text.length)
  console.log("content:", text.slice(0, 40), "...", text.slice(-40))

  const openLog =
    await $`agent-browser --profile ~/.deepseek-profile open https://chat.deepseek.com/`.text()
  console.log("openLog 1:", openLog)

  if (openLog.includes(`daemon already running. Use 'agent-browser close'`)) {
    await $`agent-browser close`

    const openLog =
      await $`agent-browser --profile ~/.deepseek-profile open https://chat.deepseek.com/`.text()

    console.log("openLog 2:", openLog)
  }

  if (openLog.includes(`https://chat.deepseek.com/sign_in`)) {
    await $`agent-browser close`
    console.log("请登录")
    await $`agent-browser --profile ~/.deepseek-profile open https://chat.deepseek.com/ --headed`
    console.log("登录完成")
    process.exitCode = 0

    return
    // await $`agent-browser close`
    // await $`agent-browser --profile ~/.deepseek-profile open https://chat.deepseek.com/`
  }

  const { textboxRef, sendBtnRef } = await getRefs()

  // # fill
  console.time("fill")
  // console.log("content:", text)
  // 问题增加 "" 防止 bun 转义成 unicode 发送给 deepseek

  const escaped = text.replace(/"/g, '\\"').replace(/\n/g, "\\n")
  // const command = `agent-browser fill @${textboxRef} "请翻译：$(cat ${filepath})"`
  // console.log("command:", command)
  // await $`agent-browser fill @${textboxRef} "请翻译，注意1.输出 markdown 格式，2. 保留图片 3. 图片的 alt 无需翻译 4. 通俗易懂，多用短句：${escaped}"`

  const command = `agent-browser fill @${textboxRef} "请翻译，注意 1.输出 markdown 格式，2.保留图片 3.图片的 alt 无需翻译 4.通俗易懂，多用短句：${escaped}"`
  // return

  // const command = `agent-browser fill @${textboxRef} $'第一行\n第二行\n第三行'`
  execSync(command, { stdio: "inherit" })

  // 使用转义后的字符串
  // await $`agent-browser fill @${textboxRef} ${escaped}`;

  // await $(['agent-browser', 'fill', `@${textboxRef}`, '简单介绍 AI'])
  // await $`agent-browser fill @${textboxRef} '简单介绍 AI'`

  await sleep(100)
  // # send
  await $`agent-browser click @${sendBtnRef}`
  console.timeEnd("fill") // [919.25ms] fill

  console.time("wait for SSE API finished")
  // await sleep(3000);
  // # wait for the response to be generated
  const fn = `document.querySelector('path[d="M8.3125 0.981587C8.66767 1.0545 8.97902 1.20558 9.2627 1.43374C9.48724 1.61438 9.73029 1.85933 9.97949 2.10854L14.707 6.83608L13.293 8.25014L9 3.95717V15.0431H7V3.95717L2.70703 8.25014L1.29297 6.83608L6.02051 2.10854C6.26971 1.85933 6.51277 1.61438 6.7373 1.43374C6.97662 1.24126 7.28445 1.04542 7.6875 0.981587C7.8973 0.94841 8.1031 0.956564 8.3125 0.981587Z"]').closest('[role=button]').ariaDisabled === 'true'
`
  await $`agent-browser wait --fn "${fn}"`
  // await $`agent-browser wait --load networkidle`;
  // [1.69s] networkidle
  // const
  console.timeEnd("wait for SSE API finished")

  console.time("clipboard")
  await sleep(500)
  const { copyBtnRef } = await getRefs()
  console.log(`$ agent-browser click @${copyBtnRef}`)
  await $`agent-browser click @${copyBtnRef}`
  await sleep(500)

  // await $`agent-browser clipboard read`;
  const outputFilepath = filepath.replace(/\.md$/, '.zh.md')
  await $`agent-browser clipboard read > ${outputFilepath}`
  // [861.97ms] clipboard
  console.timeEnd("clipboard")
}

main()

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
