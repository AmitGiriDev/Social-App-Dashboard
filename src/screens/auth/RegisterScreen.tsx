import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

import {AuthStackParamList} from '../../navigation/types';
import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import FormInput from '../../components/forms/FormInput';
import Button from '../../components/ui/Button';
import {useRegisterMutation} from '../../services/api/authApi';
import {loginSuccess} from '../../store/slices/authSlice';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(0.8);

  // Form handling
  const {control, handleSubmit, watch} = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = watch('password');

  // Redux and API
  const dispatch = useDispatch();
  const [registerUser, {isLoading}] = useRegisterMutation();

  // Animation setup
  useEffect(() => {
    // Staggered animations
    headerOpacity.value = withTiming(1, {duration: 800, easing: Easing.ease});
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
  }, [headerOpacity, formOpacity, formTranslateY, buttonScale]);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{translateY: formTranslateY.value}],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  // Handle register
  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();

      dispatch(
        loginSuccess({
          id: response.id || 0,
          email: data.email,
          token: response.token,
          name: data.name,
        }),
      );
    } catch (err) {
      Alert.alert(
        'Registration Failed',
        'Could not create account. Please try again.',
      );
      console.error('Registration error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
            <Text style={styles.appName}>Propacity Social</Text>
            <Text style={styles.tagline}>Join our community</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <Text style={styles.title}>Create Account</Text>

            <FormInput
              control={control}
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              icon={{type: 'MaterialIcons', name: 'person'}}
              rules={{
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              }}
            />

            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={{type: 'MaterialIcons', name: 'email'}}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
            />

            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="Create a password"
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

            <FormInput
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              icon={{type: 'MaterialIcons', name: 'lock'}}
              rules={{
                required: 'Please confirm your password',
                validate: (value: string) =>
                  value === password || 'Passwords do not match',
              }}
            />

            <Animated.View style={buttonAnimatedStyle}>
              <Button
                title="Register"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                style={styles.registerButton}
              />
            </Animated.View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.l,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.xl,
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
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.l,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.l,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: SPACING.m,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
  },
  loginText: {
    color: COLORS.textLight,
    fontSize: FONTS.body,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: FONTS.body,
  },
});

export default RegisterScreen;
