// 默认配置
const DEFAULT_CONFIG = {
  // 翻译相关设置
  enabledTranslators: ['glm', 'deepseek', 'deepl'],
  defaultSourceLang: 'auto', // 默认源语言
  defaultTargetLang: '简体中文', // 默认目标语言
  translatorConfigs: {}, // 各翻译服务API配置

  // 用户上次使用的设置，用于持久化
  lastSourceLang: 'auto', // 用户上次使用的源语言
  lastTargetLang: '简体中文', // 用户上次使用的目标语言
  lastSelectedTranslator: 'glm', // 用户上次使用的翻译器

  // 界面设置
  fontSize: 16, // 字体大小
  translateOnTyping: true, // 是否在输入时翻译
  removeLineBreaks: false, // 是否去除换行

  tripleBackspaceClear: true, // 三击退格键清空
}

module.exports = {
  DEFAULT_CONFIG,
}
