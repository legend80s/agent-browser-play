#!/bin/bash

set -e  # 遇到任何失败立即退出

# open https://chat.deepseek.com/ ask and click copy to clipboard, then run this script to paste the content into a file named "ds.txt"

# fill
agent-browser fill @e213 '介绍 agent-browser'

# send
agent-browser click @e212


# wait for the response to be generated
agent-browser wait --load networkidle # Wait for load state

agent-browser click @e19

agent-browser clipboard read > ds.md