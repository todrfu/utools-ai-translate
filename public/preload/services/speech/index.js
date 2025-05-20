const { exec } = require('node:child_process')
const coreServices = require('../core')

// 语音服务
const speechServices = {
  // 语音朗读
  speakText(text, language) {
    if (!text) return

    try {
      // 使用系统自带的语音合成功能
      const platform = coreServices.getPlatform()
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

      exec(command, error => {
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
      zh: 'Ting-Ting', // 中文
      en: 'Alex', // 英文
      ja: 'Kyoko', // 日文
      ko: 'Yuna', // 韩文
      ru: 'Milena', // 俄文
      de: 'Anna', // 德文
      fr: 'Thomas', // 法文
      es: 'Jorge', // 西班牙文
      pt: 'Joana', // 葡萄牙文
      it: 'Alice', // 意大利文
    }

    return voices[language] || 'Alex' // 默认使用英文语音
  },
}

module.exports = speechServices
