import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface ActionSheetOption {
  title: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
}

export default function ActionSheet({ visible, onClose, options, title }: ActionSheetProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const ITEM_HEIGHT = 60;
  const HEADER_HEIGHT = title ? 70 : 30;
  const CANCEL_HEIGHT = 60;
  const BOTTOM_PADDING = 40;
  const TOP_PADDING = 20;
  const sheetHeight = HEADER_HEIGHT + (options.length * ITEM_HEIGHT) + CANCEL_HEIGHT + BOTTOM_PADDING + TOP_PADDING;

  console.log('ActionSheet render - visible:', visible, 'options:', options.length, 'title:', title);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: screenHeight - sheetHeight,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight]);

  const handleOptionPress = (option: ActionSheetOption) => {
    console.log('ActionSheet option pressed:', option.title);
    onClose();
    setTimeout(() => {
      console.log('Executing option onPress for:', option.title);
      option.onPress();
    }, 100);
  };

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
                  transform: [{ translateY: slideAnim }],
                  height: sheetHeight,
                },
              ]}
            >
              <View style={styles.handle} />
              
              {title && (
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{title}</Text>
                </View>
              )}
              
              <View style={styles.optionsContainer}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      index === options.length - 1 && styles.lastOption,
                      option.destructive && { backgroundColor: '#FFF5F5' }
                    ]}
                    onPress={() => handleOptionPress(option)}
                    activeOpacity={0.7}
                  >
                    {option.icon && (
                      <Ionicons 
                        name={option.icon} 
                        size={24} 
                        color={option.destructive ? '#FF3B30' : '#2196F3'} 
                        style={styles.optionIcon}
                      />
                    )}
                    <Text 
                      style={[
                        styles.optionText,
                        option.destructive && styles.destructiveText
                      ]}
                    >
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    minHeight: 60,
  },
  lastOption: {
    marginBottom: 0,
  },
  optionIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  destructiveText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});