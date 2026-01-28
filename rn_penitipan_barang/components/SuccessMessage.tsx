import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessMessageProps {
  message: string;
  visible: boolean;
}

export default function SuccessMessage({ message, visible }: SuccessMessageProps) {
  if (!visible || !message) return null;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
      paddingHorizontal: 5,
    }}>
      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
      <Text style={{
        color: '#4CAF50',
        fontSize: 12,
        marginLeft: 5,
        flex: 1,
      }}>
        {message}
      </Text>
    </View>
  );
}