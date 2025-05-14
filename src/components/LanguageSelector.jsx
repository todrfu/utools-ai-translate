import React from 'react'
import { Select, Button, Tooltip, message } from 'antd'
import { SwapOutlined } from '@ant-design/icons'

const LanguageSelector = ({
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange,
  supportedLanguages = []
}) => {
  // 语言选项
  const languageOptions = [
    { value: 'auto', label: '自动检测' },
    { value: 'zh', label: '中文-简' },
    { value: 'en', label: '英语' },
    { value: 'ja', label: '日语' },
    { value: 'ko', label: '韩语' },
    { value: 'fr', label: '法语' },
    { value: 'de', label: '德语' },
    { value: 'ru', label: '俄语' },
    { value: 'es', label: '西班牙语' },
    { value: 'pt', label: '葡萄牙语' },
    { value: 'th', label: '泰语' },
    { value: 'zh-tw', label: '繁体中文' },
    { value: 'yue', label: '粤语' },
    { value: 'wyw', label: '文言文' }
  ].filter(lang => 
    lang.value === 'auto' || 
    !supportedLanguages.length || 
    supportedLanguages.includes(lang.value)
  )

  // 源语言选项（包含自动检测）
  const sourceOptions = languageOptions

  // 目标语言选项（不包含自动检测）
  const targetOptions = languageOptions.filter(lang => lang.value !== 'auto')
  
  // 处理源语言变化
  const handleSourceLangChange = (value) => {
    // 如果新选择的源语言与目标语言相同，则清空目标语言
    if (value === targetLang) {
      message.info('源语言和目标语言不能相同');
      onTargetLangChange('');
    }
    onSourceLangChange(value);
  }
  
  // 处理目标语言变化
  const handleTargetLangChange = (value) => {
    // 如果新选择的目标语言与源语言相同，则清空源语言
    if (value === sourceLang) {
      message.info('源语言和目标语言不能相同');
      onSourceLangChange('auto');
    }
    onTargetLangChange(value);
  }

  // 语言切换
  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang
      onSourceLangChange(targetLang)
      onTargetLangChange(temp)
    }
  }

  const selectStyle = {
    width: 130,
    borderRadius: 4
  }

  return (
    <div className="language-selector">
      <div className="language-direction">
        <Select
          value={sourceLang}
          onChange={handleSourceLangChange}
          style={selectStyle}
          options={sourceOptions}
          popupMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 150 }}
          size="middle"
        />
        
        <Tooltip title="交换语言">
          <Button 
            type="default" 
            icon={<SwapOutlined />} 
            onClick={handleSwapLanguages}
            disabled={sourceLang === 'auto'}
            className="swap-button"
            size="middle"
            style={{ margin: '0 8px' }}
          />
        </Tooltip>
        
        <Select
          value={targetLang}
          onChange={handleTargetLangChange}
          style={selectStyle}
          options={targetOptions}
          popupMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 150 }}
          size="middle"
        />
      </div>
    </div>
  )
}

export default LanguageSelector