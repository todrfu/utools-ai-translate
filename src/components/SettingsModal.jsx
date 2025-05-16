import React, { useState } from 'react'
import {
  Modal,
  Tabs,
  Form,
  Input,
  Switch,
  Button,
  Divider,
  Typography,
  Checkbox,
  Space,
  List,
  Tooltip,
  Badge,
} from 'antd'
import {
  QuestionCircleOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons'
import { SETTINGS_TABS } from '../shared/constant'

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

export const SettingsModal = ({
  visible,
  onCancel,
  config,
  onConfigChange,
  onConfigTranslatorAPI,
  onImportConfig,
  onExportConfig,
  translators,
}) => {
  const [configuring, setConfiguring] = useState(null)
  const [apiConfig, setApiConfig] = useState({})

  // 打开配置对话框
  const openConfigDialog = translatorKey => {
    const currentConfig = (config.translatorConfigs || {})[translatorKey] || {}
    setApiConfig(currentConfig)
    setConfiguring(translatorKey)
  }

  // 关闭配置对话框
  const closeConfigDialog = () => {
    setConfiguring(null)
    setApiConfig({})
  }

  // 保存API配置
  const saveApiConfig = () => {
    if (configuring && onConfigTranslatorAPI) {
      onConfigTranslatorAPI(configuring, apiConfig)
      closeConfigDialog()
    }
  }

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
    if (!configuring || !translators[configuring]) return false

    const translator = translators[configuring]
    const requiredFields = translator.requiredFields || []

    return requiredFields.every(
      field => apiConfig[field] && apiConfig[field].trim().length > 0
    )
  }

  return (
    <>
      <Modal
        title='设置'
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        style={{ top: 20 }}
        destroyOnClose
        maskClosable={false}
      >
        <Tabs tabPosition='left' style={{ minHeight: 400 }}>
          <TabPane
            tab={SETTINGS_TABS.GENERAL.label}
            key={SETTINGS_TABS.GENERAL.key}
          >
            <div style={{ padding: '20px' }}>
              <Form layout='vertical'>
                <Form.Item
                  label={
                    <Space>
                      输入时自动翻译
                      <Tooltip title='关闭后，需按回车键触发翻译'>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name='translateOnTyping'
                >
                  <Switch
                    checked={config.translateOnTyping || false}
                    onChange={checked =>
                      onConfigChange('translateOnTyping', checked)
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      去除换行
                      <Tooltip title='关闭后，翻译结果保留原文的换行格式'>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name='removeLineBreaks'
                >
                  <Switch
                    checked={config.removeLineBreaks || false}
                    onChange={checked => {
                      onConfigChange('removeLineBreaks', checked)
                    }}
                  />
                </Form.Item>
              </Form>
            </div>
          </TabPane>

          <TabPane
            tab={SETTINGS_TABS.TRANSLATORS.label}
            key={SETTINGS_TABS.TRANSLATORS.key}
          >
            <div style={{ padding: '20px' }}>
              <Paragraph style={{ marginBottom: 16 }}>
                选择你要使用的翻译服务，并配置对应的API密钥。
              </Paragraph>

              <List
                itemLayout='horizontal'
                dataSource={Object.entries(translators)}
                renderItem={([key, translator]) => (
                  <List.Item
                    style={{ padding: '12px' }}
                    actions={[
                      <Button
                        type='primary'
                        size='small'
                        onClick={() => openConfigDialog(key)}
                      >
                        配置
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Checkbox
                          checked={(config.enabledTranslators || []).includes(
                            key
                          )}
                          onChange={e => {
                            const enabledTranslators = [
                              ...(config.enabledTranslators || []),
                            ]
                            if (e.target.checked) {
                              if (!enabledTranslators.includes(key)) {
                                enabledTranslators.push(key)
                              }
                            } else {
                              const index = enabledTranslators.indexOf(key)
                              if (index !== -1) {
                                enabledTranslators.splice(index, 1)
                              }
                            }
                            onConfigChange(
                              'enabledTranslators',
                              enabledTranslators
                            )
                          }}
                        />
                      }
                      title={translator.name}
                      description={
                        (config.translatorConfigs || {})[key] ? (
                          <Badge status='success' text='已配置' />
                        ) : (
                          <Badge status='error' text='未配置' />
                        )
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </TabPane>

          <TabPane
            tab={SETTINGS_TABS.BACKUP.label}
            key={SETTINGS_TABS.BACKUP.key}
          >
            <div style={{ padding: '20px' }}>
              <Space style={{ width: '100%' }}>
                <Button
                  type='primary'
                  icon={<CloudDownloadOutlined />}
                  onClick={() => {
                    const path = window.utools.showSaveDialog({
                      title: '保存配置文件',
                      defaultPath: 'utools-plugin-smart-translate.json',
                    })
                    if (path) {
                      onExportConfig(path)
                    }
                  }}
                >
                  导出配置
                </Button>

                <Button
                  type='primary'
                  icon={<CloudUploadOutlined />}
                  onClick={() => {
                    const paths = window.utools.showOpenDialog({
                      title: '选择配置文件',
                      filters: [{ name: 'JSON Files', extensions: ['json'] }],
                      properties: ['openFile'],
                    })
                    if (paths && paths.length > 0) {
                      onImportConfig(paths[0])
                    }
                  }}
                >
                  导入配置
                </Button>
              </Space>
            </div>
          </TabPane>

          <TabPane
            tab={SETTINGS_TABS.ABOUT.label}
            key={SETTINGS_TABS.ABOUT.key}
          >
            <div style={{ padding: '20px' }}>
              <Title level={4}>智翻</Title>
              <Paragraph>版本: 0.0.1</Paragraph>
              <Paragraph>支持多个AI平台的智能翻译工具</Paragraph>
              <Paragraph>如果你喜欢这个插件，别忘了给一个好评 ❤️</Paragraph>

              <Divider />

              <Title level={5}>开发者</Title>
              <Paragraph>drfu</Paragraph>
            </div>
          </TabPane>
        </Tabs>
      </Modal>

      {/* API配置对话框 */}
      {configuring && (
        <Modal
          title={`${translators[configuring]?.name || ''} API配置`}
          open={true}
          onCancel={closeConfigDialog}
          footer={[
            <Button key='cancel' onClick={closeConfigDialog}>
              取消
            </Button>,
            <Button
              key='save'
              type='primary'
              onClick={saveApiConfig}
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
            {translators[configuring]?.requiredFields?.map(field => (
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
      )}
    </>
  )
}

export default SettingsModal
