import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

// Import screens (placeholders for now)
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/dashboard/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PostDetailScreen from '../screens/main/PostDetailScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="HomeStack" component={HomeStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};

// Main Drawer Navigator (wraps the Tab Navigator)
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{headerShown: true, headerTitle: 'Propacity Social'}}>
      <Drawer.Screen name="Main" component={TabNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

// Root Navigator
export const RootNavigator = () => {
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <DrawerNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
