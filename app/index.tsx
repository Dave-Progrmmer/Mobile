// app/index.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (user && !inTabsGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, loading, segments]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}