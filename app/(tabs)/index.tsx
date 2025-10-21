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
  const [latestSermon, setLatestSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [announcementsData, eventsData, sermonsData] = await Promise.all([
        announcementsAPI.getAll(),
        eventsAPI.getAll(),
        sermonsAPI.getAll(),
      ]);

      setAnnouncements(announcementsData.announcements.slice(0, 3));
      setUpcomingEvents(eventsData.events.slice(0, 3));
      setLatestSermon(sermonsData.sermons[0]);
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
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'Member'}!</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/prayers')}
          >
            <Ionicons name="heart" size={32} color="#6366f1" />
            <Text style={styles.actionText}>Prayers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/events')}
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

      {/* Announcements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <TouchableOpacity onPress={() => router.push('/announcements')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {announcements.map((announcement: any) => (
          <View key={announcement._id} style={styles.announcementCard}>
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementContent} numberOfLines={2}>
              {announcement.content}
            </Text>
            <Text style={styles.announcementDate}>
              {new Date(announcement.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/events')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {upcomingEvents.map((event: any) => (
          <TouchableOpacity
            key={event._id}
            style={styles.eventCard}
            onPress={() => router.push(`/events/${event._id}`)}
          >
            <View style={styles.eventIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#6366f1" />
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>
                {new Date(event.date).toLocaleDateString()}
              </Text>
              <Text style={styles.eventLocation}>{event.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Latest Sermon */}
      {latestSermon && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Sermon</Text>
          <TouchableOpacity
            style={styles.sermonCard}
            onPress={() => router.push(`/sermons/${latestSermon._id}`)}
          >
            <Text style={styles.sermonTitle}>{latestSermon.title}</Text>
            <Text style={styles.sermonPreacher}>By {latestSermon.preacher}</Text>
            <Text style={styles.sermonDate}>
              {new Date(latestSermon.date).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
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
});