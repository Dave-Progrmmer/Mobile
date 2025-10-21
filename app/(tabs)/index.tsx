// app/(tabs)/index.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { announcementsAPI, eventsAPI, sermonsAPI } from '../../services/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [latestSermon, setLatestSermon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [announcementsData, eventsData, sermonsData] = await Promise.all([
        announcementsAPI.getAll().catch(() => []),
        eventsAPI.getAll().catch(() => []),
        sermonsAPI.getAll().catch(() => []),
      ]);

      setAnnouncements(Array.isArray(announcementsData) ? announcementsData.slice(0, 3) : []);
      setUpcomingEvents(Array.isArray(eventsData) ? eventsData.slice(0, 3) : []);
      setLatestSermon(Array.isArray(sermonsData) && sermonsData.length > 0 ? sermonsData[0] : null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Member'}!</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/prayers')}
          >
            <Ionicons name="heart" size={32} color="#6366f1" />
            <Text style={styles.actionText}>Prayers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/events')}
          >
            <Ionicons name="calendar" size={32} color="#6366f1" />
            <Text style={styles.actionText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/quizzes')}
          >
            <Ionicons name="school" size={32} color="#6366f1" />
            <Text style={styles.actionText}>Quizzes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <TouchableOpacity onPress={() => router.push('/announcements')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {announcements.length > 0 ? (
          announcements.map((announcement: any) => (
            <View key={announcement._id} style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementContent} numberOfLines={2}>
                {announcement.content}
              </Text>
              <Text style={styles.announcementDate}>
                {new Date(announcement.createdAt || announcement.date).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No announcements yet</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event: any) => (
            <View key={event._id} style={styles.eventCard}>
              <View style={styles.eventIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#6366f1" />
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.startAt).toLocaleDateString()}
                </Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No upcoming events</Text>
        )}
      </View>

      {latestSermon && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Sermon</Text>
          <View style={styles.sermonCard}>
            <Text style={styles.sermonTitle}>{latestSermon.title}</Text>
            <Text style={styles.sermonPreacher}>By {latestSermon.speaker}</Text>
            <Text style={styles.sermonDate}>
              {new Date(latestSermon.publishedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
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
  welcomeSection: {
    backgroundColor: '#6366f1',
    padding: 24,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  announcementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  announcementContent: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sermonCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sermonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sermonPreacher: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 4,
  },
  sermonDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    padding: 16,
  },
});