import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm';
}

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  buttons = [{ text: 'OK' }], 
  onClose,
  type = 'info'
}: CustomAlertProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: '#25D366', size: 50 };
      case 'error':
        return { name: 'close-circle', color: '#DC143C', size: 50 };
      case 'warning':
        return { name: 'warning', color: '#FF9500', size: 50 };
      case 'confirm':
        return { name: 'help-circle', color: '#007AFF', size: 50 };
      default:
        return { name: 'information-circle', color: '#007AFF', size: 50 };
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    onClose();
    setTimeout(() => {
      if (button.onPress) {
        button.onPress();
      }
    }, 100);
  };

  const iconConfig = getIconConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={iconConfig.name} 
                  size={iconConfig.size} 
                  color={iconConfig.color} 
                />
              </View>

              {/* Title */}
              {title && (
                <Text style={styles.title}>{title}</Text>
              )}

              {/* Message */}
              {message && (
                <Text style={styles.message}>{message}</Text>
              )}

              {/* Buttons */}
              <View style={styles.buttonsContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      buttons.length === 1 && styles.singleButton,
                      buttons.length === 2 && index === 0 && styles.leftButton,
                      buttons.length === 2 && index === 1 && styles.rightButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'cancel' && styles.cancelText,
                        button.style === 'destructive' && styles.destructiveText,
                        buttons.length === 1 && styles.singleButtonText,
                        buttons.length === 2 && index === 1 && styles.rightButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 25,
    minWidth: screenWidth * 0.75,
    maxWidth: screenWidth * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  singleButton: {
    backgroundColor: '#25D366',
    marginHorizontal: 0,
  },
  leftButton: {
    marginLeft: 0,
  },
  rightButton: {
    backgroundColor: '#25D366',
    marginRight: 0,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  singleButtonText: {
    color: 'white',
  },
  rightButtonText: {
    color: 'white',
  },
  cancelText: {
    color: '#666',
  },
  destructiveText: {
    color: 'white',
  },
});