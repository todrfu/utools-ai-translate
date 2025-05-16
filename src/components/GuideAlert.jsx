import React from 'react'
import { Alert, Space, Button } from 'antd'

export const GuideAlert = ({ onClose, onOpenSettings }) => {
  return (
    <Alert
      message="首次使用智翻"
      description={
        <div>
          <p>
            欢迎使用智翻！这款插件支持多种服务，但需要先配置相关API密钥才能使用。
          </p>
          <p>
            智翻的功能来自于第三方服务，需要自行申请，大多数服务提供免费额度，足够日常使用。
          </p>
          <Space>
            <Button type="primary" onClick={onOpenSettings}>
              立即配置
            </Button>
            <Button onClick={onClose}>我知道了</Button>
          </Space>
        </div>
      }
      type="info"
      showIcon
      closable
      onClose={onClose}
      style={{ marginBottom: 16 }}
    />
  )
}
