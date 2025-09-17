import { useState, useEffect, useRef } from 'react'
import { message } from 'antd'
import { BehaviorSubject, combineLatest, Subject } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  bufferTime,
} from 'rxjs/operators'

export function useTranslation(config) {
  const DEBOUNCE_TIME = 1000
  const [sourceText, setSourceText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('简体中文')
  const [translations, setTranslations] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedTranslator, setSelectedTranslator] = useState(null)

  // 保存当前请求控制器的引用, 用于取消请求
  const abortControllerRef = useRef(null)

  // 保存输入框引用，用于维持焦点
  const inputRef = useRef(null)

  const sourceText$ = useRef(new BehaviorSubject(''))
  const targetLang$ = useRef(new BehaviorSubject('简体中文'))
  const translator$ = useRef(new BehaviorSubject(null))
  const backspace$ = useRef(new Subject())

  // 同步 BehaviorSubject
  useEffect(() => {
    sourceText$.current.next(sourceText)
  }, [sourceText])
  useEffect(() => {
    targetLang$.current.next(targetLang)
  }, [targetLang])
  useEffect(() => {
    translator$.current.next(selectedTranslator)
  }, [selectedTranslator])

  // 初始化目标语言、源语言和翻译器，使用用户上次保存的设置
  useEffect(() => {
    if (config) {
      setSourceLang(config.lastSourceLang || config.defaultSourceLang || 'auto')
      setTargetLang(
        config.lastTargetLang || config.defaultTargetLang || '简体中文'
      )
      if (
        config.lastSelectedTranslator &&
        config.enabledTranslators?.includes(config.lastSelectedTranslator)
      ) {
        setSelectedTranslator(config.lastSelectedTranslator)
      } else if (config.enabledTranslators?.length > 0) {
        setSelectedTranslator(config.enabledTranslators[0])
      }
    }
  }, [config])

  // 自动翻译功能 - 根据配置决定是否在输入时翻译
  useEffect(() => {
    const subscription = combineLatest([
      sourceText$.current.pipe(distinctUntilChanged()),
      targetLang$.current.pipe(distinctUntilChanged()),
      translator$.current.pipe(distinctUntilChanged()),
    ])
      .pipe(
        debounceTime(DEBOUNCE_TIME),
        filter(([text]) => !!text.trim())
      )
      .subscribe(([text, lang, translator]) => {
        if (config?.translateOnTyping) {
          performTranslation(text, lang, translator)
        }
      })
    return () => subscription.unsubscribe()
  }, [config?.translateOnTyping])

  // 快速三击删除键清空输入文本
  useEffect(() => {
    if (!config?.tripleBackspaceClear) return
    const subscription = backspace$.current
      .pipe(
        bufferTime(500),
        filter(arr => arr.length >= 3)
      )
      .subscribe(() => {
        clearInput()
      })
    return () => subscription.unsubscribe()
  }, [config?.tripleBackspaceClear])

  // 更新配置的辅助函数
  const updateUserPreference = (key, value) => {
    if (window.services && config) {
      const newConfig = { ...config, [key]: value }
      window.services.updateConfig(newConfig)
    }
  }

  // 翻译器选择处理函数
  const handleTranslatorChange = translator => {
    if (translator === selectedTranslator) return
    cancelTranslation()
    setSelectedTranslator(translator)
    translator$.current.next(translator)
    updateUserPreference('lastSelectedTranslator', translator)
  }

  // 设置输入框引用
  const setInputRefHandler = ref => {
    inputRef.current = ref
  }

  // 确保输入框保持焦点
  const ensureInputFocus = () => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
      }, 10)
    }
  }

  // 取消当前翻译请求
  const cancelTranslation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }

  // 语言检测映射 - 将检测到的语言映射到目标语言
  const getAutoTargetLanguage = (detectedLang) => {
    // 如果检测到中文相关语言，目标语言设为英语
    const chineseLanguages = ['zh', 'zh-cn', 'zh-tw', 'chinese', '简体中文', '繁体中文', '中文']
    if (chineseLanguages.some(lang => 
      detectedLang && detectedLang.toLowerCase().includes(lang.toLowerCase())
    )) {
      return '英语'
    }
    
    // 如果检测到非中文语言，目标语言设为简体中文
    return '简体中文'
  }

  // 执行翻译，支持参数
  const performTranslation = async (
    text = sourceText,
    lang = targetLang,
    translator = selectedTranslator
  ) => {
    if (!text || !config || !config.enabledTranslators?.length) {
      setTranslations({})
      setLoading(false)
      return
    }
    const currentTranslator = translator || config.enabledTranslators?.[0]
    if (!currentTranslator) {
      return
    }
    cancelTranslation()
    abortControllerRef.current = new AbortController()
    setLoading(true)
    try {
      const newTranslations = {}
      try {
        const result = await window.services.translateText(
          text,
          sourceLang,
          lang,
          currentTranslator,
          abortControllerRef.current.signal
        )
        if (abortControllerRef.current === null) return
        newTranslations[currentTranslator] = result
        
        // 自动切换目标语言逻辑
        if (result.detectedLanguage && sourceLang === 'auto') {
          const newTargetLang = getAutoTargetLanguage(result.detectedLanguage)
          if (newTargetLang !== lang) {
            // 更新目标语言
            setTargetLang(newTargetLang)
            targetLang$.current.next(newTargetLang)
            updateUserPreference('lastTargetLang', newTargetLang)
            
            // 如果目标语言改变了，重新翻译
            setTimeout(() => {
              performTranslation(text, newTargetLang, currentTranslator)
            }, 100)
            return
          }
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          return
        }
        newTranslations[currentTranslator] = {
          error: error.message,
          originalText: text,
        }
      }
      setTranslations(newTranslations)
    } catch (error) {
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        return
      }
    } finally {
      if (abortControllerRef.current !== null) {
        setLoading(false)
        abortControllerRef.current = null
        ensureInputFocus()
      }
    }
  }

  // 检测文本语言并自动切换目标语言
  const detectAndSwitchTargetLanguage = (text) => {
    if (!text.trim() || sourceLang !== 'auto') return
    
    // 简单的语言检测 - 检查是否包含中文字符
    const chineseRegex = /[\u4e00-\u9fff]/
    const isChinese = chineseRegex.test(text)
    
    const newTargetLang = isChinese ? '英语' : '简体中文'
    
    if (newTargetLang !== targetLang) {
      setTargetLang(newTargetLang)
      targetLang$.current.next(newTargetLang)
      updateUserPreference('lastTargetLang', newTargetLang)
    }
  }

  // 更新sourceText
  const handleSourceTextChange = text => {
    setSourceText(text)
    sourceText$.current.next(text)
    
    // 当文本改变时，尝试自动切换目标语言
    detectAndSwitchTargetLanguage(text)
  }

  // 源语言改变处理函数
  const handleSourceLangChange = lang => {
    setSourceLang(lang)
    updateUserPreference('lastSourceLang', lang)
  }

  // 目标语言改变处理函数
  const handleTargetLangChange = lang => {
    setTargetLang(lang)
    targetLang$.current.next(lang)
    updateUserPreference('lastTargetLang', lang)
  }

  // 当组件卸载时取消请求
  useEffect(() => {
    return () => {
      cancelTranslation()
    }
  }, [])

  // 手动触发翻译
  const translate = () => {
    if (sourceText) {
      performTranslation(sourceText, targetLang, selectedTranslator)
    }
  }

  // 清空输入
  const clearInput = () => {
    cancelTranslation()
    setSourceText('')
    setTranslations({})
    ensureInputFocus()
  }

  // 处理键盘事件
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // 触发翻译
      if (sourceText.trim()) {
        translate()
      }
    }
    
    // 处理三击退格清空功能
    if (config?.tripleBackspaceClear && e.key === 'Backspace') {
      backspace$.current.next(Date.now())
    }
  }

  // 朗读文本
  const speakText = (text, lang) => {
    if (!text) return
    window.services.speakText(text, lang)
  }

  // 复制到剪贴板
  const copyToClipboard = (text, hideWindow = false) => {
    if (!text) return false
    try {
      utools.copyText(text)
      message.success('复制成功', 0.7, () => {
        if (hideWindow) {
          utools.hideMainWindow()
        }
      })
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
    translate,
    performTranslation,
    clearInput,
    handleKeyDown,
    speakText,
    copyToClipboard,
    inputRef,
    setInputRef: setInputRefHandler,
    ensureInputFocus,
    cancelTranslation,
  }
}
