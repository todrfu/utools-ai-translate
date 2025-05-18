import React from 'react'
import { Typography, Divider } from 'antd'

const { Title, Paragraph } = Typography

const AboutTab = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={4}>AI 翻译</Title>
      <Paragraph>版本: 0.0.1</Paragraph>
      <Paragraph>支持多个AI平台的智能翻译工具</Paragraph>
      <Paragraph>如果你喜欢这个插件，别忘了给一个好评 ❤️</Paragraph>

      <Divider />

      <Title level={5}>开发者</Title>
      <Paragraph>drfu</Paragraph>
    </div>
  )
}

export default AboutTab
