// 获取输出文本（不显示在终端）
const output = await Bun.$`ls -la`.text()
console.log("文件列表:", output)

// 静默执行，不输出到终端
const result = await Bun.$`echo "secret"`.text()
console.log(result) // "secret"
