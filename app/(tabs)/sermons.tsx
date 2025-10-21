// app/(tabs)/sermons.tsx
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sermonsAPI } from '../../services/api';

export default function SermonsScreen() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSermons();
  }, []);

  const loadSermons = async () => {
    try {
      const data = await sermonsAPI.getAll();
      setSermons(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load sermons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openMedia = (url: string, type: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', `Unable to open ${type}`);
      });
    } else {
      Alert.alert('Not Available', `${type} not available for this sermon`);
    }
  };

  const renderSermon = ({ item }: { item: any }) => (
    <View style={styles.sermonCard}>
      <View style={styles.sermonHeader}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={item.mediaType === 'video' ? 'play-circle' : 'musical-notes'} 
            size={24} 
            color="#6366f1" 
          />
        </View>
        <View style={styles.sermonHeaderText}>
          <Text style={styles.sermonTitle}>{item.title}</Text>
          {item.speaker && (
            <Text style={styles.sermonPreacher}>By {item.speaker}</Text>
          )}
          <Text style={styles.sermonDate}>
            {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.sermonNotes} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      {item.mediaUrl && (
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => openMedia(item.mediaUrl, item.mediaType === 'video' ? 'Video' : 'Audio')}
        >
          <Ionicons 
            name={item.mediaType === 'video' ? 'play-circle' : 'musical-notes'} 
            size={20} 
            color="#6366f1" 
          />
          <Text style={styles.mediaButtonText}>
            {item.mediaType === 'video' ? 'Watch Video' : 'Listen Audio'}
          </Text>
        </TouchableOpacity>
      )}
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
        data={sermons}
        renderItem={renderSermon}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadSermons} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No sermons available</Text>
          </View>
        }
      />
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
  },
  sermonCard: {
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
  sermonHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sermonHeaderText: {
    flex: 1,
  },
  sermonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sermonPreacher: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 2,
  },
  sermonDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sermonNotes: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  mediaButtonText: {
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
});