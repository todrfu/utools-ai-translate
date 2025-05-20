import React from 'react'
import { Spin, Button, Tooltip, Alert } from 'antd'
import {
  SoundOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  StopOutlined,
} from '@ant-design/icons'

const TranslateResult = ({
  result,
  loading,
  language,
  onSpeak,
  onCancelTranslation,
  fontSize = 16,
}) => {
  // 处理朗读
  const handleSpeak = () => {
    if (result?.translatedText && onSpeak) {
      onSpeak(result.translatedText, language)
    }
  }

  // 处理取消翻译
  const handleCancel = () => {
    if (onCancelTranslation) {
      onCancelTranslation()
    }
  }

  // 显示占位符内容或已翻译的内容
  const renderContent = () => {
    if (loading) {
      return (
        <div className='translate__result-loading'>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            tip={
              <div>
                <div style={{ marginBottom: '10px' }}>翻译中...</div>
                <Button
                  type='primary'
                  danger
                  size='small'
                  icon={<StopOutlined />}
                  onClick={handleCancel}
                >
                  取消翻译
                </Button>
              </div>
            }
          />
        </div>
      )
    }

    if (result?.error) {
      return (
        <Alert
          type='error'
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`翻译错误: ${result.error}`}
        />
      )
    }

    if (!result?.translatedText) {
      return (
        <span className='translate__result-empty'>等待输入翻译内容...</span>
      )
    }

    return (
      <div
        className='translate__result-text'
        style={{ fontSize: `${fontSize}px` }}
      >
        {result.translatedText}
      </div>
    )
  }

  return (
    <div className='translate__result'>
      <div className='translate__result-content'>{renderContent()}</div>

      {result?.translatedText && !loading && (
        <div className='translate__result-actions'>
          <Tooltip title='朗读'>
            <Button
              type='text'
              icon={<SoundOutlined />}
              onClick={handleSpeak}
            />
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export default TranslateResult
