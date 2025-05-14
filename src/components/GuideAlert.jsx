import React from 'react'
import { Alert, Space, Button } from 'antd'

export const GuideAlert = ({ onClose, onOpenSettings }) => {
  return (
    <Alert
      message="首次使用atob翻译"
      description={
        <div>
          <p>
            欢迎使用atob翻译！这款插件支持多种翻译服务，但需要先配置相关API密钥才能使用。
          </p>
          <p>
            atob翻译的能力来自于第三方翻译服务，需要自行申请，大多数服务提供免费额度，足够日常使用。如需帮助请查看插件市场中的相关文档。
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
