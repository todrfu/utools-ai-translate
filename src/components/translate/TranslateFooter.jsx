import React from 'react'
import { Button, Tooltip } from 'antd'
import {
  SettingOutlined,
  CopyOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'

export const TranslateFooter = ({ onCopy, translatedText, showSettings }) => {
  // 处理复制
  const handleCopy = () => {
    if (translatedText && onCopy) {
      onCopy(translatedText, false)
    }
  }

  // 处理复制并隐藏
  const handleCopyAndHide = () => {
    if (translatedText && onCopy) {
      onCopy(translatedText, true)
    }
  }

  return (
    <div className='translate__footer'>
      <div className='translate__copy-buttons'>
        <Button
          size='small'
          type='default'
          icon={<CopyOutlined />}
          onClick={handleCopy}
        >
          仅复制
        </Button>

        <Button
          size='small'
          type='primary'
          icon={<MinusCircleOutlined />}
          onClick={handleCopyAndHide}
        >
          复制并隐藏
        </Button>
      </div>
      <Tooltip title='设置'>
        <Button
          type='text'
          icon={<SettingOutlined />}
          className='translate__settings-btn'
          onClick={showSettings}
        />
      </Tooltip>
    </div>
  )
}

export default TranslateFooter
