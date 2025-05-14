const { mapLanguage } = require('../config')

module.exports = {
  name: '彩云小译',
  icon: '☁️',
  requiredFields: ['token'],
  supportedLanguages: ['zh', 'en', 'ja', 'ru'],
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
        trans_type: `${mapLanguage(from, 'caiyun')}2${mapLanguage(to, 'caiyun')}`,
        request_id: 'ai-translate',
        detect: true,
      }),
    }
  },
  parseResponse: data => {
    if (data.target) {
      return {
        translatedText: Array.isArray(data.target)
          ? data.target.join('\n')
          : data.target,
        raw: data,
      }
    } else {
      throw new Error('彩云小译翻译解析响应出错')
    }
  },
}
