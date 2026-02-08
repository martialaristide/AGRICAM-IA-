// AGRICAM IA Mobile - Navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ParcellesScreen from '../screens/ParcellesScreen';
import CapteursScreen from '../screens/CapteursScreen';
import AnalyseIAScreen from '../screens/AnalyseIAScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Parcelles':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Capteurs':
              iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
              break;
            case 'AnalyseIA':
              iconName = focused ? 'scan' : 'scan-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen 
        name="Parcelles" 
        component={ParcellesScreen}
        options={{ tabBarLabel: 'Parcelles' }}
      />
      <Tab.Screen 
        name="AnalyseIA" 
        component={AnalyseIAScreen}
        options={{ 
          tabBarLabel: 'IA',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              backgroundColor: focused ? COLORS.primary : 'transparent',
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Ionicons 
                name={focused ? 'scan' : 'scan-outline'} 
                size={24} 
                color={focused ? COLORS.white : color} 
              />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Capteurs" 
        component={CapteursScreen}
        options={{ tabBarLabel: 'Capteurs' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
