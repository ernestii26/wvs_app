import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface NotificationDialogProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  confirmText?: string;
  closeText?: string;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  showConfirmButton = true,
  confirmText = '確認',
  closeText = '關閉',
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          {/* 標題 (可選) */}
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}

          {/* 訊息內容 */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* 按鈕區域 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>{closeText}</Text>
            </TouchableOpacity>

            {showConfirmButton && (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#E8F4F8',
    borderRadius: 16,
    padding: 24,
    width: Dimensions.get('window').width - 80,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    minHeight: 80,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#A8D8EA',
    borderWidth: 1,
    borderColor: '#7AB8CC',
  },
  confirmButton: {
    backgroundColor: '#A8D8EA',
    borderWidth: 1,
    borderColor: '#7AB8CC',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationDialog;
