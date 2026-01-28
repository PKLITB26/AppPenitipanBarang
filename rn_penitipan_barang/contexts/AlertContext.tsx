import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomAlert from '../components/CustomAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    setTimeout(() => {
      setAlertConfig(null);
    }, 200);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};