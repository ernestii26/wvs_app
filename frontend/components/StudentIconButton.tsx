import React, { useState } from 'react';
import { Pressable, View, StyleSheet, Image } from 'react-native';

// 匯入兩張圖片
// const Teacher2 = require('../assets/images/teacher2.png');
const Student = require('../assets/Bear/student.png');

interface props {
  onPress?: () => void;
  isActive?: boolean;
}

export default function StudentIconButton({
  onPress,
  isActive = false
}:props ) {
  const [pressed, setPressed] = useState(false);

  return (
        <Pressable
      onPress={() => {
        onPress?.(); // 執行外部傳入的 onPress 函數
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={[styles.shadowOval, (isActive || pressed) && styles.activeShadow]} />
      <View style={styles.container}>
        <Image 
          source={Student} 
          style={styles.Student} 
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowOval: {
    width: 157,
    height: 130,
    borderRadius: 78.5,
    backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: -1,
    top: 40,  // Center vertically: (180 - 150) / 2
    //left: 3.5,  // Center horizontally: (157 - 150) / 2
  },
  activeShadow: {
    backgroundColor: 'transparent',
    boxShadow: '0px 0px 50px rgba(112, 165, 244, 1)',
    elevation: 20,
  },
  container: {
    width: 157,
    height: 180,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  Student: {
    width: 157,
    height: 180,
  }, 
});

