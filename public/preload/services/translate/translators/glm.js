const { replacePrompt } = require('../config')

module.exports = {
  name: '智谱GLM',
  icon: '🌐',
  requiredFields: ['apiKey'],
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  prepareRequest: (text, from, to, config) => {
    const prompt = replacePrompt({
      text,
      from,
      to,
    })
    return {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      data: JSON.stringify({
        model: 'GLM-4-Flash-250414',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    }
  },
  parseResponse: data => {
    const { choices } = data
    const [choice] = choices || []
    const { content } = choice?.message || {}
    if (content) {
      return {
        translatedText: content.trim(),
        raw: data,
      }
    } else {
      throw new Error('智谱GLM翻译解析响应出错')
    }
  },
}
