const { replacePrompt } = require('../config')

module.exports = {
  name: 'OpenAI',
  icon: '🤖',
  requiredFields: ['apiKey', 'model', 'baseUrl'],
  baseUrl: 'https://api.openai.com/v1/chat/completions',
  prepareRequest: (text, from, to, config) => {
    // 构建提示词
    const prompt = replacePrompt({
      text,
      from,
      to,
    })

    // 使用 config 中的 baseUrl，如果没有提供则使用默认的
    const baseUrl =
      config.baseUrl || 'https://api.openai.com/v1/chat/completions'

    return {
      method: 'post',
      url: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      data: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    }
  },
  parseResponse: data => {
    const { choices } = data
    if (choices && choices.length > 0) {
      const { message } = choices[0] || {}
      if (message.content) {
        return {
          translatedText: message.content.trim(),
          raw: data,
        }
      }
    }
    throw new Error('OpenAI翻译解析响应出错')
  },
}
