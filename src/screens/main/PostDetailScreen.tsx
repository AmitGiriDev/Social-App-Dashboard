import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';

import {HomeStackParamList} from '../../navigation/types';
import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import CachedImage from '../../components/media/CachedImage';
import Icon from '../../components/ui/Icon';
import {
  DummyComment,
  useGetPostByIdQuery,
  useGetPostCommentsQuery,
} from '../../services/api/postsApi';
import {RootState} from '../../store';

type PostDetailScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'PostDetail'
>;

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const {postId} = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [showComments, setShowComments] = useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const commentsOpacity = useSharedValue(0);
  const commentsTranslateY = useSharedValue(30);
  const likeScale = useSharedValue(1);
  const dislikeScale = useSharedValue(1);

  // Fetch post data
  const {
    data: post,
    isLoading: isPostLoading,
    refetch: refetchPost,
  } = useGetPostByIdQuery(postId);

  // Fetch comments
  const {
    data: comments,
    isLoading: isCommentsLoading,
    refetch: refetchComments,
  } = useGetPostCommentsQuery(postId);

  // Set initial like count
  useEffect(() => {
    if (post) {
      // Generate a random like count for demo purposes
      setLikeCount(post.reactions.likes);
      setDislikeCount(post.reactions.dislikes);
    }
  }, [post]);

  // Run animations
  useEffect(() => {
    // Staggered animations
    headerOpacity.value = withTiming(1, {duration: 600, easing: Easing.ease});

    contentOpacity.value = withDelay(
      300,
      withTiming(1, {duration: 800, easing: Easing.ease}),
    );

    contentTranslateY.value = withDelay(
      300,
      withTiming(0, {duration: 800, easing: Easing.ease}),
    );

    if (showComments) {
      commentsOpacity.value = withDelay(
        600,
        withTiming(1, {duration: 800, easing: Easing.ease}),
      );

      commentsTranslateY.value = withDelay(
        600,
        withTiming(0, {duration: 800, easing: Easing.ease}),
      );
    }
  }, [
    headerOpacity,
    contentOpacity,
    contentTranslateY,
    commentsOpacity,
    commentsTranslateY,
    showComments,
  ]);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{translateY: contentTranslateY.value}],
  }));

  const commentsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: commentsOpacity.value,
    transform: [{translateY: commentsTranslateY.value}],
  }));

  const likeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: likeScale.value}],
  }));
  const dislikeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: dislikeScale.value}],
  }));

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPost(), refetchComments()]);
    setRefreshing(false);
  };

  // Handle like press
  const handleLikePress = () => {
    // Animate like button
    likeScale.value = withSequence(
      withTiming(1.2, {duration: 150, easing: Easing.ease}),
      withTiming(1, {duration: 150, easing: Easing.ease}),
    );

    // Toggle like state and update count
    setIsLiked(prev => {
      const newLikeState = !prev;
      setLikeCount(prev => (newLikeState ? prev + 1 : prev - 1));
      return newLikeState;
    });
  };
  const handleDislikePress = () => {
    // Animate like button
    dislikeScale.value = withSequence(
      withTiming(1.2, {duration: 150, easing: Easing.ease}),
      withTiming(1, {duration: 150, easing: Easing.ease}),
    );

    // Toggle like state and update count
    setIsDisliked(prev => {
      const newLikeState = !prev;
      setDislikeCount(prev => (newLikeState ? prev + 1 : prev - 1));
      return newLikeState;
    });
  };

  // Handle comment toggle
  const handleToggleComments = () => {
    setShowComments(prev => !prev);

    if (!showComments) {
      // Animate comments in
      commentsOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.ease,
      });
      commentsTranslateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.ease,
      });
    } else {
      // Animate comments out
      commentsOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.ease,
      });
      commentsTranslateY.value = withTiming(30, {
        duration: 300,
        easing: Easing.ease,
      });
    }
  };

  // Handle share
  const handleShare = () => {
    Alert.alert('Share', 'Sharing functionality would be implemented here');
  };

  // Loading state
  if (isPostLoading && !post) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  // Error state
  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Icon
          type="Feather"
          name="alert-circle"
          size={60}
          color={COLORS.error}
        />
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }>
      {/* Post Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backButtonIcon}
          onPress={() => navigation.goBack()}>
          <Icon
            type="Ionicons"
            name="arrow-back"
            size={24}
            color={COLORS.textDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
        <View style={styles.headerRight} />
      </Animated.View>

      {/* Post Content */}
      <Animated.View style={[styles.postCard, contentAnimatedStyle]}>
        {/* Post Image */}
        <CachedImage
          source={{uri: `https://picsum.photos/seed/${post.id}/800/500`}}
          style={styles.postImage}
          resizeMode="cover"
        />

        {/* Post Title */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postBody}>{post.body}</Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {['social', 'news', 'trending']
              .slice(0, Math.floor(Math.random() * 3) + 1)
              .map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
          </View>

          {/* Post Actions */}
          <View style={styles.actionsContainer}>
            <Animated.View style={likeButtonAnimatedStyle}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLikePress}>
                <Icon
                  type="AntDesign"
                  name={isLiked ? 'heart' : 'hearto'}
                  size={22}
                  color={isLiked ? COLORS.error : COLORS.textLight}
                />
                <Text style={styles.actionText}>{likeCount}</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={dislikeButtonAnimatedStyle}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDislikePress}>
                <Icon
                  type="AntDesign"
                  name={isDisliked ? 'dislike1' : 'dislike2'}
                  size={22}
                />
                <Text style={styles.actionText}>{dislikeCount}</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleComments}>
              <Icon
                type="Feather"
                name="message-circle"
                size={22}
                color={COLORS.textLight}
              />
              <Text style={styles.actionText}>{comments?.length || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon
                type="Feather"
                name="share-2"
                size={22}
                color={COLORS.textLight}
              />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Comments Section */}
      {showComments && (
        <Animated.View style={[styles.commentsSection, commentsAnimatedStyle]}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsSectionTitle}>Comments</Text>
            <Text style={styles.commentCount}>{comments?.length || 0}</Text>
          </View>

          {isCommentsLoading ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.commentsLoadingText}>
                Loading comments...
              </Text>
            </View>
          ) : comments && comments?.length > 0 ? (
            comments.map((comment: DummyComment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentName}>
                      {comment.user.username}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentBody}>{comment.body}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noComments}>
              <Icon
                type="Feather"
                name="message-square"
                size={40}
                color={COLORS.gray}
              />
              <Text style={styles.noCommentsText}>No comments yet</Text>
            </View>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: FONTS.body,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.l,
  },
  errorText: {
    marginTop: SPACING.m,
    fontSize: FONTS.h3,
    color: COLORS.textDark,
    marginBottom: SPACING.l,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButtonIcon: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  headerRight: {
    width: 24, // To balance the header
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: SPACING.m,
    marginTop: SPACING.m,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 250,
  },
  postContent: {
    padding: SPACING.m,
  },
  postTitle: {
    fontSize: FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.s,
  },
  postBody: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SPACING.m,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.m,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: FONTS.small,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.m,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.s,
  },
  actionText: {
    marginLeft: 6,
    fontSize: FONTS.body,
    color: COLORS.textLight,
  },
  commentsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: SPACING.m,
    marginTop: SPACING.m,
    padding: SPACING.m,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
    paddingBottom: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  commentsSectionTitle: {
    fontSize: FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  commentCount: {
    fontSize: FONTS.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  commentsLoading: {
    padding: SPACING.m,
    alignItems: 'center',
  },
  commentsLoadingText: {
    marginTop: SPACING.s,
    color: COLORS.textLight,
    fontSize: FONTS.body,
  },
  commentItem: {
    marginBottom: SPACING.m,
    paddingBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  commentHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.s,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.s,
  },
  commentAvatarText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: 'bold',
  },
  commentMeta: {
    flex: 1,
  },
  commentName: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  commentEmail: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  commentBody: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  noComments: {
    padding: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCommentsText: {
    marginTop: SPACING.s,
    color: COLORS.textLight,
    fontSize: FONTS.body,
  },
});

export default PostDetailScreen;
