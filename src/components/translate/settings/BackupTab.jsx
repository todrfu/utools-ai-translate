import React from 'react'
import { Button, Space } from 'antd'
import { CloudUploadOutlined, CloudDownloadOutlined } from '@ant-design/icons'

const BackupTab = ({ onImportConfig, onExportConfig }) => {
  return (
    <div style={{ padding: '20px' }}>
      <Space style={{ width: '100%' }}>
        <Button
          type='primary'
          icon={<CloudDownloadOutlined />}
          onClick={() => {
            const path = window.utools.showSaveDialog({
              title: '保存配置文件',
              defaultPath: 'utools-plugin-ai-translate.json',
            })
            if (path) {
              try {
                onExportConfig(path)
                message.success('导出成功')
              } catch (error) {
                message.error('导出失败')
              }
            }
          }}
        >
          导出配置
        </Button>

        <Button
          type='primary'
          icon={<CloudUploadOutlined />}
          onClick={() => {
            const paths = window.utools.showOpenDialog({
              title: '选择配置文件',
              filters: [{ name: 'JSON Files', extensions: ['json'] }],
              properties: ['openFile'],
            })
            if (paths && paths.length > 0) {
              onImportConfig(paths[0])
            }
          }}
        >
          导入配置
        </Button>
      </Space>
    </div>
  )
}

export default BackupTab
