import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, Button, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function QRScreen({ navigation }) {
  const [grade, setGrade] = useState('');
  const [classNum, setClassNum] = useState('');
  const [studentNum, setStudentNum] = useState('');
  const [name, setName] = useState('');
  const [qrUri, setQrUri] = useState(null);

  const SERVER_IP = '192.168.45.111';  // 본인 서버 IP
  const SERVER_PORT = '5001';

  const fetchQRCode = async () => {
    if (!grade || !classNum || !studentNum || !name) {
      Alert.alert('입력 오류', '학년, 반, 번호, 이름을 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://${SERVER_IP}:${SERVER_PORT}/generate_qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          class_num: classNum,
          student_num: studentNum,
          name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.qr_code_path) {
        setQrUri(`http://${SERVER_IP}:${SERVER_PORT}/qr_codes/${data.qr_code_path}`);
      } else if (response.status === 404) {
        Alert.alert('안내', '해당 학생의 QR 코드가 존재하지 않습니다.');
        setQrUri(null);
      } else {
        Alert.alert('오류', data.error || 'QR 코드를 불러오지 못했습니다.');
        setQrUri(null);
      }
    } catch (error) {
      Alert.alert('오류', '서버에 연결할 수 없습니다.');
      setQrUri(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* < 버튼 클릭 시 HomeScreen으로 이동 */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>학생 QR 코드 조회</Text>

      <TextInput
        placeholder="학년"
        keyboardType="numeric"
        value={grade}
        onChangeText={setGrade}
        style={styles.input}
      />
      <TextInput
        placeholder="반"
        keyboardType="numeric"
        value={classNum}
        onChangeText={setClassNum}
        style={styles.input}
      />
      <TextInput
        placeholder="번호"
        keyboardType="numeric"
        value={studentNum}
        onChangeText={setStudentNum}
        style={styles.input}
      />
      <TextInput
        placeholder="이름"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Button title="QR 코드 불러오기" onPress={fetchQRCode} />

      {qrUri && (
        <Image source={{ uri: qrUri }} style={styles.qrImage} resizeMode="contain" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
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
  title: {
    top: 10,
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
    alignSelf: 'center',
  },
  qrImage: {
    marginTop: 20,
    width: 250,
    height: 250,
    alignSelf: 'center',
  },
});
