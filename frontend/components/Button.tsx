import React, { useState } from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonState = 'default' | 'disabled' | 'loading' | 'hover';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  state?: ButtonState;
  paddingHorizontal?: number;
  paddingVertical?: number;
  color?: string; 
  hoverColor?: string; // 按下或 hover 時的顏色
  disabledColor?: string; // 禁用時的顏色
}

export default function Button({ 
  title = '確定身份', 
  onPress, 
  style, 
  textStyle,
  state = 'default',
  paddingHorizontal = 20,
  paddingVertical = 16,
  color,
  hoverColor,
  disabledColor
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyle = () => {
    if (state === 'disabled') {
      if (disabledColor) return { backgroundColor: disabledColor };
      return styles.buttonDisabled;
    }
    if (state === 'loading') {
      if (color) return { backgroundColor: color };
      return styles.buttonLoading;
    }
    
    const isHover = state === 'hover' || (isPressed && state === 'default');

    if (isHover) {
      if (hoverColor) {
        return {
          backgroundColor: hoverColor,
          shadowColor: '#f7eeeeff',
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.7,
          shadowRadius: 4,
          elevation: 3,
        };
      }
      if (color) {
        return { backgroundColor: color };
      }
      return styles.buttonHover;
    }
    
    if (color) {
      return { backgroundColor: color };
    }

    return styles.buttonDefault;
  };

  const getDisplayText = () => {
    if (state === 'loading') {
      return '確認中⋯⋯';
    }
    return title;
  };

  const handlePress = () => {
    if (state !== 'disabled' && state !== 'loading' && onPress) {
      onPress();
    }
  };

  const handlePressIn = () => {
    if (state === 'default') {
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    if (state === 'default') {
      setIsPressed(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getButtonStyle(), { paddingHorizontal, paddingVertical }, style]} 
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={state === 'disabled' || state === 'loading'}
    >
      <Text style={[styles.text, textStyle]}>{getDisplayText()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 138,
    height: 70,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDefault: {
    backgroundColor: '#FFD745',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 215, 69, 0.60)',
  },
  buttonLoading: {
    backgroundColor: '#FFD745',
  },
  buttonHover: {
    backgroundColor: '#FFC904',
    shadowColor: '#f7eeeeff',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 20,
  },
});
