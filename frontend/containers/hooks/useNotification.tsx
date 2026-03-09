import React, { createContext, useContext, useState, ReactNode } from 'react';
import NotificationDialog from '@/components/NotificationDialog';

interface NotificationConfig {
  title?: string;
  message: string;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  confirmText?: string;
  closeText?: string;
}

interface NotificationContextType {
  showNotification: (config: NotificationConfig) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    message: '',
  });

  const showNotification = (newConfig: NotificationConfig) => {
    setConfig(newConfig);
    setVisible(true);
  };

  const hideNotification = () => {
    setVisible(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <NotificationDialog
        visible={visible}
        title={config.title}
        message={config.message}
        onClose={hideNotification}
        onConfirm={config.onConfirm}
        showConfirmButton={config.showConfirmButton}
        confirmText={config.confirmText}
        closeText={config.closeText}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification 必須在 NotificationProvider 內使用');
  }
  return context;
};
