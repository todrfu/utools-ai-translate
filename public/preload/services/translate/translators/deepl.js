const { mapLanguage } = require('../config');

module.exports = {
  name: 'DeepL',
  icon: '🔤',
  requiredFields: ['apiKey'],
  supportedLanguages: [
    'zh', // 中文（简体）
    'en', // 英语
    'ja', // 日语
    'ru', // 俄语
    'ko', // 韩语
    'de', // 德语
    'fr', // 法语
    'es', // 西班牙语
    'it', // 意大利语
    'nl', // 荷兰语
    'pl', // 波兰语
    'pt', // 葡萄牙语
    'zh-tw', // 中文（繁体）
  ],
  baseUrl: 'https://api-free.deepl.com/v2/translate',
  prepareRequest: (text, from, to, config) => {
    // 构建请求参数对象
    const params = {
      text: text,
      target_lang: mapLanguage(to, 'deepl')
    };
    
    // 如果源语言不是自动检测，则添加源语言参数
    if (from !== 'auto') {
      params.source_lang = mapLanguage(from, 'deepl');
    }
    
    return {
      method: 'post',
      headers: {
        'Authorization': `DeepL-Auth-Key ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      data: params,
    }
  },
  parseResponse: data => {
    if (data.translations && data.translations.length > 0) {
      const translation = data.translations[0];
      return {
        translatedText: translation.text,
        detectedLanguage: translation.detected_source_language || null,
        raw: data,
      }
    } else {
      throw new Error('DeepL翻译解析响应出错');
    }
  },
}
