import React, { useState, useEffect } from 'react'
import Text from 'antd/lib/typography/Text'
import TranslateInput from '@/components/translate/TranslateInput'
import TranslateResult from '@/components/translate/TranslateResult'
import LanguageSelector from '@/components/translate/LanguageSelector'
import TranslatorTabs from '@/components/translate/TranslatorTabs'
import SettingsModal from '@/components/translate/SettingsModal'
import TranslateFooter from '@/components/translate/TranslateFooter'
import { useTranslation } from '@/hooks/useTranslation'
import { useConfig } from '@/hooks/useConfig'
import './translate.css'

function TranslateFeature() {
  const [configVisible, setConfigVisible] = useState(false)
  const {
    config,
    updateConfig,
    configTranslatorAPI,
    exportConfig,
    importConfig,
  } = useConfig()

  const {
    sourceText,
    setSourceText,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    translations,
    loading,
    selectedTranslator,
    setSelectedTranslator,
    translate,
    clearInput,
    handleKeyDown,
    speakText,
    copyToClipboard,
    inputRef,
    cancelTranslation,
  } = useTranslation(config)

  // 获取翻译服务配置
  const TRANSLATORS = window.services ? window.services.getTranslators() : {}

  // 处理翻译指令
  const handleTranslate = action => {
    const CMDS = ['翻译', 'fy', 'ai']
    if (!action.payload) return
    const t = action.payload.trim()
    if (!CMDS.includes(t)) {
      setSourceText(t)
    }
  }

  // 处理uTools插件进入事件
  const handlePluginEnter = actionCode => {
    return {
      translate: handleTranslate,
    }[actionCode]
  }

  // 处理uTools插件退出事件
  const handlePluginOut = () => {
    setSourceText('')
  }

  useEffect(() => {
    if (window.services) {
      window.utools.onPluginEnter(action => {
        handlePluginEnter(action.code)(action)
      })
      window.utools.onPluginOut(handlePluginOut)
    }
  }, [config])

  // 显示设置对话框
  const showSettings = () => {
    setConfigVisible(true)
  }

  return (
    <div className='translate'>
      {/* 翻译输入区域 */}
      <div className='translate__input-container'>
        <TranslateInput
          value={sourceText}
          onChange={setSourceText}
          onKeyDown={handleKeyDown}
          onClear={clearInput}
          onSpeak={text => speakText(text, sourceLang)}
          loading={loading}
          onTranslate={translate}
          onCancelTranslation={cancelTranslation}
          inputRef={inputRef}
        />
        <Text type='secondary' className='translate__char-counter'>
          {sourceText ? sourceText.length : 0}/4000
        </Text>
      </div>

      {/* 翻译服务选择tabs */}
      <div className='translate__tabs-container'>
        <TranslatorTabs
          translators={TRANSLATORS}
          enabledTranslators={config?.enabledTranslators || []}
          selectedTranslator={selectedTranslator}
          onTranslatorChange={setSelectedTranslator}
          showSettings={showSettings}
        />

        {/* 语言选择器 */}
        <LanguageSelector
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSourceLangChange={setSourceLang}
          onTargetLangChange={setTargetLang}
        />
      </div>

      {/* 翻译结果区域 */}
      <div className='translate__result-container'>
        <h3 className='translate__result-title'>翻译结果</h3>
        <TranslateResult
          result={selectedTranslator ? translations[selectedTranslator] : null}
          translatorKey={selectedTranslator}
          translatorInfo={TRANSLATORS[selectedTranslator]}
          loading={loading}
          language={targetLang}
          onCopy={copyToClipboard}
          onSpeak={text => speakText(text, targetLang)}
          onCancelTranslation={cancelTranslation}
          fontSize={config?.fontSize || 16}
        />
      </div>

      {/* 设置按钮 */}
      <TranslateFooter
        onCopy={copyToClipboard}
        translatedText={
          selectedTranslator
            ? translations[selectedTranslator]?.translatedText
            : null
        }
        showSettings={showSettings}
      />

      {/* 设置模态框 */}
      {configVisible && (
        <SettingsModal
          visible={configVisible}
          onCancel={() => setConfigVisible(false)}
          config={config}
          onConfigChange={updateConfig}
          onConfigTranslatorAPI={configTranslatorAPI}
          onImportConfig={importConfig}
          onExportConfig={exportConfig}
          translators={TRANSLATORS}
        />
      )}
    </div>
  )
}

export default TranslateFeature
