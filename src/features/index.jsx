import React from 'react'
import TranslateFeature from './translate'

// 功能映射表
const FEATURES = {
  translate: TranslateFeature,
  // 未来可以在这里添加更多功能
}

const Features = ({ featureCode, ...props }) => {
  // 获取当前功能组件
  const FeatureComponent = FEATURES[featureCode] || null

  if (!FeatureComponent) {
    return <div className="feature-not-found">功能不存在: {featureCode}</div>
  }

  return <FeatureComponent {...props} />
}

export default Features 