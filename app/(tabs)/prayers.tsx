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
  Switch,
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async () => {
    try {
      const data = await prayersAPI.getAll();
      setPrayers(data.prayers);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load prayer requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePray = async (prayerId: string) => {
    try {
      await prayersAPI.addPrayer(prayerId);
      Alert.alert('Success', 'You prayed for this request');
      loadPrayers();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add prayer');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await prayersAPI.create({ title, description, isAnonymous });
      Alert.alert('Success', 'Prayer request submitted');
      setModalVisible(false);
      setTitle('');
      setDescription('');
      setIsAnonymous(false);
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
        <Text style={styles.prayerTitle}>{item.title}</Text>
        <View style={styles.prayerBadge}>
          <Text style={styles.prayerBadgeText}>
            {item.status || 'Pending'}
          </Text>
        </View>
      </View>

      <Text style={styles.prayerDescription}>{item.description}</Text>

      <View style={styles.prayerFooter}>
        <Text style={styles.prayerAuthor}>
          By {item.isAnonymous ? 'Anonymous' : item.author?.name || 'Unknown'}
        </Text>
        <View style={styles.prayerStats}>
          <Ionicons name="heart" size={16} color="#ef4444" />
          <Text style={styles.prayerCount}>{item.prayerCount || 0} prayers</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.prayButton}
        onPress={() => handlePray(item._id)}
      >
        <Ionicons name="heart-outline" size={20} color="#6366f1" />
        <Text style={styles.prayButtonText}>Pray for this</Text>
      </TouchableOpacity>
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
              placeholder="Request Title"
              value={title}
              onChangeText={setTitle}
              editable={!submitting}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your prayer request..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submitting}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Submit Anonymously</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                disabled={submitting}
              />
            </View>

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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  prayerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  prayerBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  prayerBadgeText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  prayerDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  prayerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerAuthor: {
    fontSize: 12,
    color: '#9ca3af',
  },
  prayerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prayerCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  prayButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
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
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
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