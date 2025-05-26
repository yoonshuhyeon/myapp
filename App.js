import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';       // 지금 주신 화면
import QRScreen from './QRScreen';           // QR 조회 화면
import NutritionScreen from './NutritionScreen'; // 영양/알레르기 정보 화면

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QR" component={QRScreen} />
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
