import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useForm} from 'react-hook-form';
import {launchImageLibrary} from 'react-native-image-picker';

import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import FormInput from '../../components/forms/FormInput';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from '../../services/api/postsApi';
import {PostStackParamList} from '../../navigation/types';
import {useSelector} from 'react-redux';

type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  PostStackParamList,
  'CreatePost'
>;

type CreatePostScreenRouteProp = RouteProp<PostStackParamList, 'CreatePost'>;

type FormValues = {
  title: string;
  body: string;
  tags: string[];
  imageUri?: string;
};

const CreatePostScreen = () => {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const route = useRoute<CreatePostScreenRouteProp>();
  const post = route.params?.post; // For editing mode
  const userId = useSelector(state => state?.auth?.user?.id);
  const [createPost, {isLoading: isCreating}] = useCreatePostMutation();
  const [updatePost, {isLoading: isUpdating}] = useUpdatePostMutation();

  const [imageUri, setImageUri] = useState<string | undefined>(post?.image);
  const [tagInputText, setTagInputText] = useState('');

  const isLoading = isCreating || isUpdating;
  const isEditMode = !!post;

  const {control, handleSubmit, setValue, watch} = useForm<FormValues>({
    defaultValues: {
      title: post?.title || '',
      body: post?.body || '',
      tags: post?.tags || [],
      imageUri: post?.image,
    },
  });

  const watchedTags = watch('tags');

  useEffect(() => {
    // Set header title based on mode
    navigation.setOptions({
      headerTitle: isEditMode ? 'Edit Post' : 'Create Post',
    });
  }, [navigation, isEditMode]);

  const handleImagePick = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo' as const,
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setImageUri(selectedImage.uri);
      setValue('imageUri', selectedImage.uri);
    }
  };

  const handleAddTag = () => {
    if (!tagInputText.trim()) {
      return;
    }

    // Remove # prefix if user added it already
    const tagText = tagInputText.trim().replace(/^#/, '');

    // Check for duplicates
    if (!watchedTags.includes(tagText)) {
      setValue('tags', [...watchedTags, tagText]);
    }

    setTagInputText('');
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      'tags',
      watchedTags.filter(t => t !== tag),
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && post) {
        // Update existing post
        await updatePost({
          id: post.id,
          title: data.title,
          body: data.body,
          tags: data.tags,
        }).unwrap();

        Alert.alert('Success', 'Post updated successfully');
      } else {
        // Create new post
        await createPost({
          title: data.title,
          body: data.body,
          userId: userId,
          tags: data.tags,
        }).unwrap();

        Alert.alert('Success', 'Post created successfully');
      }

      // Clear the form
      setValue('title', '');
      setValue('body', '');
      setValue('tags', []);
      setValue('imageUri', '');
      setImageUri(undefined);

      navigation.goBack();
    } catch (error) {
      console.error('Post operation failed:', error);
      Alert.alert(
        'Error',
        isEditMode
          ? 'Failed to update post. Please try again.'
          : 'Failed to create post. Please try again.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Post Image */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImagePick}
          activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon
                type="Feather"
                name="image"
                size={40}
                color={COLORS.textLight}
              />
              <Text style={styles.imagePlaceholderText}>
                Tap to select an image
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Icon type="Feather" name="edit-2" size={16} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <FormInput
          control={control}
          name="title"
          label="Title"
          placeholder="Enter post title"
          rules={{
            required: 'Title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters',
            },
          }}
        />

        <FormInput
          control={control}
          name="body"
          label="Content"
          placeholder="Write your post content here"
          multiline
          textAlignVertical="top"
          containerStyles={styles.bodyInput}
          rules={{
            required: 'Content is required',
            minLength: {
              value: 10,
              message: 'Content must be at least 10 characters',
            },
          }}
        />

        {/* Tags Input */}
        <Text style={styles.labelText}>Tags</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tagsInputRow}>
            {/* Custom tag input field */}
            <View style={styles.tagInputWrapper}>
              <TextInput
                style={styles.tagInputField}
                value={tagInputText}
                onChangeText={setTagInputText}
                placeholder="Add tag (without #)"
                returnKeyType="done"
                onSubmitEditing={handleAddTag}
              />
            </View>
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
              disabled={!tagInputText.trim()}>
              <Icon type="Ionicons" name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Display tags */}
          <View style={styles.tagsList}>
            {watchedTags.map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>#{tag}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Icon
                    type="Ionicons"
                    name="close-circle"
                    size={16}
                    color={COLORS.textDark}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {watchedTags.length === 0 && (
            <Text style={styles.noTagsText}>No tags added yet</Text>
          )}
        </View>

        {/* Submit Button */}
        <Button
          title={isEditMode ? 'Update Post' : 'Create Post'}
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
          loading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.xxl,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: SPACING.m,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: SPACING.s,
    color: COLORS.textLight,
    fontSize: FONTS.small,
  },
  editBadge: {
    position: 'absolute',
    bottom: SPACING.s,
    right: SPACING.s,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyInput: {
    height: 150,
  },
  tagsContainer: {
    marginBottom: SPACING.m,
  },
  labelText: {
    fontSize: FONTS.small,
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  tagsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInputWrapper: {
    flex: 1,
    marginRight: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.s,
    height: 48,
    justifyContent: 'center',
  },
  tagInputField: {
    fontSize: FONTS.body,
    color: COLORS.textDark,
    padding: 0,
  },
  addTagButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: SPACING.s,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.s,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginRight: SPACING.s,
    marginBottom: SPACING.s,
  },
  tagChipText: {
    color: COLORS.textDark,
    marginRight: 4,
    fontSize: FONTS.small,
  },
  noTagsText: {
    color: COLORS.textLight,
    fontSize: FONTS.small,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: SPACING.l,
  },
});

export default CreatePostScreen;
