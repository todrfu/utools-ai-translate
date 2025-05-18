import React, { useState } from 'react'
import { List, Checkbox, Button, Typography, Badge } from 'antd'
import TranslatorConfigModal from './TranslatorConfigModal'

const { Paragraph } = Typography

const TranslatorsTab = ({
  config,
  translators,
  onConfigChange,
  onConfigTranslatorAPI,
}) => {
  const [configuring, setConfiguring] = useState(null)

  // 打开配置对话框
  const openConfigDialog = translatorKey => {
    setConfiguring(translatorKey)
  }

  // 关闭配置对话框
  const closeConfigDialog = () => {
    setConfiguring(null)
  }

  // 保存API配置
  const saveApiConfig = (translatorKey, apiConfig) => {
    if (onConfigTranslatorAPI) {
      onConfigTranslatorAPI(translatorKey, apiConfig)
      closeConfigDialog()
    }
  }

  return (
    <>
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
                    checked={(config.enabledTranslators || []).includes(key)}
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
                      onConfigChange('enabledTranslators', enabledTranslators)
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

      {/* API配置对话框 */}
      {configuring && (
        <TranslatorConfigModal
          visible={!!configuring}
          onCancel={closeConfigDialog}
          onSave={saveApiConfig}
          translator={translators[configuring]}
          translatorKey={configuring}
          initialConfig={(config.translatorConfigs || {})[configuring] || {}}
        />
      )}
    </>
  )
}

export default TranslatorsTab
