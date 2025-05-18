import React from 'react'
import { Form, Switch, Space, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

const GeneralTab = ({ config, onConfigChange }) => {
  return (
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
            onChange={checked => onConfigChange('translateOnTyping', checked)}
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
  )
}

export default GeneralTab
