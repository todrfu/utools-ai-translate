import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button } from 'antd'

const TranslatorConfigModal = ({
  visible,
  onCancel,
  onSave,
  translator,
  translatorKey,
  initialConfig = {},
}) => {
  const [apiConfig, setApiConfig] = useState({})

  useEffect(() => {
    setApiConfig(initialConfig)
  }, [initialConfig])

  // 获取字段的显示名称
  const getFieldLabel = field => {
    const fieldLabels = {
      apiKey: 'API密钥',
      appKey: '应用ID',
      appSecret: '应用密钥',
      appId: '应用ID',
      secretId: '密钥ID',
      secretKey: '密钥',
      token: 'Token',
      apiUrl: 'API地址',
      accessKeyId: '访问密钥ID',
      accessKeySecret: '访问密钥',
      secretAccessKey: '访问密钥',
    }
    return fieldLabels[field] || field
  }

  // 检查API配置是否有效
  const isApiConfigValid = () => {
    if (!translator) return false

    const requiredFields = translator.requiredFields || []
    return requiredFields.every(
      field => apiConfig[field] && apiConfig[field].trim().length > 0
    )
  }

  return (
    <Modal
      title={`${translator?.name || ''} API配置`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key='cancel' onClick={onCancel}>
          取消
        </Button>,
        <Button
          key='save'
          type='primary'
          onClick={() => onSave(translatorKey, apiConfig)}
          disabled={!isApiConfigValid()}
        >
          保存
        </Button>,
      ]}
      width={450}
      destroyOnClose
      maskClosable={false}
    >
      <Form layout='vertical'>
        {translator?.requiredFields?.map(field => (
          <Form.Item key={field} label={getFieldLabel(field)} required>
            <Input
              value={apiConfig[field] || ''}
              onChange={e =>
                setApiConfig({ ...apiConfig, [field]: e.target.value })
              }
              placeholder={`请输入${getFieldLabel(field)}`}
            />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  )
}

export default TranslatorConfigModal
