import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import FormInput from '../../components/forms/FormInput';
import Button from '../../components/ui/Button';
import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import {loginSuccess} from '../../store/slices/authSlice';
import {AuthStackParamList} from '../../navigation/types';
import {useDummyLoginMutation} from '../../services/api/DummyApiAuth';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormData {
  username: string;
  password: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(0.8);

  // Form handling
  const {control, handleSubmit} = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Redux and API
  const dispatch = useDispatch();
  const [loginUser, {isLoading}] = useDummyLoginMutation();

  // Animation setup
  useEffect(() => {
    // Staggered animations
    logoOpacity.value = withTiming(1, {duration: 800, easing: Easing.ease});
    formOpacity.value = withDelay(
      300,
      withTiming(1, {duration: 800, easing: Easing.ease}),
    );
    formTranslateY.value = withDelay(
      300,
      withTiming(0, {duration: 800, easing: Easing.ease}),
    );
    buttonScale.value = withDelay(
      600,
      withTiming(1, {duration: 500, easing: Easing.elastic(1.2)}),
    );
  }, [logoOpacity, formOpacity, formTranslateY, buttonScale]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{translateY: formTranslateY.value}],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Handle login
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginUser(data).unwrap();
      dispatch(
        loginSuccess({
          id: response.id || 1,
          email: response.email,
          username: data.username,
          accessToken: response.accessToken,
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          gender: response.gender || 'male',
          image: response.image || '',
          refreshToken: response.refreshToken || '',
        }),
      );
    } catch (err) {
      Alert.alert('Login Failed', 'Invalid email or password');
      console.error('Login error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Text style={styles.appName}>Propacity Social</Text>
            <Text style={styles.tagline}>Connect with the world</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <Text style={styles.title}>Login</Text>

            <FormInput
              control={control}
              name="username"
              label="Username"
              placeholder="Enter your Username"
              autoCapitalize="none"
              icon={{type: 'MaterialIcons', name: 'person'}}
              rules={{
                required: 'Username is required',
                pattern: {
                  value: 3,
                  message: 'Invalid Username',
                },
              }}
            />

            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              icon={{type: 'MaterialIcons', name: 'lock'}}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
            />

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => {
                //TODO
                //  navigation.navigate('ForgotPassword')
                Alert.alert(
                  'Forgot Password',
                  'This functionality would be implemented soon',
                );
              }}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View style={buttonAnimatedStyle}>
              <Button
                title="Login"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
              />
            </Animated.View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  appName: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.l,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.l,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.l,
  },
  forgotPasswordText: {
    fontSize: FONTS.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginVertical: SPACING.m,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
  },
  registerText: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
  },
  registerLink: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
