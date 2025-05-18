const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { DEFAULT_CONFIG } = require('./config')

// 配置文件路径
const configPath = path.join(os.homedir(), '.utools-plugin-ai-translate.json')

// 核心服务
const coreServices = {
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
  
  // 获取剪贴板文本内容
  getClipboardText() {
    try {
      return window.utools.copyText()
    } catch (error) {
      console.error('获取剪贴板内容失败：', error)
      return ''
    }
  }
}

module.exports = coreServices 