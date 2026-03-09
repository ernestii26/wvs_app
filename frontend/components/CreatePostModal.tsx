import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; content: string; images: string[] }) => void;
}

const CATEGORIES = ['閱讀心得', '習慣打卡'];

const CreatePostModal = ({ visible, onClose, onSubmit }: CreatePostModalProps) => {
  const [category, setCategory] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]); 
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const pickImage = async () => {
    // 請求權限，
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相簿權限才能上傳圖片！');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = () => {
    if (!category) {
      alert('請選擇分類');
      return;
    }
    onSubmit({ category, content, images });
    setContent('');
    setCategory('');
    setImages([]);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => {
        if (isKeyboardVisible) {
          Keyboard.dismiss();
        } else {
          onClose();
        }
      }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              
              {/* Category Selector */}
              <View style={styles.categoryContainer}>
                <TouchableOpacity 
                  style={styles.categoryButton}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Text style={[styles.categoryText, !category && styles.placeholderText]}>
                    {category || '今天要發什麼呢？'}
                  </Text>
                  <Ionicons 
                    name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <View style={styles.dropdown}>
                    {CATEGORIES.map((item, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.dropdownItem}
                        onPress={() => {
                          setCategory(item);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Text Input */}
              <TextInput
                style={styles.input}
                multiline
                placeholder="分享你的想法..."
                placeholderTextColor="#999"
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />

              {/* Image Section */}
              <View style={styles.imageSection}>
                <TouchableOpacity style={styles.imageIconBtn} onPress={pickImage}>
                   <Ionicons name="image-outline" size={24} color="#4FD1C5" />
                </TouchableOpacity>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <TouchableOpacity 
                            style={styles.removeImageBtn} 
                            onPress={() => removeImage(index)}
                        >
                            <Ionicons name="close-circle" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                  ))}
                  {/* Add Image Placeholder */}
                  <TouchableOpacity style={[styles.imagePlaceholder, styles.addImageBtn]} onPress={pickImage}>
                    <Ionicons name="add" size={20} color="#ccc" />
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Submit Button (Optional based on design, but needed for functionality) */}
              <View style={styles.footer}>
                  <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                      <Text style={styles.submitButtonText}>發布</Text>
                  </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0F2F1', // Light cyan border
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryContainer: {
    zIndex: 10, // Ensure dropdown appears on top
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4FD1C5', // Cyan border
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF8E1', // Light yellow background from design
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#4FD1C5',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2F1',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#555',
  },
  input: {
    height: 150,
    borderWidth: 1,
    borderColor: '#4FD1C5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  imageSection: {
    flexDirection: 'column',
    gap: 8,
  },
  imageIconBtn: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  imageList: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 60,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 8,
  },
  addImageBtn: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  footer: {
      marginTop: 16,
      alignItems: 'flex-end',
  },
  submitButton: {
      backgroundColor: '#4FD1C5',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
  },
  submitButtonText: {
      color: 'white',
      fontWeight: 'bold',
  }
});

export default CreatePostModal;
