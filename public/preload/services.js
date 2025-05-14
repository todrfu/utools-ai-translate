const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const axios = require('axios')
const { exec } = require('node:child_process')
const { DEFAULT_CONFIG, mapLanguage } = require('./config')
const TRANSLATORS = require('./translators')

// 配置文件路径
const configPath = path.join(os.homedir(), '.ai-translate.json')

// 创建services对象
const services = {
  // 获取翻译服务配置
  getTranslators() {
    return TRANSLATORS
  },
  // 获取当前操作系统平台
  getPlatform() {
    return os.platform()
  },
  // 检查是否首次使用
  isFirstUse() {
    return !fs.existsSync(configPath)
  },
  // 设置已使用标记
  setUsed() {
    if (!fs.existsSync(configPath)) {
      this.updateConfig(DEFAULT_CONFIG)
    }
  },
  // 获取配置
  getConfig() {
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        return { ...DEFAULT_CONFIG, ...config }
      }
    } catch (error) {
      console.error('读取配置文件失败：', error)
    }
    return DEFAULT_CONFIG
  },
  // 保存配置
  updateConfig(config) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      return true
    } catch (error) {
      console.error('保存配置文件失败：', error)
      return false
    }
  },
  // 导出配置到指定路径
  exportConfig(filePath) {
    try {
      const config = this.getConfig()
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
      return true
    } catch (error) {
      console.error('导出配置失败：', error)
      return false
    }
  },
  // 从指定路径导入配置
  importConfig(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const config = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        this.updateConfig(config)
        return true
      }
      return false
    } catch (error) {
      console.error('导入配置失败：', error)
      return false
    }
  },
  // 配置翻译服务API
  configTranslatorAPI(translatorKey, apiConfig) {
    const config = this.getConfig()
    config.translatorConfigs = {
      ...config.translatorConfigs,
      [translatorKey]: apiConfig
    }
    return this.updateConfig(config)
  },
  // 翻译文本
  async translateText(text, from, to, translatorKey) {
    if (!text || !translatorKey) return null
    
    const config = this.getConfig()
    const translator = TRANSLATORS[translatorKey]
    
    if (!translator) {
      throw new Error(`不支持的翻译服务: ${translatorKey}`)
    }
    
    const apiConfig = config.translatorConfigs && config.translatorConfigs[translatorKey]
    
    // 谷歌翻译不需要API配置
    if (translatorKey !== 'google' && (!apiConfig || !this.isApiConfigValid(translatorKey, apiConfig))) {
      throw new Error(`翻译服务 ${translator.name} 未正确配置API密钥`)
    }
    
    try {
      let requestConfig = {}
      
      // 根据不同的翻译服务构建请求
      if (translatorKey === 'google') {
        // 谷歌翻译特殊处理（不需要API Key）
        requestConfig = {
          method: 'get',
          url: translator.baseUrl,
          params: {
            ...translator.requestParams,
            sl: from === 'auto' ? 'auto' : mapLanguage(from, 'google'),
            tl: mapLanguage(to, 'google'),
            q: text
          },
          timeout: 10000 // 10秒超时
        }
      } else if (translator.prepareRequest) {
        // 使用预设的请求构建函数
        const prepared = translator.prepareRequest(text, from, to, apiConfig)
        requestConfig = {
          method: prepared.method || 'post',
          url: prepared.url || translator.baseUrl,
          headers: prepared.headers || { 'Content-Type': 'application/json' },
          data: prepared.data,
          timeout: 10000 // 10秒超时
        }
      } else {
        // 默认请求配置
        requestConfig = {
          method: 'post',
          url: translator.baseUrl,
          headers: { 'Content-Type': 'application/json' },
          data: {
            text: text,
            source: mapLanguage(from, translatorKey),
            target: mapLanguage(to, translatorKey)
          },
          timeout: 10000 // 10秒超时
        }
      }
      
      // 发送请求，添加重试逻辑
      const maxRetries = 2
      let retries = 0
      let response

      while (retries <= maxRetries) {
        try {
          response = await axios(requestConfig)
          break // 请求成功，跳出循环
        } catch (error) {
          retries++
          if (retries > maxRetries) {
            throw error // 超过最大重试次数，抛出错误
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retries))
        }
      }
      
      // 解析响应
      let result
      if (translator.parseResponse) {
        result = translator.parseResponse(response.data)
      } else {
        result = {
          translatedText: response.data.translatedText || response.data.text || '',
          raw: response.data
        }
      }
      
      return {
        translatedText: result.translatedText,
        originalText: text,
        from: from,
        to: to,
        detectedLanguage: result.detectedLanguage || null,
        raw: result.raw || null
      }
    } catch (error) {
      console.error(`${translatorKey}翻译出错:`, error)
      
      // 开发环境返回模拟结果
      if (process.env.NODE_ENV === 'development') {
        return {
          translatedText: `[开发模式] ${translator.name} 翻译结果: ${text}`,
          originalText: text,
          from: from,
          to: to
        }
      }
      
      throw new Error(`${translator.name}翻译失败: ${error.message || '未知错误'}`)
    }
  },
  // 检查API配置是否有效
  isApiConfigValid(translatorKey, apiConfig) {
    const translator = TRANSLATORS[translatorKey]
    if (!translator) return false
    
    const requiredFields = translator.requiredFields || []
    return requiredFields.every(field => apiConfig[field])
  },
  // 语音朗读
  speakText(text, language) {
    if (!text) return
    
    try {
      // 使用系统自带的语音合成功能
      const platform = this.getPlatform()
      let command = ''
      
      if (platform === 'darwin') {
        // macOS 使用 say 命令
        command = `say -v ${this.getVoiceForLanguage(language)} "${text}"`
      } else if (platform === 'win32') {
        // Windows 使用 PowerShell 的语音合成
        command = `powershell -command "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${text.replace(/'/g, "''")}')"`
      } else {
        // Linux 可能使用 espeak
        command = `espeak "${text}"`
      }
      
      exec(command, (error) => {
        if (error) {
          console.error('语音朗读失败：', error)
        }
      })
    } catch (error) {
      console.error('语音朗读失败：', error)
    }
  },
  
  // 根据语言获取合适的语音
  getVoiceForLanguage(language) {
    const voices = {
      'zh': 'Ting-Ting', // 中文
      'en': 'Alex',      // 英文
      'ja': 'Kyoko',     // 日文
      'ko': 'Yuna',      // 韩文
      'ru': 'Milena',    // 俄文
      'de': 'Anna',      // 德文
      'fr': 'Thomas',    // 法文
      'es': 'Jorge',     // 西班牙文
      'pt': 'Joana',     // 葡萄牙文
      'th': 'Kanya'      // 泰文
    }
    
    return voices[language] || 'Alex' // 默认使用英文语音
  },
  
  // 识别文本语言
  detectLanguage(text) {
    // 语言代码正则匹配
    const patterns = {
      zh: /[\u4e00-\u9fff\u3400-\u4dbf]/,  // 中文字符
      ja: /[\u3040-\u309f\u30a0-\u30ff]/,  // 日文假名
      ko: /[\uac00-\ud7af\u1100-\u11ff]/,  // 韩文
      ru: /[\u0400-\u04ff]/,               // 西里尔字母(俄语)
      th: /[\u0e00-\u0e7f]/,               // 泰文
      ar: /[\u0600-\u06ff]/,               // 阿拉伯语
      de: /[\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]/,  // 德语特殊字符
      fr: /[\u00e0\u00e2\u00e7\u00e8\u00e9\u00ea\u00eb\u00ee\u00ef\u00f4\u00fb\u00fc]/,  // 法语特殊字符
      es: /[\u00e1\u00e9\u00ed\u00f1\u00f3\u00fa\u00fc]/,  // 西班牙语特殊字符
    }
    
    // 检查文本是否包含特定语言的字符
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang
      }
    }
    
    // 默认返回英文
    return 'en'
  }
}

// 将services对象挂载到window对象上
if (typeof window !== 'undefined') {
  window.services = services
}

// 导出services对象
module.exports = services
