import React from 'react'
import { Spin, Button, Tooltip, Empty, Alert } from 'antd'
import { SoundOutlined, CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons'


const TranslateResult = ({
  result,
  loading,
  language,
  onCopy,
  onSpeak,
  fontSize = 16
}) => {
  // 处理复制
  const handleCopy = () => {
    if (result?.translatedText && onCopy) {
      onCopy(result.translatedText)
    }
  }

  // 处理朗读
  const handleSpeak = () => {
    if (result?.translatedText && onSpeak) {
      onSpeak(result.translatedText, language)
    }
  }

  // 显示占位符内容或已翻译的内容
  const renderContent = () => {
    if (loading) {
      return (
        <div className="result-loading">
          <Spin tip="翻译中..." />
        </div>
      )
    } 
    
    if (result?.error) {
      return (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`翻译错误: ${result.error}`}
        />
      )
    } 
    
    if (!result?.translatedText) {
      return (
        <Empty description="等待输入翻译内容..." />
      )
    }
    
    return (
      <div className="translated-text" style={{ fontSize: `${fontSize}px` }}>
        {result.translatedText}
      </div>
    )
  }

  return (
    <div className="translation-result">
      <div className="result-content">
        {renderContent()}
      </div>
      
      {result?.translatedText && (
        <div className="result-actions">
          <Tooltip title="朗读">
            <Button 
              type="text" 
              icon={<SoundOutlined />}
              onClick={handleSpeak}
            />
          </Tooltip>
          
          <Tooltip title="复制">
            <Button 
              type="text" 
              icon={<CopyOutlined />}
              onClick={handleCopy}
            />
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export default TranslateResult