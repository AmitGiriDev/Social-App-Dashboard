import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import {COLORS} from '../utils/constants/theme';
import Icon from '../components/ui/Icon';
import ReactNativeBiometrics from 'react-native-biometrics';
import {Alert} from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
let isByLogin = false;
// Auth Navigator
const AuthNavigator = () => {
  isByLogin = true;
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyProfile" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          headerTitle: 'Edit Profile',
        }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  const handleBiometricAuth = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const {success, error} = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to continue',
      });

      if (success) {
        Alert.alert('Success', 'Biometric authentication successful');
        return true;
      } else {
        Alert.alert('Authentication failed', 'Biometric authentication failed');
        return false;
      }
    } catch (error) {
      console.error('[handleBiometricAuth] Error:', error);
      Alert.alert('Error', 'Biometric authentication failed from device');
      return false;
    }
  };
  useEffect(() => {
    !isByLogin && handleBiometricAuth();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let newSize = focused ? size : size * 0.8;
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create') {
            iconName = 'add-circle';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return (
            <Icon
              type="Ionicons"
              name={iconName}
              size={newSize}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
      })}>
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Create" component={CreatePostScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="HomeScreen"
        options={{headerShown: true, headerTitle: 'Propacity Social'}}
        component={HomeScreen}
      />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};

// Main Drawer Navigator (wraps the Tab Navigator)
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{headerShown: false, headerTitle: 'Propacity Social'}}>
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
