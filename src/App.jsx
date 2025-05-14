import React, { useState, useEffect } from 'react'
import { Button, Tooltip } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import Text from 'antd/lib/typography/Text'
import TranslateInput from './components/TranslateInput'
import TranslateResult from './components/TranslateResult'
import LanguageSelector from './components/LanguageSelector'
import TranslatorTabs from './components/TranslatorTabs'
import SettingsModal from './components/SettingsModal'
import { useTranslation } from './hooks/useTranslation'
import { useConfig } from './hooks/useConfig'
import './App.css'

function App() {
  // 初始化状态
  const [configVisible, setConfigVisible] = useState(false)

  // 使用配置Hook
  const {
    config,
    updateConfig,
    configTranslatorAPI,
    exportConfig,
    importConfig
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
    detectedLanguage,
    translate,
    clearInput,
    handleKeyDown,
    speakText,
    copyToClipboard,
    inputRef
  } = useTranslation(config)

  // 获取翻译服务配置
  const TRANSLATORS = window.services ? window.services.getTranslators() : {}

  // 加载配置
  useEffect(() => {
    if (window.services) {
      // 处理uTools插件进入事件
      window.utools.onPluginEnter(action => {
        const { payload } = action
        if (payload) {
          const t = payload.trim()
          setSourceText(t)
          performTranslation(t)
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
    <div className="translate-container">
      {/* 翻译输入区域 */}
      <div className="translate-input-container">
        <TranslateInput
          value={sourceText}
          onChange={setSourceText}
          onKeyDown={handleKeyDown}
          onClear={clearInput}
          onSpeak={(text) => speakText(text, detectedLanguage || sourceLang)}
          loading={loading}
          detectedLanguage={detectedLanguage}
          onTranslate={translate}
          placeholder="请输入要翻译的内容，可右键点击文本框粘贴"
          inputRef={inputRef}
        />
        <Text type="secondary" className="character-counter">
          {sourceText ? sourceText.length : 0}/4000
        </Text>
      </div>

      {/* 翻译服务选择tabs */}
      <div className="translator-tabs-container">
        <TranslatorTabs
          translators={TRANSLATORS}
          enabledTranslators={config?.enabledTranslators || []}
          selectedTranslator={selectedTranslator}
          onTranslatorChange={setSelectedTranslator}
        />
        
        {/* 语言选择器 */}
        <LanguageSelector
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSourceLangChange={setSourceLang}
          onTargetLangChange={setTargetLang}
          supportedLanguages={
            selectedTranslator && TRANSLATORS[selectedTranslator]
              ? TRANSLATORS[selectedTranslator].supportedLanguages
              : []
          }
        />
      </div>

      {/* 翻译结果区域 */}
      <div className="translation-result-container">
        <h3 className="result-title">翻译结果</h3>
        <TranslateResult
          result={selectedTranslator ? translations[selectedTranslator] : null}
          translatorKey={selectedTranslator}
          translatorInfo={TRANSLATORS[selectedTranslator]}
          loading={loading}
          language={targetLang}
          onCopy={copyToClipboard}
          onSpeak={(text) => speakText(text, targetLang)}
          fontSize={config?.fontSize || 16}
        />
      </div>

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
      
      {/* 设置按钮 */}
      <div className="footer">
        <Tooltip title="设置">
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="settings-button"
            onClick={showSettings}
          />
        </Tooltip>
      </div>
    </div>
  )
}

export default App
