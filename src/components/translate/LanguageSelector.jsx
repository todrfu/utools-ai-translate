import React from 'react'
import { Select, Button, Tooltip } from 'antd'
import { SwapOutlined } from '@ant-design/icons'

const LanguageSelector = ({
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange
}) => {
  // 语言选项
  const languageOptions = [
    { value: 'auto', label: '自动检测' },
    { value: '简体中文', label: '简体中文' },
    { value: '繁体中文', label: '繁体中文' },
    { value: '英语', label: '英语' },
    { value: '日语', label: '日语' },
    { value: '韩语', label: '韩语' },
    { value: '法语', label: '法语' },
    { value: '德语', label: '德语' },
    { value: '俄语', label: '俄语' },
    { value: '西班牙语', label: '西班牙语' },
    { value: '葡萄牙语', label: '葡萄牙语' },
    { value: '泰语', label: '泰语' },
    { value: '粤语', label: '粤语' },
    { value: '文言文', label: '文言文' },
    { value: '意大利语', label: '意大利语' },
    { value: '荷兰语', label: '荷兰语' },
    { value: '波兰语', label: '波兰语' },
    { value: '越南语', label: '越南语' },
    { value: '阿拉伯语', label: '阿拉伯语' },
    { value: '印地语', label: '印地语' }
  ]

  // 源语言选项（包含自动检测）
  const sourceOptions = languageOptions.filter(lang => lang.value === 'auto')

  // 目标语言选项（不包含自动检测）
  const targetOptions = languageOptions.filter(lang => lang.value !== 'auto')

  // 语言切换
  const handleSwapLanguages = () => {
    if (sourceLang !== 'auto') {
      const temp = sourceLang
      onSourceLangChange(targetLang)
      onTargetLangChange(temp)
    }
  }

  const selectStyle = {
    width: 100,
    borderRadius: 2
  }

  return (
    <div className="translate__lang-selector">
      <div className="translate__lang-direction">
        <Select
          value={sourceLang}
          onChange={onSourceLangChange}
          style={selectStyle}
          options={sourceOptions}
          popupMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 150 }}
          disabled
          size="middle"
        />
        
        <Tooltip title="交换语言">
          <Button 
            disabled
            type="default" 
            icon={<SwapOutlined />} 
            onClick={handleSwapLanguages}
            className="translate__lang-swap-btn"
            size="middle"
            style={{ margin: '0 8px' }}
          />
        </Tooltip>
        
        <Select
          value={targetLang}
          onChange={onTargetLangChange}
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