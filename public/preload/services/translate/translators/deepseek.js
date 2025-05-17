const { replacePrompt } = require('../config')

module.exports = {
  name: 'DeepSeek',
  icon: '🧠',
  requiredFields: ['apiKey'],
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  prepareRequest: (text, from, to, config) => {
    // 替换提示词模板中的变量
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
      data: {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        temperature: 0.3, // 低温度以确保翻译准确性
      },
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
      throw new Error('DeepSeek翻译解析响应出错')
    }
  },
}
