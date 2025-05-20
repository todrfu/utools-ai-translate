import React, { useState, useEffect } from 'react'
import Features from './features'
import './App.css'

function App() {
  // 当前激活的功能代码
  const [activeFeature, setActiveFeature] = useState('translate')

  useEffect(() => {
    if (window.utools) {
      // 处理uTools插件进入事件
      window.utools.onPluginEnter(action => {
        const { code } = action
        // 根据进入的方式设置当前功能
        setActiveFeature(code)
      })
    }
  }, [])

  return (
    <div className='app-container'>
      <Features featureCode={activeFeature} />
    </div>
  )
}

export default App
