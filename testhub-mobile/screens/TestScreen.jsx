import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

export default function TestsScreen({ navigation }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests');
      setTests(res.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTests();
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      // 🌟 FIX: 'Tests' ki jagah 'TestScreen' kar diya hai
      // 🌟 yha nav krte smye tack test nhi aa rha tha 
      onPress={() => navigation.navigate('TestsScreen', { testId: item.id })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Icon name="time-outline" size={14} color="#f97316" />
          <Text style={styles.statText}>{item.duration} min</Text>
        </View>
        <View style={styles.statBox}>
          <Icon name="help-circle-outline" size={14} color="#f97316" />
          <Text style={styles.statText}>{item.total_questions || 0} Q</Text>
        </View>
        <Text style={[styles.priceText, { color: item.is_free ? '#4ade80' : '#3b82f6' }]}>
          {item.is_free ? 'FREE' : `₹${item.price}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>All Tests</Text>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tests..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredTests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-outline" size={50} color="#333" />
            <Text style={styles.emptyText}>No tests found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingHorizontal: 15, paddingTop: 10 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 15, marginTop: 10 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: 'white', fontSize: 16 },
  
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  cardDesc: { color: '#9ca3af', fontSize: 13, marginBottom: 12, lineHeight: 20 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2a2a2a' },
  statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statText: { color: '#e5e7eb', fontSize: 13, marginLeft: 5, fontWeight: '600' },
  priceText: { fontSize: 16, fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 10 }
});