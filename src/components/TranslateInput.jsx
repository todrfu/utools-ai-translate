import React, { useRef, useEffect } from 'react'
import { Input, Button, Tooltip, Typography } from 'antd'
import { SoundOutlined, CloseCircleOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Text } = Typography

const TranslateInput = ({
  value,
  onChange,
  onKeyDown,
  onClear,
  onSpeak,
  onTranslate,
  loading,
  detectedLanguage,
  placeholder = '请输入要翻译的内容，可右键点击文本框粘贴',
  inputRef
}) => {
  // 使用内部ref或外部传入的ref
  const internalRef = useRef(null)
  const textareaRef = inputRef || internalRef

  // 组件挂载时自动聚焦
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // 处理输入变化
  const handleChange = (e) => {
    const newText = e.target.value
    onChange(newText)
  }

  // 处理按键事件
  const handleKeyDown = (e) => {
    // 当按下Enter键且未按Shift键时，触发翻译
    if (e.key === 'Enter' && !e.shiftKey && onTranslate) {
      e.preventDefault()
      onTranslate()
      return
    }
    
    // 调用传入的onKeyDown处理其他按键事件
    if (onKeyDown) {
      onKeyDown(e)
    }
  }

  // 清空输入框
  const handleClear = () => {
    if (onClear) onClear()
  }

  // 朗读输入文本
  const handleSpeak = () => {
    if (value && onSpeak) {
      onSpeak(value, detectedLanguage || 'auto')
    }
  }

  return (
    <div className="translate-input-wrapper">
      <TextArea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        maxLength={4000}
        autoSize={{ minRows: 4, maxRows: 8 }}
        className="translate-input-textarea"
        style={{ padding: '12px' }}
      />
      
      <div className="translate-input-tools">
        {detectedLanguage && (
          <div className="detected-language">
            检测到: <Text type="primary" style={{ marginLeft: '4px' }}>{detectedLanguage}</Text>
          </div>
        )}
        
        <div className="input-buttons">
          <Tooltip title="朗读">
            <Button 
              type="text" 
              icon={<SoundOutlined />}
              onClick={handleSpeak}
              disabled={!value}
            />
          </Tooltip>
          
          <Tooltip title="清空">
            <Button 
              type="text" 
              icon={<CloseCircleOutlined />}
              onClick={handleClear}
              disabled={!value}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default TranslateInput 