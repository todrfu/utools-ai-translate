// 导入各个服务模块
const coreServices = require('./core')
const translateServices = require('./translate')
const speechServices = require('./speech')

// 合并所有服务为一个对象并导出
module.exports = {
  ...coreServices,
  ...translateServices,
  ...speechServices
} 