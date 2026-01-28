import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  visible: boolean;
}

export default function ErrorMessage({ message, visible }: ErrorMessageProps) {
  if (!visible || !message) return null;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
      paddingHorizontal: 5,
    }}>
      <Ionicons name="alert-circle" size={16} color="#FF5722" />
      <Text style={{
        color: '#FF5722',
        fontSize: 12,
        marginLeft: 5,
        flex: 1,
      }}>
        {message}
      </Text>
    </View>
  );
}