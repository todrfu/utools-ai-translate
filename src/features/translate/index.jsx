import React, { useState, useEffect } from 'react'
import Text from 'antd/lib/typography/Text'
import TranslateInput from '../../components/TranslateInput'
import TranslateResult from '../../components/TranslateResult'
import LanguageSelector from '../../components/LanguageSelector'
import TranslatorTabs from '../../components/TranslatorTabs'
import SettingsModal from '../../components/SettingsModal'
import TranslateFooter from '../../components/TranslateFooter'
import { useTranslation } from '../../hooks/useTranslation'
import { useConfig } from '../../hooks/useConfig'
import './translate.css'

function TranslateFeature() {
  // 初始化状态
  const [configVisible, setConfigVisible] = useState(false)
  // 使用配置Hook
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
    performTranslation,
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

  // 加载配置
  useEffect(() => {
    if (window.services) {
      // 处理uTools插件进入事件
      window.utools.onPluginEnter(action => {
        if (action.code === 'translate') {
          const { payload } = action
          if (payload) {
            const t = payload.trim()
            setSourceText(t)
            performTranslation(t)
          }
        }
      })

      // 处理uTools插件退出事件
      window.utools.onPluginOut(() => {
        setSourceText('')
      })
    }
  }, [])

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
