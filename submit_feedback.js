import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function MealFeedback({ mealName, onSubmitFeedback }) {
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleFeedbackSubmit = () => {
    if (!rating || !feedback) {
      Alert.alert('입력 오류', '점수와 피드백을 모두 입력해주세요.');
      return;
    }
    onSubmitFeedback(rating, feedback);
    setRating('');
    setFeedback('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 식단에 대한 평가</Text>

      <Text style={styles.subtitle}>식단: {mealName}</Text>

      {/* 점수 입력 */}
      <TextInput
        style={styles.input}
        placeholder="평점 (1-5)"
        keyboardType="numeric"
        value={rating}
        onChangeText={setRating}
      />

      {/* 피드백 입력 */}
      <TextInput
        style={styles.input}
        placeholder="식단에 대한 피드백을 작성해주세요"
        multiline
        value={feedback}
        onChangeText={setFeedback}
      />

      <Button title="피드백 제출" onPress={handleFeedbackSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 15 },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});
