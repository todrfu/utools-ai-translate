import { useState, useEffect } from 'react'

export function useSearch(config) {
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [originalResults, setOriginalResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // 过滤结果
  const filterResults = (results, types) => {
    if (!types || types.length === 0) return []
    return results.filter(item => {
      if (types.includes('file') && !item.isDirectory) return true
      if (types.includes('directory') && item.isDirectory) return true
      return false
    })
  }

  // 执行搜索
  const performSearch = value => {
    const v = value.trim()
    if (!v) {
      setSearchResults([])
      setOriginalResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const results = window.services.searchFiles(v)
      setOriginalResults(results)
      setSearchResults(filterResults(results, config?.searchTypes || []))
    } catch (error) {
      console.error('搜索出错：', error)
    } finally {
      setLoading(false)
    }
  }

  // 监听搜索类型变化
  useEffect(() => {
    if (config?.searchTypes) {
      setSearchResults(filterResults(originalResults, config.searchTypes))
    }
  }, [originalResults, config?.searchTypes])

  // 当搜索结果更新时，重置选中项
  useEffect(() => {
    setSelectedIndex(searchResults.length > 0 ? 0 : -1)
  }, [searchResults])

  return {
    searchValue,
    setSearchValue,
    searchResults,
    setSearchResults,
    originalResults,
    setOriginalResults,
    loading,
    setLoading,
    selectedIndex,
    setSelectedIndex,
    filterResults,
    performSearch,
  }
}
