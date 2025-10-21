// app/(tabs)/prayers.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { prayersAPI } from '../../services/api';

export default function PrayersScreen() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [fromName, setFromName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async () => {
    try {
      const data = await prayersAPI.getAll();
      setPrayers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      // If user is not admin, try to get own prayers
      try {
        const myPrayers = await prayersAPI.getMyPrayers();
        setPrayers(Array.isArray(myPrayers) ? myPrayers : []);
      } catch (err) {
        console.error('Error loading prayers:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!message) {
      Alert.alert('Error', 'Please enter your prayer request');
      return;
    }

    setSubmitting(true);
    try {
      await prayersAPI.create({ 
        message, 
        fromName: fromName || 'Anonymous' 
      });
      Alert.alert('Success', 'Prayer request submitted');
      setModalVisible(false);
      setMessage('');
      setFromName('');
      loadPrayers();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPrayer = ({ item }: { item: any }) => (
    <View style={styles.prayerCard}>
      <View style={styles.prayerHeader}>
        <View style={styles.prayerHeaderLeft}>
          <Ionicons 
            name={item.answered ? 'checkmark-circle' : 'heart'} 
            size={24} 
            color={item.answered ? '#10b981' : '#6366f1'} 
          />
          <Text style={styles.prayerAuthor}>
            {item.fromName || 'Anonymous'}
          </Text>
        </View>
        {item.answered && (
          <View style={styles.answeredBadge}>
            <Text style={styles.answeredText}>Answered</Text>
          </View>
        )}
      </View>

      <Text style={styles.prayerMessage}>{item.message}</Text>

      <Text style={styles.prayerDate}>
        {new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={prayers}
        renderItem={renderPrayer}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPrayers} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No prayer requests yet</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Prayer Request</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Your Name (Optional)"
              value={fromName}
              onChangeText={setFromName}
              editable={!submitting}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your prayer request..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!submitting}
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  prayerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  answeredBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  answeredText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  prayerMessage: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  prayerDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});