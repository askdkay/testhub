import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

// Icon mapping for exams (same as website)
const iconMap = {
  FaLandmark: '🏛️',
  FaUniversity: '🏫',
  FaTrain: '🚂',
  FaShieldAlt: '🛡️',
  FaChalkboardTeacher: '👨‍🏫',
  FaFlask: '🧪',
  FaGavel: '⚖️',
  FaLeaf: '🍃',
  FaMapMarkedAlt: '🗺️',
  FaCity: '🏙️',
  FaTree: '🌳',
};

export default function ExamsScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories from API...');
      const res = await api.get('/exams/categories');
      console.log('Categories fetched:', res.data.length);
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryIcon = (iconName) => {
    return iconMap[iconName] || '📚';
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(cat => {
    if (!searchTerm) return true;
    const matchesCategory = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = (cat.exams || []).some(exam =>
      exam.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesCategory || matchesExam;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: '#aaa', marginTop: 10 }}>Loading exams...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Search Bar */}
      <View style={{ padding: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 15 }}>
          <Icon name="search" size={20} color="#aaa" />
          <TextInput
            style={{ flex: 1, padding: 12, color: 'white' }}
            placeholder="Search exams by name or category..."
            placeholderTextColor="#666"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm !== '' && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Icon name="close" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories List */}
      <ScrollView
        contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
      >
        {filteredCategories.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Icon name="search-outline" size={50} color="#444" />
            <Text style={{ color: '#666', marginTop: 10, textAlign: 'center' }}>
              No exams found for "{searchTerm}"
            </Text>
          </View>
        ) : (
          filteredCategories.map((category, index) => (
            <View
              key={category.id}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 16,
                marginBottom: 15,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#333',
              }}
            >
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => toggleCategory(category.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  backgroundColor: '#222',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 28, marginRight: 12 }}>
                    {getCategoryIcon(category.icon)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                      {category.name}
                    </Text>
                    <Text style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>
                      {category.exams?.length || 0} exams
                    </Text>
                  </View>
                </View>
                <Icon
                  name={expandedCategories.includes(category.id) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#f97316"
                />
              </TouchableOpacity>

              {/* Exams List (Expanded) */}
              {expandedCategories.includes(category.id) && (
                <View style={{ padding: 12 }}>
                  {(category.exams || []).map((exam) => (
                    // In the exam item TouchableOpacity, change navigation:

                    <TouchableOpacity
                      key={exam.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        backgroundColor: '#2a2a2a',
                        borderRadius: 10,
                        marginBottom: 8,
                      }}
                      onPress={() => {
                        // ✅ Navigate to ExamDetail screen (which is in MainStack)
                        navigation.navigate('ExamDetail', {
                          examId: exam.id,
                          examSlug: exam.slug
                        });
                      }}
                    >
                      <Icon name="document-text-outline" size={20} color="#f97316" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: 'white', fontWeight: '500' }}>{exam.name}</Text>
                        {exam.short_name && (
                          <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{exam.short_name}</Text>
                        )}
                      </View>
                      <Icon name="chevron-forward" size={18} color="#666" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}