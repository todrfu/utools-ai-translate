const TRANSLATE_PROMPT = `
您是一位精通「源文本语言」与「目标语言」文化和语言的翻译专家。

# 源文本 
""" 
{text} 
""" 

## 翻译要求:
1. 忠实于原文，确保每个句子都得到准确且流畅的翻译
2. 保留原文格式，包括段落、列表和换行
3. 专业术语要准确翻译，保持专业性
4. 大额数字的翻译需准确无误
5. 将源文本翻译为 {targetLanguage}

## 输出要求:
- 只输出翻译结果，不要添加任何解释、注释或原文
- 不要使用markdown格式
- 不要添加"翻译："、"译文："等前缀
- 保持原文的格式和段落结构
`

// 根据目标语言获取语言名称
const TARGET_LANGUAGES_NAME_FOR_PROMPT = {
  'zh': '简体中文',
  'en': '英语',
  'ja': '日语',
  'ru': '俄语',
  'ko': '韩语',
  'de': '德语',
  'fr': '法语',
  'es': '西班牙语',
  'th': '泰语',
  'zh-tw': '繁体中文',
  'pt': '葡萄牙语'
};

// 语言代码映射
function mapLanguage(code, platform) {
  // 通用语言代码映射表
  const languageMaps = {
    caiyun: {
      'zh': 'zh',
      'en': 'en',
      'ja': 'ja',
      'auto': 'auto'
    },
    glm: {
      'zh': 'zh',
      'en': 'en',
      'ja': 'ja',
      'ru': 'ru',
      'ko': 'ko',
      'de': 'de',
      'fr': 'fr',
      'es': 'es',
      'th': 'th',
      'zh-tw': 'zh-tw',
      'pt': 'pt',
      'auto': 'auto'
    },
    deepl: {
      'zh': 'zh',
      'en': 'en',
      'auto': ''  // DeepL可省略源语言
    }
  }

  // 如果有特定平台的映射，则使用该映射；否则保持原样
  if (languageMaps[platform] && languageMaps[platform][code]) {
    return languageMaps[platform][code]
  }
  
  return code
}

// 默认配置
const DEFAULT_CONFIG = {
  // 翻译相关设置
  enabledTranslators: ['glm', 'caiyun', 'deepl'],
  defaultSourceLang: 'auto', // 默认源语言
  defaultTargetLang: 'en', // 默认目标语言
  translatorConfigs: {}, // 各翻译服务API配置
  
  // 用户上次使用的设置，用于持久化
  lastSourceLang: 'auto', // 用户上次使用的源语言
  lastTargetLang: 'en', // 用户上次使用的目标语言
  lastSelectedTranslator: 'glm', // 用户上次使用的翻译器
  
  // 界面设置
  fontSize: 16, // 字体大小
  translateOnTyping: true, // 是否在输入时翻译
  translateOnHotkey: false, // 是否使用快捷键触发翻译
  removeLineBreaks: true, // 是否去除换行
  darkMode: 'auto', // 深色模式：auto, light, dark
  
  // 快捷键行为
  copyBehavior: 'copyAndInsert', // 复制行为: copy, copyAndInsert, copyAndHide
  tripleBackspaceClear: true, // 三击退格键清空
  
  // 语音设置
  enableVoice: true, // 启用语音朗读
  voiceMode: 'quality', // 语音模式: quality, speed
  preferredVoice: 'system', // 首选语音: system, male, female
}

module.exports = {
  TRANSLATE_PROMPT,
  TARGET_LANGUAGES_NAME_FOR_PROMPT,
  DEFAULT_CONFIG,
  mapLanguage
} 