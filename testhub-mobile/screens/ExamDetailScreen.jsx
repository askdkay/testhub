import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function ExamDetailScreen({ route, navigation }) {
  // 🌟 FIX 1: Hum slug aur examSlug dono check kar rahe hain taaki error na aaye
  const { slug, examSlug } = route.params || {}; 
  const currentSlug = slug || examSlug;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (currentSlug) {
      fetchExamDetails();
    }
  }, [currentSlug]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      // 🌟 FIX 2: Exact wahi API endpoint jo aapke Web version mein tha
      const res = await api.get(`/examDetails/exam/${currentSlug}`);
      
      //console.log("Backend Data Check:", res.data); // Terminal mein check karne ke liye
      setExam(res.data);
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (baaki ka poora parseJSON aur UI ka code waisa hi rahega)

  const parseJSON = (data) => {
    if (!data) return {};
    try {
      return typeof data === 'object' ? data : JSON.parse(data);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="document-text-outline" size={50} color="#333" />
        <Text style={{ color: 'white', marginTop: 10, fontSize: 18 }}>Exam not found</Text>
      </View>
    );
  }

  // Parse ALL JSON fields from backend
  const about = parseJSON(exam.about_exam);
  const eligibility = parseJSON(exam.eligibility_criteria);
  const age = parseJSON(exam.age_limit);
  const education = parseJSON(exam.education_qualification);
  const pattern = parseJSON(exam.exam_pattern);
  const syllabus = parseJSON(exam.detailed_syllabus);
  const application = parseJSON(exam.application_process);
  const dates = parseJSON(exam.key_dates_format);
  const salary = parseJSON(exam.salary_and_perks);

  // 100% matched with Web Tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'information-circle-outline' },
    { id: 'syllabus', name: 'Syllabus & Pattern', icon: 'book-outline' },
    { id: 'tests', name: 'Test Series', icon: 'trophy-outline' },
    { id: 'material', name: 'Study Material', icon: 'document-text-outline' }
  ];

  return (
    <View style={styles.container}>
      {/* ================= HERO SECTION ================= */}
      <View style={styles.header}>
        <Text style={styles.title}>{exam.exam_title ? exam.exam_title : exam.exam_name}</Text>
        {exam.exam_full_form ? <Text style={styles.subtitle}>{exam.exam_full_form}</Text> : null}
        
        <View style={styles.tagsContainer}>
          {exam.conducting_body ? (
            <View style={styles.tag}><Text style={styles.tagText}>{exam.conducting_body}</Text></View>
          ) : null}
          {exam.exam_level ? (
            <View style={[styles.tag, {backgroundColor: 'rgba(168, 85, 247, 0.15)'}]}>
              <Text style={[styles.tagText, {color: '#c084fc'}]}>{exam.exam_level}</Text>
            </View>
          ) : null}
          {/* Added Exam Frequency */}
          {exam.exam_frequency ? (
            <View style={[styles.tag, {backgroundColor: 'rgba(34, 197, 94, 0.15)'}]}>
              <Text style={[styles.tagText, {color: '#4ade80'}]}>{exam.exam_frequency}</Text>
            </View>
          ) : null}
        </View>

        {exam.official_website ? (
          <TouchableOpacity 
            style={styles.websiteBtn}
            onPress={() => Linking.openURL(exam.official_website)}
          >
            <Icon name="globe-outline" size={16} color="white" />
            <Text style={styles.websiteBtnText}>Official Website</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ================= TABS ================= */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id ? styles.activeTab : null]}
            >
              <Icon name={tab.icon} size={16} color={activeTab === tab.id ? '#f97316' : '#aaa'} />
              <Text style={[styles.tabText, activeTab === tab.id ? styles.activeTabText : null]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ================= TAB CONTENT ================= */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        
        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' ? (
          <View>
            {about.overview ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>About the Exam</Text>
                <Text style={styles.cardText}>{about.overview}</Text>
                {about.purpose ? <Text style={[styles.cardText, {marginTop: 10}]}>{about.purpose}</Text> : null}
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Eligibility & Qualifications</Text>
              {eligibility.nationality ? (
                <Text style={styles.cardText}><Text style={styles.boldLabel}>Nationality: </Text>{eligibility.nationality}</Text>
              ) : null}
              {education.minimum_qualification ? (
                <Text style={styles.cardText}><Text style={styles.boldLabel}>Education: </Text>{education.minimum_qualification}</Text>
              ) : null}
              {/* Added Eligibility Note */}
              {eligibility.note ? <Text style={styles.noteText}>{eligibility.note}</Text> : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Age Limit</Text>
              {age.minimum_age ? (
                <Text style={styles.cardText}><Text style={styles.boldLabel}>Minimum: </Text>{age.minimum_age} years</Text>
              ) : null}
              {age.maximum_age?.general ? (
                <Text style={styles.cardText}><Text style={styles.boldLabel}>Maximum (Gen): </Text>{age.maximum_age.general} years</Text>
              ) : null}
              {age.maximum_age?.note ? <Text style={styles.noteText}>{age.maximum_age.note}</Text> : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Application Fees</Text>
              {application.application_fee?.general_obc_ews ? (
                <Text style={styles.cardText}><Text style={styles.boldLabel}>Gen/OBC/EWS: </Text>{application.application_fee.general_obc_ews}</Text>
              ) : null}
              {application.application_fee?.sc_st_pwd ? (
                <Text style={styles.cardText}><Text style={styles.boldLabel}>SC/ST/PwD: </Text>{application.application_fee.sc_st_pwd}</Text>
              ) : null}
              {/* Added Application Note */}
              {application.application_fee?.note ? <Text style={styles.noteText}>{application.application_fee.note}</Text> : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Important Dates</Text>
              {dates.notification_release ? <Text style={styles.cardText}><Text style={styles.boldLabel}>Notification: </Text>{dates.notification_release}</Text> : null}
              {dates.application_start ? <Text style={styles.cardText}><Text style={styles.boldLabel}>App Start: </Text>{dates.application_start}</Text> : null}
              {dates.application_last_date ? <Text style={styles.cardText}><Text style={styles.boldLabel}>App Last Date: </Text>{dates.application_last_date}</Text> : null}
              {dates.stage_1_exam ? <Text style={styles.cardText}><Text style={styles.boldLabel}>Prelims Exam: </Text>{dates.stage_1_exam}</Text> : null}
            </View>

            {salary.pay_scale?.basic_pay_starting ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Salary & Perks</Text>
                <Text style={styles.cardText}><Text style={styles.boldLabel}>Starting Basic Pay: </Text>₹{salary.pay_scale.basic_pay_starting}</Text>
                {salary.pay_scale.level ? <Text style={styles.cardText}><Text style={styles.boldLabel}>Pay Level: </Text>{salary.pay_scale.level}</Text> : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* === SYLLABUS & PATTERN TAB === */}
        {activeTab === 'syllabus' ? (
          <View>
            {pattern.stage_1 ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Exam Pattern</Text>
                {/* Added Stage Type */}
                <Text style={{color: '#3b82f6', fontWeight: 'bold', marginBottom: 10}}>Stage 1: {pattern.stage_1.type}</Text>
                <View style={styles.rowBox}>
                  {pattern.stage_1.total_questions ? (
                    <View style={styles.box}><Text style={styles.boxLabel}>Questions</Text><Text style={styles.boxValue}>{pattern.stage_1.total_questions}</Text></View>
                  ) : null}
                  {pattern.stage_1.maximum_marks ? (
                    <View style={styles.box}><Text style={styles.boxLabel}>Marks</Text><Text style={styles.boxValue}>{pattern.stage_1.maximum_marks}</Text></View>
                  ) : null}
                  {pattern.stage_1.duration_minutes ? (
                    <View style={styles.box}><Text style={styles.boxLabel}>Duration</Text><Text style={styles.boxValue}>{pattern.stage_1.duration_minutes}m</Text></View>
                  ) : null}
                </View>
                {/* Added Paper Details Array Mapping */}
                {pattern.stage_1.paper_details && pattern.stage_1.paper_details.length > 0 ? (
                  <View style={{marginTop: 15}}>
                    {pattern.stage_1.paper_details.map((detail, idx) => (
                      <View key={idx} style={styles.detailBox}>
                        <Text style={styles.detailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {syllabus.stage_1?.topics ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Detailed Syllabus</Text>
                {Object.entries(syllabus.stage_1.topics).map(([subject, desc], idx) => (
                  <View key={idx} style={{ marginBottom: 15 }}>
                    <Text style={styles.subjectTitle}>• {subject}</Text>
                    <Text style={styles.cardText}>{desc}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* === TESTS TAB (NEW) === */}
        {activeTab === 'tests' ? (
          <View>
            <Text style={styles.sectionHeading}>Available Test Series</Text>
            {exam.test_series && exam.test_series.length > 0 ? (
              exam.test_series.map((test) => (
                <TouchableOpacity 
                  key={test.id} 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('TestsScreen', { testId: test.id })}
                >
                  <Text style={styles.actionCardTitle}>{test.title}</Text>
                  <View style={styles.actionCardRow}>
                    <Text style={styles.actionCardSub}>{test.total_questions} questions</Text>
                    <Text style={styles.actionCardSub}>{test.duration} min</Text>
                  </View>
                  <Text style={styles.actionCardPrice}>{test.is_free ? 'FREE' : `₹${test.price}`}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No test series available yet.</Text>
            )}
          </View>
        ) : null}

        {/* === MATERIAL TAB (NEW) === */}
        {activeTab === 'material' ? (
          <View>
            <Text style={styles.sectionHeading}>Study Material</Text>
            {exam.study_material && exam.study_material.length > 0 ? (
              exam.study_material.map((material) => (
                <TouchableOpacity 
                  key={material.id} 
                  style={[styles.actionCard, { flexDirection: 'row', alignItems: 'center' }]}
                >
                  <Icon name="document-text" size={24} color="#c084fc" />
                  <View style={{ marginLeft: 15 }}>
                    <Text style={styles.actionCardTitle}>{material.title}</Text>
                    <Text style={styles.actionCardSub}>{material.views ? material.views : '0'} views</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No study material available yet.</Text>
            )}
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  header: { padding: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#aaa', marginTop: 5, fontSize: 16 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, gap: 10 },
  tag: { backgroundColor: 'rgba(249, 115, 22, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#f97316', fontSize: 12, fontWeight: 'bold' },
  websiteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 10, borderRadius: 8, marginTop: 15, alignSelf: 'flex-start' },
  websiteBtnText: { color: 'white', marginLeft: 8, fontSize: 14, fontWeight: '600' },
  
  tabContainer: { backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333' },
  tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#f97316' },
  tabText: { color: '#aaa', marginLeft: 8, fontWeight: '600' },
  activeTabText: { color: '#f97316' },
  
  contentContainer: { padding: 15 },
  card: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  cardText: { color: '#ccc', fontSize: 14, lineHeight: 22, marginBottom: 6 },
  boldLabel: { color: '#888', fontWeight: 'bold' },
  noteText: { color: '#777', fontSize: 12, fontStyle: 'italic', marginTop: 5 },
  subjectTitle: { color: '#f97316', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  
  rowBox: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  box: { backgroundColor: '#222', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  boxLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  boxValue: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  detailBox: { backgroundColor: '#222', padding: 10, borderRadius: 8, marginTop: 8 },
  detailText: { color: '#ccc', fontSize: 13 },

  sectionHeading: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  actionCard: { backgroundColor: '#1a1a1a', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  actionCardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  actionCardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  actionCardSub: { color: '#888', fontSize: 13 },
  actionCardPrice: { color: '#3b82f6', fontSize: 18, fontWeight: 'bold' },
  emptyText: { color: '#777', fontStyle: 'italic', marginTop: 10 }
});