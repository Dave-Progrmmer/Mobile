// app/(tabs)/events.tsx
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventsAPI } from '../../services/api';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await eventsAPI.getAll();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderEvent = ({ item }: { item: any }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Ionicons name="calendar" size={24} color="#6366f1" />
        </View>
        <View style={styles.eventHeaderText}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {item.approved !== undefined && (
            <Text style={[styles.eventStatus, { color: item.approved ? '#10b981' : '#f59e0b' }]}>
              {item.approved ? 'Approved' : 'Pending Approval'}
            </Text>
          )}
        </View>
      </View>

      {item.description && (
        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.eventInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {new Date(item.startAt).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        {item.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
        )}
        {item.createdBy && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>By {item.createdBy.name || 'Admin'}</Text>
          </View>
        )}
      </View>
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
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadEvents} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No events available</Text>
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
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventHeaderText: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
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