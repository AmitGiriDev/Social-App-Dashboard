import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Main Tab Types
export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Home Stack Types
export type HomeStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  UserProfile: { userId: string };
};

// Profile Stack Types
export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: { userData: any };
  Settings: undefined;
  MyPosts: undefined;
};

// Root Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  PostCreate: undefined;
  ImageViewer: { imageUrl: string };
  Search: undefined;
  Comments: { postId: string };
};

// Declare global type for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
