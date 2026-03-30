
import { $ } from "bun";

// # open https://chat.deepseek.com/ ask and click copy to clipboard, then run this script to paste the content into a file named "ds.txt"


const output = (await $`agent-browser snapshot -i`).text()

// console.log('output:', output);

const list =  output.split('\n')
console.log('list:', list);
const textboxIndex = list.findIndex(item => item.includes('- textbox '))

const btns = list.slice(textboxIndex - 5, textboxIndex + 5)

console.log('btns:', btns);

const textboxRef = extractRef(list.at(textboxIndex))
const sendBtnRef = extractRef(list.at(-1))
const copyBtnRef = extractRef(list.at(0))

// # fill
console.time('fill')
await $`agent-browser fill @${textboxRef} '简单介绍 AI'`

// # send
await $`agent-browser click @${sendBtnRef}`
console.timeEnd('fill')


console.time('networkidle')
// # wait for the response to be generated
await $`agent-browser wait --load networkidle # Wait for load state`
console.timeEnd('networkidle')

console.time('clipboard')
await $`agent-browser click @${copyBtnRef}`

await $`agent-browser clipboard read > ds.md`

console.timeEnd('clipboard')

function extractRef(item?: string): string {
  // "  - button [ref=e29]".match(/\[ref=([^\]]+)\]/)?.[1] // e29

  const ref = item?.match(/\[ref=([^\]]+)\]/)?.[1]

  if (!ref) {
    throw new Error(`ref not match in \`${item}\`]`)
  }

  return ref
}