import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  // Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');

  // 🌟 Dummy Data for Home Page
  const quickLinks = [
    { id: 1, name: 'Daily Quiz', icon: 'bulb', color: '#eab308' },
    { id: 2, name: 'PYQ Papers', icon: 'document-text', color: '#3b82f6' },
    { id: 3, name: 'Syllabus', icon: 'book', color: '#a855f7' },
    { id: 4, name: 'Updates', icon: 'notifications', color: '#ef4444' },
  ];

  const popularExams = [
    { id: 'ras-pre', name: 'RPSC RAS', fullName: 'Rajasthan Administrative Service', students: '50k+' },
    { id: 'ssc-cgl', name: 'SSC CGL', fullName: 'Combined Graduate Level', students: '100k+' },
    { id: 'rrb-ntpc', name: 'RRB NTPC', fullName: 'Railway Recruitment Board', students: '80k+' },
  ];

  const upcomingTests = [
    { id: 101, title: 'RAS Pre Full Mock Test 1', duration: 180, questions: 150, free: true },
    { id: 102, title: 'SSC CGL Tier 1 Mini Mock', duration: 60, questions: 100, free: false, price: 49 },
  ];

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Aspirant 👋</Text>
          <Text style={styles.subGreeting}>Let's crack your dream exam!</Text>
        </View>
        <TouchableOpacity style={styles.profileIcon}>
          <Icon name="person" size={20} color="#f97316" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ================= SEARCH BAR ================= */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for exams, tests, or subjects..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ================= PROMO BANNER ================= */}
        <TouchableOpacity style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerBadge}>NEW</Text>
            <Text style={styles.bannerTitle}>All India Live Mock Test</Text>
            <Text style={styles.bannerSub}>Attempt now and check your All India Rank!</Text>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Attempt Now</Text>
              <Icon name="arrow-forward" size={16} color="white" />
            </View>
          </View>
          <Icon name="trophy" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
        </TouchableOpacity>

        {/* ================= QUICK LINKS ================= */}
        <View style={styles.quickLinksContainer}>
          {quickLinks.map((link) => (
            <TouchableOpacity key={link.id} style={styles.quickLinkItem}>
              <View style={[styles.quickLinkIconBg, { backgroundColor: `${link.color}20` }]}>
                <Icon name={link.icon} size={24} color={link.color} />
              </View>
              <Text style={styles.quickLinkText}>{link.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= POPULAR EXAMS ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Exams</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Exams')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {popularExams.map((exam) => (
            <TouchableOpacity 
              key={exam.id} 
              style={styles.examCard}
              onPress={() => navigation.navigate('ExamDetail', { examSlug: exam.id })}
            >
              <View style={styles.examCardTop}>
                <Text style={styles.examCardTitle}>{exam.name}</Text>
                <Icon name="chevron-forward" size={16} color="#aaa" />
              </View>
              <Text style={styles.examCardSub} numberOfLines={1}>{exam.fullName}</Text>
              <View style={styles.examCardBottom}>
                <Icon name="people" size={14} color="#666" />
                <Text style={styles.examCardStudents}>{exam.students} Aspirants</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ================= RECOMMENDED TESTS ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Tests</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tests')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testList}>
          {upcomingTests.map((test) => (
            <TouchableOpacity 
              key={test.id} 
              style={styles.testCard}
              onPress={() => navigation.navigate('TestScreen', { testId: test.id })}
            >
              <View style={styles.testIconBg}>
                <Icon name="document-text" size={24} color="#f97316" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testTitle} numberOfLines={1}>{test.title}</Text>
                <View style={styles.testDetails}>
                  <Text style={styles.testDetailText}>{test.questions} Qs</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={styles.testDetailText}>{test.duration} mins</Text>
                </View>
              </View>
              <View style={styles.testPriceBadge}>
                <Text style={[styles.testPrice, { color: test.free ? '#4ade80' : '#f97316' }]}>
                  {test.free ? 'FREE' : `₹${test.price}`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 60 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15, marginTop: 10 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  subGreeting: { fontSize: 14, color: '#aaa', marginTop: 4 },
  profileIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(249, 115, 22, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.3)' },
  
  scrollContent: { paddingBottom: 20 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: 'white', fontSize: 15 },
  
  bannerContainer: { backgroundColor: '#f97316', marginHorizontal: 20, borderRadius: 16, padding: 20, flexDirection: 'row', overflow: 'hidden', elevation: 5, marginBottom: 25 },
  bannerContent: { flex: 1, zIndex: 2 },
  bannerBadge: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontSize: 10, fontWeight: 'bold', color: '#f97316', marginBottom: 8 },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 15 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  bannerBtnText: { color: 'white', fontWeight: 'bold', marginRight: 5, fontSize: 13 },
  bannerIcon: { position: 'absolute', right: -15, bottom: -15, zIndex: 1, transform: [{ rotate: '-15deg' }] },
  
  quickLinksContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  quickLinkItem: { alignItems: 'center', width: (width - 40) / 4 },
  quickLinkIconBg: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickLinkText: { color: '#e5e7eb', fontSize: 12, fontWeight: '500' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  seeAllText: { color: '#f97316', fontSize: 14, fontWeight: '600' },
  
  horizontalScroll: { paddingLeft: 20, marginBottom: 25 },
  examCard: { backgroundColor: '#1a1a1a', width: width * 0.6, padding: 15, borderRadius: 16, marginRight: 15, borderWidth: 1, borderColor: '#333' },
  examCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  examCardTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  examCardSub: { fontSize: 13, color: '#aaa', marginBottom: 15 },
  examCardBottom: { flexDirection: 'row', alignItems: 'center' },
  examCardStudents: { fontSize: 12, color: '#888', marginLeft: 5 },
  
  testList: { paddingHorizontal: 20 },
  testCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  testIconBg: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(249, 115, 22, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  testInfo: { flex: 1 },
  testTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  testDetails: { flexDirection: 'row', alignItems: 'center' },
  testDetailText: { fontSize: 13, color: '#aaa' },
  dotSeparator: { color: '#666', marginHorizontal: 6, fontSize: 16 },
  testPriceBadge: { justifyContent: 'center', alignItems: 'flex-end', paddingLeft: 10 },
  testPrice: { fontSize: 15, fontWeight: 'bold' }
});