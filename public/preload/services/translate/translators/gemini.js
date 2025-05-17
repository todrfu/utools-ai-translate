const { replacePrompt } = require('../config')

module.exports = {
  name: 'Gemini',
  icon: '🌟',
  requiredFields: ['apiKey', 'model'],
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  prepareRequest: (text, from, to, config) => {
    // 构建提示词
    const prompt = replacePrompt({
      text,
      from,
      to,
    })

    // 默认模型为 gemini-2.0-flash
    const model = config.model || 'gemini-2.0-flash'
    const url = `${module.exports.baseUrl}/${model}:generateContent?key=${config.apiKey}`
    
    return {
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 3072,
        },
      }),
    }
  },
  parseResponse: data => {
    try {
      const translatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return {
        translatedText: translatedText.trim(),
        raw: data,
      }
    } catch (error) {
      throw new Error('Gemini翻译解析响应出错: ' + error.message)
    }
  },
}
