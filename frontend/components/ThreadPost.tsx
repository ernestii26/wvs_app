/*顯示單一貼文元件，包括老師評語區塊*/

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. 定義資料介面 (Interface)
interface ThreadPostProps {
  avatar: string | ImageSourcePropType;  // 大頭貼 URL 或本地圖片
  name: string;          // 顯示名稱 (例如: 吳昊和)
  handle: string;        // 帳號 ID (例如: @haohan)
  time: string;          // 時間字串
  content: string;       // 貼文內容
  images?: string[];     // 貼文圖片
  commentsCount: number; // 留言數
  TeacherName?: string; // <--- 新增這一行：老師的名字
  onPressThread?: () => void; // 點擊 "查看這個留言串" 的 callback
}

const ThreadPost: React.FC<ThreadPostProps> = ({
  avatar,
  name,
  handle,
  time,
  content,
  images,
  commentsCount,
  TeacherName,
  onPressThread,
}) => {
  return (
    <View style={styles.container}>
      
      {/* --- 左側區域：頭像與連接線 --- */}
      <View style={styles.leftColumn}>
        {/* 主要頭像 */}
        <Image 
          source={typeof avatar === 'string' ? { uri: avatar } : avatar} 
          style={styles.avatarLarge} 
        />
        
        {/* 連接線 (flex: 1 自動填滿高度) */}
        {/* <View style={styles.verticalLine} /> */}
        
      </View>

      {/* --- 右側區域：內容 --- */}
      <View style={styles.rightColumn}>
        {/* 2. 新增：老師評語區塊 (只有當 TeacherName 有值時才顯示) */}
        {TeacherName && (
          <View style={styles.reactionContainer}>
            {/* 這裡使用 coin icon */}
            <Image source={require('@/assets/icons/coin.png')} style={styles.reactionIcon} resizeMode="contain" />
            <Text style={styles.reactionText}>{TeacherName}老師覺得很棒ㄛ!</Text>
          </View>
        )}
        {/* Header: 名字 @Handle 時間 */}
        <View style={styles.headerRow}>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userHandle}>{handle}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.time}>{time}</Text>
          <Ionicons name="chevron-down" size={16} color="#999" style={styles.moreIcon} />
        </View>

        {/* 內文 */}
        <Text style={styles.content}>
          {content}
        </Text>

        {/* 圖片展示區 */}
        {images && images.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((imgUri, index) => (
                <Image key={index} source={{ uri: imgUri }} style={styles.postImage} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 互動按鈕 */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={18} color="#666" />
            <Text style={styles.actionText}>{commentsCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 連結 */}
        <TouchableOpacity onPress={onPressThread} style={styles.threadLinkContainer}>
          <Text style={styles.threadLinkText}>查看這個留言串</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1, // 選用：分隔線
    borderBottomColor: '#f0f0f0',
  },
  // 左側
  leftColumn: {
    alignItems: 'center',
    marginRight: 12,
    width: 48,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  verticalLine: {
    width: 2,
    backgroundColor: '#cfd8dc', // 灰色連接線
    flex: 1,                    // 關鍵：撐開高度
    marginVertical: 4,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  // 右側
  rightColumn: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  userHandle: {
    color: '#666',
    fontSize: 14,
    marginLeft: 6,
  },
  dot: {
    color: '#666',
    marginHorizontal: 4,
  },
  time: {
    color: '#666',
    fontSize: 14,
  },
  moreIcon: {
    marginLeft: 'auto',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#14171a',
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 10,
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  threadLinkContainer: {
    marginTop: 2,
  },
  threadLinkText: {
    color: '#4da6ff', // 圖片中的藍色
    fontSize: 15,
    fontWeight: '500',
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // 與下方名字保持一點距離
  },
  reactionIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
    resizeMode: 'contain',
  },
  reactionText: {
    fontSize: 14,
    fontWeight: 'bold', // 粗體
    color: '#374151',   // 深灰偏藍的顏色
  },
});

export default ThreadPost;