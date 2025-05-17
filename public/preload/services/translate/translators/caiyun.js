module.exports = {
  name: '彩云小译',
  icon: '☁️',
  requiredFields: ['token'],
  supportedLanguages: ['zh', 'en', 'ja'],
  baseUrl: 'https://api.interpreter.caiyunai.com/v1/translator',
  prepareRequest: (text, from, to, config) => {
    return {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': `token ${config.token}`,
      },
      data: JSON.stringify({
        source: text,
        trans_type: `${from}2${to}`,
        detect: from === 'auto',
      }),
    }
  },
  parseResponse: data => {
    if (data.target) {
      return {
        translatedText: data.target,
        raw: data,
      }
    } else {
      throw new Error('彩云翻译解析响应出错')
    }
  },
} 