import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../../navigation/types';
import {useUpdateDummyUserMutation} from '../../services/api/DummyApiAuth';
import {useForm} from 'react-hook-form';
import {launchImageLibrary, ImageLibraryOptions} from 'react-native-image-picker';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
} from '../../utils/constants/theme';
import Button from '../../components/ui/Button';
import FormInput from '../../components/forms/FormInput';

type EditProfileScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'EditProfile'
>;
type EditProfileNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
}



const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const route = useRoute<EditProfileScreenRouteProp>();
  const {userData} = route.params;

  // State for local image preview
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {control, handleSubmit, formState: {}, setValue} = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      image: userData.image || '',
    },
  });

  const [updateUser, {isLoading, isError, isSuccess, error}] =
    useUpdateDummyUserMutation();

  useEffect(() => {
    if (isSuccess) {
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    }
  }, [isSuccess, navigation]);

  // Image picker function
  const handleImagePick = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('Image picker error: ', response.errorMessage);
        Alert.alert('Error', 'Image selection failed');
      } else if (response.assets && response.assets[0]) {
        const selectedAsset = response.assets[0];
        const imageUri = selectedAsset.uri;

        if (imageUri) {
          setSelectedImage(imageUri);
          setValue('image', imageUri);

          // Simulate successful image upload
          console.log('Image selected:', imageUri);
          Alert.alert('Success', 'Image selected successfully');
        }
      }
    });
  };

  // Form submission function
  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Create a copy of the form data
      const updatedData = {...data};

      // For API, keep using URL format if selectedImage is not set
      // This is because our simulated image upload just uses local URI
      // In a real app, we'd upload the image to a server and get a URL back
      if (!selectedImage) {
        updatedData.image = data.image;
      }

      // Send API update
      await updateUser({
        id: userData.id,
        ...updatedData,
      }).unwrap();
    } catch (err) {
      console.error('Failed to update profile:', err);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleImagePick}
              style={styles.imagePickerContainer}
            >
              <Image
                source={{uri: selectedImage || userData.image}}
                style={styles.profileImage}
                resizeMode="cover"
              />
              <View style={styles.editImageBadge}>
                <Text style={styles.editImageText}>Edit</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>

            <FormInput
              control={control}
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
              icon={{type: 'MaterialIcons', name: 'person'}}
              rules={{
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters',
                },
              }}
            />

            <FormInput
              control={control}
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              icon={{type: 'MaterialIcons', name: 'person'}}
              rules={{
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Last name must be at least 2 characters',
                },
              }}
            />

            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              icon={{type: 'MaterialIcons', name: 'email'}}
              keyboardType="email-address"
              autoCapitalize="none"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address format',
                },
              }}
            />

            <FormInput
              control={control}
              name="phone"
              label="Phone"
              placeholder="Enter your phone number"
              icon={{type: 'MaterialIcons', name: 'phone'}}
              keyboardType="phone-pad"
              rules={{
                pattern: {
                  value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                  message: 'Invalid phone number format',
                },
              }}
            />

            {/* Image URL field is hidden since we're using image picker */}
            <View style={styles.imageInstructionContainer}>
              <Text style={styles.imageInstructionText}>
                Tap on the profile image above to change your picture
              </Text>
            </View>

            {isError && (
              <Text style={styles.errorText}>
                {typeof error === 'object' && error !== null && 'error' in error
                  ? String(error.error)
                  : 'Something went wrong. Please try again.'}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="ghost"
                style={styles.cancelButton}
              />
              <Button
                title={isLoading ? 'Saving...' : 'Save Changes'}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={styles.saveButton}
                textStyle={styles.saveButtonText}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginVertical: SPACING.l,
  },
  imagePickerContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.lightGray,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  editImageText: {
    color: COLORS.white,
    fontSize: FONTS.small,
    fontWeight: 'bold',
  },
  imageInstructionContainer: {
    marginBottom: SPACING.m,
    backgroundColor: COLORS.lightGray,
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.s,
  },
  imageInstructionText: {
    textAlign: 'center',
    color: COLORS.textDark,
    fontSize: FONTS.small,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    marginHorizontal: SPACING.m,
    marginBottom: SPACING.l,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.m,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.m,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.s,
  },
  saveButton: {
    flex: 1,
    marginLeft: SPACING.s,
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.small,
    marginBottom: SPACING.s,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfileScreen;
