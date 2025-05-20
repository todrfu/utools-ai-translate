import { useState, useEffect } from 'react'
import { message } from 'antd'

export function useConfig() {
  const [config, setConfig] = useState({
    enabledTranslators: [],
    searchPaths: [],
    excludePaths: [],
    translatorConfigs: {},
  })

  useEffect(() => {
    // 确保services可用
    if (typeof window !== 'undefined' && window.services) {
      const savedConfig = window.services.getConfig()
      setConfig(savedConfig)
    }
  }, [])

  const updateConfig = (key, value) => {
    if (!config) return

    let newConfig
    if (typeof key === 'string') {
      newConfig = { ...config, [key]: value }
    } else if (typeof key === 'object') {
      newConfig = { ...config, ...key }
    } else {
      return
    }

    window.services.updateConfig(newConfig)
    setConfig(newConfig)
  }

  const configTranslatorAPI = (translatorKey, apiConfig) => {
    if (!translatorKey || !apiConfig || !config) return false

    const newConfig = {
      ...config,
      translatorConfigs: {
        ...config.translatorConfigs,
        [translatorKey]: apiConfig,
      },
    }

    window.services.updateConfig(newConfig)
    setConfig(newConfig)
    message.success(
      `配置${window.services.getTranslators()[translatorKey].name}成功`
    )
    return true
  }

  const enableTranslator = translatorKey => {
    if (!translatorKey || !config) return false

    if (!config.enabledTranslators.includes(translatorKey)) {
      const newConfig = {
        ...config,
        enabledTranslators: [...config.enabledTranslators, translatorKey],
      }
      window.services.updateConfig(newConfig)
      setConfig(newConfig)
      message.success(
        `启用${window.services.getTranslators()[translatorKey].name}成功`
      )
      return true
    }
    return false
  }

  const disableTranslator = translatorKey => {
    if (!translatorKey || !config) return false

    if (config.enabledTranslators.includes(translatorKey)) {
      const newConfig = {
        ...config,
        enabledTranslators: config.enabledTranslators.filter(
          t => t !== translatorKey
        ),
      }
      window.services.updateConfig(newConfig)
      setConfig(newConfig)
      message.success(
        `禁用${window.services.getTranslators()[translatorKey].name}成功`
      )
      return true
    }
    return false
  }

  const exportConfig = async filePath => {
    if (!filePath) return false
    return window.services.exportConfig(filePath)
  }

  const importConfig = async filePath => {
    if (!filePath) return false
    const success = window.services.importConfig(filePath)
    if (success) {
      setConfig(window.services.getConfig())
      message.success('导入配置成功')
    }
    return success
  }

  const addSearchPath = path => {
    if (!path || !config) return false

    if (!config.searchPaths.includes(path)) {
      const newConfig = {
        ...config,
        searchPaths: [...config.searchPaths, path],
      }
      window.services.updateConfig(newConfig)
      setConfig(newConfig)
      message.success('添加搜索路径成功')
      return true
    }
    return false
  }

  const removeSearchPath = path => {
    if (!path || !config) return

    const newConfig = {
      ...config,
      searchPaths: config.searchPaths.filter(p => p !== path),
    }
    window.services.updateConfig(newConfig)
    setConfig(newConfig)
    message.success('移除搜索路径成功')
  }

  const addExcludePath = path => {
    if (!path || !config) return false

    if (!config.excludePaths.includes(path)) {
      const newConfig = {
        ...config,
        excludePaths: [...config.excludePaths, path],
      }
      window.services.updateConfig(newConfig)
      setConfig(newConfig)
      message.success('添加排除路径成功')
      return true
    }
    return false
  }

  const removeExcludePath = path => {
    if (!path || !config) return

    const newConfig = {
      ...config,
      excludePaths: config.excludePaths.filter(p => p !== path),
    }
    window.services.updateConfig(newConfig)
    setConfig(newConfig)
    message.success('移除排除路径成功')
  }

  return {
    config,
    updateConfig,
    configTranslatorAPI,
    enableTranslator,
    disableTranslator,
    exportConfig,
    importConfig,
    addSearchPath,
    removeSearchPath,
    addExcludePath,
    removeExcludePath,
  }
}
