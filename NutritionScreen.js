import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, ScrollView, StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native';

export default function NutritionScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState({
    ORPLC_INFO: '',
    CAL_INFO: '',
    NTR_INFO: '',
    allergyInfo: '',
  });

  const SERVER_IP = '192.168.45.111'; // 서버 IP 확인 필요
  const SERVER_PORT = '5001';

  const formatMealText = (text) => {
    if (!text) return '정보 없음';
    return text.replace(/<br\s*\/?>/gi, '\n').trim();
  };

  const allergyMap = {
    1: '난류(계란)',
    2: '우유',
    3: '메밀',
    4: '땅콩',
    5: '대두(콩)',
    6: '밀',
    7: '고등어',
    8: '게',
    9: '새우',
    10: '돼지고기',
    11: '복숭아',
    12: '토마토',
    13: '아황산류',
    14: '호두',
    15: '닭고기',
    16: '쇠고기',
    17: '오징어',
    18: '조개류(굴,전복,홍합 포함)',
  };

  const extractAllergyCodesFromText = (text) => {
    if (!text) return [];
    const regex = /\(([\d.,\s]+)\)/g;
    let match;
    const codesSet = new Set();

    while ((match = regex.exec(text)) !== null) {
      match[1].split(/[.,\s]+/).forEach(code => {
        const trimmed = code.trim();
        if (trimmed && !isNaN(trimmed)) {
          codesSet.add(trimmed);
        }
      });
    }
    return Array.from(codesSet);
  };

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/nutrition`);
        if (response.ok) {
          const data = await response.json();

          const orplc_info = formatMealText(data.ORPLC_INFO);
          const cal_info = formatMealText(data.CAL_INFO);
          const ntr_info = formatMealText(data.NTR_INFO);

          const allCodes = extractAllergyCodesFromText(data.menu_names || '');

          const allergyNames = allCodes.length > 0
            ? allCodes.map(code => allergyMap[code] || `알 수 없음(${code})`).join(', ')
            : '정보 없음';

          setNutritionData({
            ORPLC_INFO: orplc_info,
            CAL_INFO: cal_info,
            NTR_INFO: ntr_info,
            allergyInfo: allergyNames,
          });
        } else {
          setNutritionData({
            ORPLC_INFO: '정보 없음',
            CAL_INFO: '정보 없음',
            NTR_INFO: '정보 없음',
            allergyInfo: '정보 없음',
          });
        }
      } catch (e) {
        setNutritionData({
          ORPLC_INFO: '불러오기 실패',
          CAL_INFO: '불러오기 실패',
          NTR_INFO: '불러오기 실패',
          allergyInfo: '불러오기 실패',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNutrition();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="뒤로가기 버튼">
        <Text style={styles.backButtonText}>{'<'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>기타 급식 정보</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : (
        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>원산지 정보</Text>
            <Text style={styles.content}>{nutritionData.ORPLC_INFO}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>칼로리 정보</Text>
            <Text style={styles.content}>{nutritionData.CAL_INFO}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>영양 정보</Text>
            <Text style={styles.content}>{nutritionData.NTR_INFO}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘의 알레르기 정보</Text>
            <Text style={styles.content}>{nutritionData.allergyInfo}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  content: { fontSize: 16, color: '#333' },
});
