module.exports = {
  name: 'DeepL',
  icon: '🔤',
  requiredFields: ['apiKey'],
  baseUrl: 'https://api-free.deepl.com/v2/translate',
  prepareRequest: (text, from, to, config) => {
    // 构建请求参数对象
    const params = {
      text: text,
      target_lang: to
    };
    
    // 如果源语言不是自动检测，则添加源语言参数
    if (from !== 'auto') {
      params.source_lang = from
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
