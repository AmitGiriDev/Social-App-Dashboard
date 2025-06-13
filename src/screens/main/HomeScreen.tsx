import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import CachedImage from '../../components/media/CachedImage';
import Icon from '../../components/ui/Icon';
import {DummyPost, useLazyGetPostsQuery} from '../../services/api/postsApi';
import {MainTabParamList, HomeStackParamList} from '../../navigation/types';
import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';

const AnimatedFlatList = Animated.FlatList;

// Type for the posts response

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<HomeStackParamList>
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const scrollY = useSharedValue(0);

  const [
    fetchPosts,
    {data: postsResponse, isLoading: isPostsLoading, isFetching},
  ] = useLazyGetPostsQuery();

  useEffect(() => {
    fetchPosts({limit: 10, skip: 0});
  }, []);

  const {
    data: posts = [],
    isLoading,
    refreshing,
    handleRefresh,
    flatListRef,
    scrollToTop,
    handleScroll,
  } = useInfiniteScroll<DummyPost>({
    initialData: postsResponse?.posts || [],
    onLoadMore: async nextPage => {
      const result = await fetchPosts({
        limit: 20,
        skip: nextPage * 20,
      }).unwrap();
      return result;
    },
    getHasMore: (): boolean => {
      const totalPosts = postsResponse?.total || 0;
      return posts.length < totalPosts;
    },
  });

  // Animated header based on scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerHeight = interpolate(
      scrollY.value,
      [0, 70],
      [70, 0],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    );

    return {
      height: headerHeight,
      opacity,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, 100],
      [FONTS.h1, FONTS.h3],
      Extrapolation.CLAMP,
    );

    const paddingTop = interpolate(
      scrollY.value,
      [0, 100],
      [SPACING.xl, SPACING.s],
      Extrapolation.CLAMP,
    );

    return {
      fontSize,
      // paddingTop,
    };
  });

  // Render post item
  const renderPostItem = useCallback(
    ({item}: {item: DummyPost}) => {
      return (
        <TouchableOpacity
          style={styles.postCard}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('PostDetail', {postId: item.id.toString()})
          }>
          {item.image && (
            <CachedImage
              source={{uri: item.image}}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.postContent}>
            <Text style={styles.postTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.postBody} numberOfLines={3}>
              {item.body}
            </Text>

            <View style={styles.postFooter}>
              <View style={styles.postStats}>
                <Icon
                  type="Ionicons"
                  name="heart"
                  size={16}
                  color={COLORS.error}
                />
                <Text style={styles.postStatsText}>
                  {item.reactions.likes || 0}
                </Text>

                <Icon
                  type="AntDesign"
                  name="dislike2"
                  size={16}
                  color={COLORS.gray}
                  style={styles.commentIcon}
                />
                <Text style={styles.postStatsText}>
                  {item.reactions.dislikes || 0}
                </Text>
              </View>

              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 2 && (
                    <Text style={styles.moreTagsText}>
                      +{item.tags.length - 2}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  // Render footer (loading indicator)
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading more posts...</Text>
      </View>
    );
  }, [isLoading]);

  // Transform posts data when it changes
  const transformedPosts = React.useMemo(() => {
    if (!posts?.length) {
      return [];
    }
    return posts?.map((post: DummyPost) => ({
      ...post,
      image: `https://picsum.photos/seed/${post.id}/800/600`,
    }));
  }, [posts]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isPostsLoading || isFetching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading posts...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon type="Feather" name="inbox" size={60} color={COLORS.gray} />
        <Text style={styles.emptyText}>No posts found</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }, [isPostsLoading, isFetching, handleRefresh]);

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Animated.Text style={[styles.headerTitle, titleAnimatedStyle]}>
          Feed
        </Animated.Text>
      </Animated.View>

      {/* Posts List */}
      <AnimatedFlatList
        ref={flatListRef}
        data={transformedPosts}
        keyExtractor={(item: DummyPost) =>
          `${item.id}-${Math.random().toString(36).substr(2, 9)}`
        }
        ListHeaderComponent={
          isFetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
        renderItem={renderPostItem}
        contentContainerStyle={styles.listContent}
        onMomentumScrollBegin={scrollHandler}
        onScroll={handleScroll}
        scrollEventThrottle={17}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        // onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      {posts && posts.length > 5 && (
        <TouchableOpacity
          style={styles.scrollTopButton}
          onPress={scrollToTop}
          activeOpacity={0.8}>
          <Icon
            type="Ionicons"
            name="arrow-up"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    // flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.l,
    justifyContent: 'center',
    borderBottomColor: COLORS.lightGray,
    zIndex: 10,
  },
  headerTitle: {
    textAlignVertical: 'center',
    fontWeight: 'bold',
    color: COLORS.textDark,
    // marginBottom: SPACING.s,
  },
  listContent: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.xl * 2,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: SPACING.l,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: SPACING.m,
  },
  postTitle: {
    fontSize: FONTS.h4,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  postBody: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    marginBottom: SPACING.m,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatsText: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  commentIcon: {
    marginLeft: SPACING.m,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  tagText: {
    fontSize: FONTS.small - 2,
    color: COLORS.textLight,
  },
  moreTagsText: {
    fontSize: FONTS.small - 2,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  loadingContainer: {
    padding: SPACING.m,
    alignItems: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.l,
  },
  loadingText: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginLeft: SPACING.s,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    marginTop: SPACING.m,
  },
  refreshButton: {
    marginTop: SPACING.m,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.l,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: '500',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.l,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default HomeScreen;
