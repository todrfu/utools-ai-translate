import React from 'react'
import { Modal, Tabs } from 'antd'
import { SETTINGS_TABS } from '../../shared/constant'

// 导入拆分后的子组件
import GeneralTab from './settings/GeneralTab'
import TranslatorsTab from './settings/TranslatorsTab'
import BackupTab from './settings/BackupTab'
import AboutTab from './settings/AboutTab'

const { TabPane } = Tabs

export const SettingsModal = ({
  visible,
  onCancel,
  config,
  onConfigChange,
  onConfigTranslatorAPI,
  onImportConfig,
  onExportConfig,
  translators,
}) => {
  return (
    <Modal
      title='设置'
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      style={{ top: 20 }}
      destroyOnClose
      maskClosable={false}
    >
      <Tabs tabPosition='left' style={{ minHeight: 400 }}>
        <TabPane
          tab={SETTINGS_TABS.GENERAL.label}
          key={SETTINGS_TABS.GENERAL.key}
        >
          <GeneralTab config={config} onConfigChange={onConfigChange} />
        </TabPane>

        <TabPane
          tab={SETTINGS_TABS.TRANSLATORS.label}
          key={SETTINGS_TABS.TRANSLATORS.key}
        >
          <TranslatorsTab
            config={config}
            translators={translators}
            onConfigChange={onConfigChange}
            onConfigTranslatorAPI={onConfigTranslatorAPI}
          />
        </TabPane>

        <TabPane
          tab={SETTINGS_TABS.BACKUP.label}
          key={SETTINGS_TABS.BACKUP.key}
        >
          <BackupTab
            onImportConfig={onImportConfig}
            onExportConfig={onExportConfig}
          />
        </TabPane>

        <TabPane tab={SETTINGS_TABS.ABOUT.label} key={SETTINGS_TABS.ABOUT.key}>
          <AboutTab />
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default SettingsModal
