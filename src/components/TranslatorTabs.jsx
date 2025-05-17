import { message } from 'antd'
import React from 'react'

// icons
const modules = import.meta.glob('../assets/images/translate/*', { eager: true })
const iconMap = Object.fromEntries(
  Object.keys(modules).map((key) => [key.split('/').pop().split('.').shift(), modules[key].default])
)

const TranslatorTabs = ({
  translators,
  enabledTranslators,
  selectedTranslator,
  onTranslatorChange,
  showSettings,
}) => {
  const getOrderedTranslators = () => {
    if (
      !translators ||
      !enabledTranslators ||
      Object.keys(translators).length === 0
    ) {
      return []
    }

    // 过滤出启用的翻译器
    const filtered = Object.entries(translators).filter(([key]) =>
      enabledTranslators.includes(key)
    )

    return filtered
  }

  const orderedTranslators = getOrderedTranslators()

  // 处理翻译器点击
  const handleTranslatorClick = (key, name, needsConfig, isConfigured) => {
    // 如果需要配置API但未配置，显示提示消息
    if (needsConfig && !isConfigured) {
      message.warning(`请先在设置中配置${name}的API密钥`)
      showSettings('translators')
      return
    }

    onTranslatorChange(key)
  }

  // 渲染翻译器图标
  const renderTranslatorIcon = (key, name) => {
    let icon = (
      <img
        src={iconMap[key]}
        alt={name}
        width='24'
        height='24'
      />
    )

    // 判断是否需要配置
    const needsConfig = translators[key]?.requiredFields?.length > 0
    const { translatorConfigs } = window.services.getConfig() || {}
    const isConfigured = translatorConfigs[key]

    return (
      <div
        className={`translate__tab ${selectedTranslator === key ? 'translate__tab--active' : ''} ${needsConfig && !isConfigured ? 'translate__tab--not-configured' : ''}`}
        onClick={() =>
          handleTranslatorClick(key, name, needsConfig, isConfigured)
        }
        key={key}
        title={needsConfig && !isConfigured ? `${name} 需要配置API密钥` : name}
      >
        <div className='translate__tab-icon'>{icon}</div>
        <div className='translate__tab-name'>{name}</div>
      </div>
    )
  }

  return (
    <div className='translate__tabs'>
      {orderedTranslators.length > 0 ? (
        orderedTranslators.map(([key, translator]) =>
          renderTranslatorIcon(key, translator.name)
        )
      ) : (
        // 如果没有可用的翻译器，显示默认选项
        <div className='translate__tab translate__tab--empty'>
          <div className='translate__tab-icon'>
            <svg viewBox='0 0 1024 1024' width='24' height='24'>
              <path
                d='M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z'
                fill='#1890ff'
              ></path>
              <path
                d='M512 336c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176z'
                fill='#1890ff'
              ></path>
            </svg>
          </div>
          <div className='translate__tab-name'>请配置翻译服务</div>
        </div>
      )}
    </div>
  )
}

export default TranslatorTabs
