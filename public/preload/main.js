// 导入重构后的服务模块
const services = require('./services')

// 将services导出到全局对象
window.services = services

// 如果是首次使用插件，设置已使用标记
if (services.isFirstUse()) {
  services.setUsed()
} 