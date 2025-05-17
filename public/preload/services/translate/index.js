const axios = require('axios')
const TRANSLATORS = require('./translators')
const coreServices = require('../core')

// 翻译服务
const translateServices = {
  // 获取翻译服务配置
  getTranslators() {
    return TRANSLATORS
  },

  // 配置翻译服务API
  configTranslatorAPI(translatorKey, apiConfig) {
    const config = coreServices.getConfig()
    config.translatorConfigs = {
      ...config.translatorConfigs,
      [translatorKey]: apiConfig
    }
    return coreServices.updateConfig(config)
  },
  
  /**
   * 根据用户配置处理输入文本
   * 
   * 这是一个通用的文本处理方法，根据用户的配置设置来处理输入文本。
   * 目前支持的处理选项：
   * - removeLineBreaks: 移除所有换行符，替换为空格
   * 
   * 可扩展的处理选项：
   * - 移除HTML标签
   * - 处理特殊字符
   * - 文本截断/限制长度
   * - 保留代码块格式
   * - 规范化空白字符
   * - 移除重复字符/段落
   * 
   * @param {string} text - 需要处理的原始文本
   * @param {Object} [overrideConfig] - 可选的配置对象，用于覆盖全局配置
   * @returns {string} - 根据用户配置处理后的文本
   */
  processTextByConfig(text, overrideConfig) {
    if (!text) return text
    
    // 使用传入的配置或获取全局配置
    const config = overrideConfig || coreServices.getConfig()
    
    let processedText = text
    
    if (config.removeLineBreaks) {
      processedText = processedText.replace(/\n/g, ' ')
      processedText = processedText.replace(/\s+/g, ' ')
    } else {
      // 将\r\n统一为\n
      processedText = processedText.replace(/\r\n/g, '\n')
    }

    // TODO：添加其他文本处理配置，如移除HTML标签、处理URL等
    
    return processedText
  },

  // 翻译文本
  async translateText(text, from, to, translatorKey, signal) {
    if (!text || !translatorKey) return null
    
    const config = coreServices.getConfig()
    const translator = TRANSLATORS[translatorKey]
    
    if (!translator) {
      throw new Error(`不支持的翻译服务: ${translatorKey}`)
    }
    
    const apiConfig = config.translatorConfigs && config.translatorConfigs[translatorKey]
    
    if (!apiConfig || !this.isApiConfigValid(translatorKey, apiConfig)) {
      throw new Error(`翻译服务 ${translator.name} 未正确配置API密钥`)
    }
    
    try {
      // 根据用户配置处理文本
      const processedText = this.processTextByConfig(text)
      
      let requestConfig = {}
      
      // 根据不同的翻译服务构建请求
      if (translator.prepareRequest) {
        // 使用预设的请求构建函数
        const prepared = translator.prepareRequest(processedText, from, to, apiConfig)
        requestConfig = {
          method: prepared.method || 'post',
          url: prepared.url || translator.baseUrl,
          headers: prepared.headers || { 'Content-Type': 'application/json' },
          data: prepared.data,
          timeout: 30000,
          signal
        }
      } else {
        // 默认请求配置
        requestConfig = {
          method: 'post',
          url: translator.baseUrl,
          headers: { 'Content-Type': 'application/json' },
          data: {
            text: processedText,
            source: from,
            target: to
          },
          timeout: 30000,
          signal
        }
      }
      
      // 重试
      const maxRetries = 2
      let retries = 0
      let response

      while (retries <= maxRetries) {
        try {
          response = await axios(requestConfig)
          break
        } catch (error) {
          // 如果请求被取消，直接抛出错误，不再重试
          if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || 
              (error.message && error.message.includes('aborted'))) {
            throw error
          }
          
          retries++
          if (retries > maxRetries) {
            throw error
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
      
      // 如果是请求被取消导致的错误，传递该错误
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || 
          (error.message && error.message.includes('aborted'))) {
        throw error
      }
      
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
  }
}

module.exports = translateServices 