import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const [mealLoading, setMealLoading] = useState(true);
  const [mealData, setMealData] = useState({ lunch: '', dinner: '' });

  const SERVER_IP = '192.168.45.111'; // 본인 서버 IP로 변경
  const SERVER_PORT = '5001';

  // 급식 문자열 정리 함수
  const formatMealText = (text) => {
    if (!text) return '';
    let formatted = text.replace(/<br\s*\/?>/gi, '\n');
    formatted = formatted.replace(/\s*(\(\d+\))/g, '$1');
    return formatted.trim();
  };

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        setMealLoading(true);
        const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/meal`);
        if (response.ok) {
          const data = await response.json();
          setMealData({
            lunch: formatMealText(data.lunch) || '정보 없음',
            dinner: formatMealText(data.dinner) || '정보 없음',
          });
        } else {
          setMealData({ lunch: '정보 없음', dinner: '정보 없음' });
        }
      } catch (error) {
        setMealData({ lunch: '불러오기 실패', dinner: '불러오기 실패' });
      } finally {
        setMealLoading(false);
      }
    };

    fetchMealData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mealBox}>
        <Text style={styles.mealTitle}>오늘의 점심</Text>
        {mealLoading ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : (
          <ScrollView style={styles.mealScroll}>
            <Text style={styles.mealText}>{mealData.lunch}</Text>
          </ScrollView>
        )}

        <Text style={[styles.mealTitle, { marginTop: 20 }]}>오늘의 석식</Text>
        {mealLoading ? (
          <ActivityIndicator size="small" color="#2196F3" />
        ) : (
          <ScrollView style={styles.mealScroll}>
            <Text style={styles.mealText}>{mealData.dinner}</Text>
          </ScrollView>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate('QR')}
          accessibilityLabel="QR 조회하기 버튼"
        >
          <Text style={styles.qrButtonText}>QR 조회하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nutritionButton}
          onPress={() => navigation.navigate('Nutrition')}
          accessibilityLabel="영양 및 알레르기 정보 버튼"
        >
          <Text style={styles.nutritionButtonText}>영양/알레르기 정보</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  mealBox: {
    backgroundColor: '#e6f2ff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 60,
    padding: 15,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a66c2',
  },
  mealText: {
    fontSize: 16,
    marginTop: 5,
    color: '#333',
  },
  mealScroll: {
    maxHeight: 150,
    marginTop: 5,
    flexGrow: 0,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginHorizontal: 15,
  },
  qrButton: {
    backgroundColor: '#0a66c2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
    width: 150,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
    textAlign: 'center',
  },
  nutritionButton: {
    backgroundColor: '#3d85c6',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
    width: 150,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
    textAlign: 'center',
  },
});
