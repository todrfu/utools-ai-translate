import { useState, useEffect, useRef } from 'react'
import { Subject } from 'rxjs'
import { message } from 'antd'
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators'

export function useTranslation(config) {
  const DEBOUNCE_TIME = 1000
  const [sourceText, setSourceText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh')
  const [translations, setTranslations] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedTranslator, setSelectedTranslator] = useState(null)
  const [detectedLanguage, setDetectedLanguage] = useState(null)
  
  // 保存输入框引用，用于维持焦点
  const inputRef = useRef(null)
  
  // 保存当前目标语言的ref，用于在异步调用中确保使用最新值
  const targetLangRef = useRef('zh')
  
  // 当targetLang变化时更新ref值
  useEffect(() => {
    targetLangRef.current = targetLang
  }, [targetLang])
  
  // 记录退格键次数用于三击清空功能
  const backspaceCount = useRef(0)
  const backspaceTimer = useRef(null)
  
  // 使用RxJS创建输入流
  const inputSubject = useRef(null)
  
  // 初始化RxJS Subject
  useEffect(() => {
    const subject = new Subject()
    
    const subscription = subject.pipe(
      filter(text => !!(text.trim())),
      debounceTime(DEBOUNCE_TIME),
      distinctUntilChanged(),
      tap(text => {
        if (config?.translateOnTyping) {
          performTranslation(text)
        }
      })
    ).subscribe()
    
    inputSubject.current = subject
    
    return () => {
      subscription.unsubscribe()
    }
  }, [config?.translateOnTyping, selectedTranslator])
  
  // 初始化目标语言、源语言和翻译器，使用用户上次保存的设置
  useEffect(() => {
    if (config) {
      // 使用配置中保存的值或默认值
      setSourceLang(config.lastSourceLang || config.defaultSourceLang || 'auto')
      setTargetLang(config.lastTargetLang || config.defaultTargetLang || 'zh')
      
      // 使用上次选择的翻译器或默认翻译器
      if (config.lastSelectedTranslator && 
          config.enabledTranslators && 
          config.enabledTranslators.includes(config.lastSelectedTranslator)) {
        setSelectedTranslator(config.lastSelectedTranslator)
      } else if (config.enabledTranslators && config.enabledTranslators.length > 0) {
        setSelectedTranslator(config.enabledTranslators[0])
      }
    }
  }, [config])

  // 更新配置的辅助函数
  const updateUserPreference = (key, value) => {
    if (window.services && config) {
      const newConfig = { ...config, [key]: value }
      window.services.updateConfig(newConfig)
    }
  }

  // 源语言改变处理函数
  const handleSourceLangChange = (lang) => {
    setSourceLang(lang)
    // 保存用户选择到配置
    updateUserPreference('lastSourceLang', lang)
  }

  // 目标语言改变处理函数
  const handleTargetLangChange = (lang) => {
    setTargetLang(lang)
    // 保存用户选择到配置
    updateUserPreference('lastTargetLang', lang)
  }
  
  // 翻译器选择处理函数
  const handleTranslatorChange = (translator) => {
    setSelectedTranslator(translator)
    // 保存用户选择到配置
    updateUserPreference('lastSelectedTranslator', translator)
  }

  // 设置输入框引用
  const setInputRefHandler = (ref) => {
    inputRef.current = ref;
  }

  // 确保输入框保持焦点
  const ensureInputFocus = () => {
    if (inputRef.current) {
      // 使用setTimeout确保在DOM更新后再设置焦点
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
  }

  // 执行翻译
  const performTranslation = async (text) => {
    if (!text || !config || !config.enabledTranslators || config.enabledTranslators.length === 0) {
      setTranslations({})
      setLoading(false)
      return
    }

    // 如果没有选择翻译器，选择第一个可用的
    const currentTranslator = selectedTranslator || (config.enabledTranslators && config.enabledTranslators[0]);
    
    if (!currentTranslator) {
      return;
    }
    
    setLoading(true)
    // 处理可能的换行去除
    const processedText = config.removeLineBreaks ? text.replace(/\n/g, ' ') : text
    
    try {
      // 检测语言
      const detectedLang = window.services.detectLanguage(processedText)
      setDetectedLanguage(detectedLang)
      
      // 使用ref中保存的最新targetLang值
      const currentTargetLang = targetLangRef.current
      
      // 修改逻辑：只翻译当前选择的翻译器，而不是所有启用的翻译器
      const newTranslations = {}
      
      try {
        const result = await window.services.translateText(
          processedText, 
          sourceLang === 'auto' ? detectedLang : sourceLang, 
          currentTargetLang, 
          currentTranslator
        )
        newTranslations[currentTranslator] = result
      } catch (error) {
        newTranslations[currentTranslator] = { error: error.message, originalText: processedText }
      }
      
      setTranslations(newTranslations)
    } catch (error) {
    } finally {
      setLoading(false)
      // 确保输入框保持焦点
      ensureInputFocus()
    }
  }

  // 更新sourceText并触发RxJS流
  const handleSourceTextChange = (text) => {
    setSourceText(text)
    
    if (config?.translateOnTyping && inputSubject.current) {
      inputSubject.current.next(text)
    }
  }

  // 当源语言或目标语言变化时重新翻译
  useEffect(() => {
    if (sourceText && config?.translateOnTyping) {
      // 语言变化时立即翻译
      performTranslation(sourceText)
    }
  }, [sourceLang, targetLang, selectedTranslator, config?.enabledTranslators])

  // 手动触发翻译
  const translate = () => {
    if (sourceText) {
      performTranslation(sourceText)
    }
  }

  // 清空输入
  const clearInput = () => {
    setSourceText('')
    setTranslations({})
    backspaceCount.current = 0
    // 清空后确保输入框保持焦点
    ensureInputFocus()
  }

  // 处理三击退格清空功能
  const handleKeyDown = (e) => {
    if (!config?.tripleBackspaceClear) return
    
    if (e.key === 'Backspace') {
      if (backspaceTimer.current) {
        clearTimeout(backspaceTimer.current)
      }
      
      backspaceCount.current += 1
      
      if (backspaceCount.current >= 3) {
        clearInput()
        e.preventDefault()
        return
      }
      
      backspaceTimer.current = setTimeout(() => {
        backspaceCount.current = 0
      }, 500)
    } else {
      backspaceCount.current = 0
    }
  }

  // 朗读文本
  const speakText = (text, lang) => {
    if (!text) return
    window.services.speakText(text, lang)
  }

  // 复制到剪贴板
  const copyToClipboard = (text) => {
    if (!text) return false
    
    try {
      const copyBehavior = config?.copyBehavior || 'copy'
      
      // 复制文本
      utools.copyText(text)
      
      // 根据不同行为处理
      if (copyBehavior === 'copyAndInsert') {
        // 复制并模拟输入
        utools.hideMainWindow()
        setTimeout(() => {
          utools.simulateKeyboardTap('v', 'ctrl')
        }, 100)
      } else if (copyBehavior === 'copyAndHide') {
        // 复制后隐藏窗口
        utools.hideMainWindow()
      }
      message.success('复制成功')
      return true
    } catch (error) {
      return false
    }
  }

  return {
    sourceText,
    setSourceText: handleSourceTextChange,
    sourceLang,
    setSourceLang: handleSourceLangChange,
    targetLang,
    setTargetLang: handleTargetLangChange,
    translations,
    loading,
    selectedTranslator,
    setSelectedTranslator: handleTranslatorChange,
    detectedLanguage,
    translate,
    performTranslation,
    clearInput,
    handleKeyDown,
    speakText,
    copyToClipboard,
    inputRef,
    setInputRef: setInputRefHandler,
    ensureInputFocus
  }
} 