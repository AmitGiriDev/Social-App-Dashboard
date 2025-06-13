// Import BottomSheetBackdropProps type
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Keyboard,
  Pressable,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import CachedImage from '../../components/media/CachedImage';
import Icon from '../../components/ui/Icon';
import {DummyPost, useLazyGetPostsQuery} from '../../services/api/postsApi';
import {MainTabParamList, HomeStackParamList} from '../../navigation/types';
import {CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import FormInput from '../../components/forms/FormInput';
import {useForm, useWatch} from 'react-hook-form';

const AnimatedFlatList = Animated.FlatList;

// Type for the posts response
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<HomeStackParamList>
>;

// Define sort options
type SortOption =
  | 'mostLikes'
  | 'leastLikes'
  | 'mostDislikes'
  | 'leastDislikes'
  | 'mostViews'
  | 'leastViews';

// Render backdrop for the bottom sheet outside component to avoid lint warnings
const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const scrollY = useSharedValue(0);
  const searchInputRef = useRef<TextInput>(null);
  // Bottom sheet references and state
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%'], []);

  // Search focus state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWidthAnim = useSharedValue(60); // Initial width percent when not focused

  // Form for search and sort
  const {control, setValue} = useForm({
    mode: 'onChange',
    defaultValues: {
      search: '',
      sortBy: 'mostLikes' as SortOption,
    },
  });

  // Watch for changes in form values
  const searchTerm = useWatch({
    control,
    name: 'search',
  });

  const sortBy = useWatch({
    control,
    name: 'sortBy',
  }) as SortOption;

  const [
    fetchPosts,
    {data: postsResponse, isLoading: isPostsLoading, isFetching},
  ] = useLazyGetPostsQuery();

  useEffect(() => {
    fetchPosts({limit: 10, skip: 0});
  }, [fetchPosts]);

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

  // Transform posts data based on search and sort criteria
  const filteredAndSortedPosts = useMemo(() => {
    // Add image URLs to posts for rendering
    const postsWithImages = posts?.map((post: DummyPost) => ({
      ...post,
      image: `https://picsum.photos/seed/${post.id}/800/600`,
    }));

    if (!postsWithImages || postsWithImages.length === 0) {
      return [];
    }

    // Filter posts by search term
    let filteredPosts = postsWithImages;
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filteredPosts = postsWithImages.filter(
        post =>
          post.title.toLowerCase().includes(term) ||
          post.body.toLowerCase().includes(term),
      );
    }

    // Sort posts based on selected option
    return [...filteredPosts].sort((a, b) => {
      switch (sortBy) {
        case 'mostLikes':
          return (b.reactions.likes || 0) - (a.reactions.likes || 0);
        case 'leastLikes':
          return (a.reactions.likes || 0) - (b.reactions.likes || 0);
        case 'mostDislikes':
          // Since DummyJSON doesn't have dislikes, we're simulating with tags.length
          return (b.reactions?.dislikes || 0) - (a.reactions?.dislikes || 0);
        case 'leastDislikes':
          return (a.reactions?.dislikes || 0) - (b.reactions?.dislikes || 0);
        case 'mostViews':
          // Simulating views with userId as we don't have view count
          return b.views - a.views;
        case 'leastViews':
          return a.views - b.views;
        default:
          return 0;
      }
    });
  }, [posts, searchTerm, sortBy]);

  // Animated header based on scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerHeight = interpolate(
      scrollY.value,
      [0, 120],
      [120, 0],
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
                  name="heart-outline"
                  size={16}
                  color={COLORS.textLight}
                />
                <Text style={styles.postStatsText}>{item.reactions.likes}</Text>

                <Icon
                  type="AntDesign"
                  name="dislike2"
                  size={16}
                  color={COLORS.textLight}
                  style={styles.commentIcon}
                />
                <Text style={styles.postStatsText}>
                  {item.reactions.dislikes}
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

  // Display no search results component
  const renderNoSearchResults = useCallback(() => {
    if (!searchTerm || filteredAndSortedPosts.length > 0) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon
          type="Ionicons"
          name="search-outline"
          size={60}
          color={COLORS.textLight}
        />
        <Text style={styles.emptyText}>
          No posts found matching '{searchTerm}'
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => setValue('search', '')}
          activeOpacity={0.7}>
          <Text style={styles.refreshButtonText}>Clear Search</Text>
        </TouchableOpacity>
      </View>
    );
  }, [searchTerm, filteredAndSortedPosts.length, setValue]);

  // Render footer loading indicator
  const renderFooter = useCallback(() => {
    if (!posts || isPostsLoading) {
      return null;
    }

    if (isLoading) {
      return <LoadingIndicator message="Loading more posts..." />;
    }

    return null;
  }, [posts, isPostsLoading, isLoading]);

  // Render empty state component
  const renderEmpty = useCallback(() => {
    if (searchTerm && searchTerm.trim() !== '') {
      return renderNoSearchResults();
    }

    if (isPostsLoading) {
      return (
        <View style={styles.emptyContainer}>
          <LoadingIndicator size="large" />
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
  }, [isPostsLoading, handleRefresh, renderNoSearchResults, searchTerm]);

  return (
    <Pressable
      onPress={() => {
        searchInputRef.current?.blur();
        Keyboard.dismiss();
      }}
      style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Animated.Text style={[styles.headerTitle, titleAnimatedStyle]}>
          Feed
        </Animated.Text>
        <Animated.View style={styles.searchSortContainer}>
          <Animated.View
            style={[
              styles.searchContainer,
              useAnimatedStyle(() => ({
                width: `${searchWidthAnim.value}%`,
              })),
            ]}>
            <FormInput
              ref={searchInputRef}
              containerStyles={{marginBottom: 0}}
              control={control}
              name="search"
              icon={{type: 'Ionicons', name: 'search'}}
              placeholder="Search title or description"
              onFocus={() => {
                setIsSearchFocused(true);
                bottomSheetRef.current?.close();
                searchWidthAnim.value = withTiming(100, {duration: 500});
              }}
              onBlur={() => {
                setIsSearchFocused(false);
                searchWidthAnim.value = withTiming(60, {duration: 500});
              }}
            />
          </Animated.View>
          <Animated.View
            style={[styles.sortByContainer, isSearchFocused && styles.hidden]}>
            <Pressable
              style={styles.sortDropdown}
              onPress={() => {
                bottomSheetRef.current?.snapToIndex(0);
                Keyboard.dismiss();
              }}>
              <Text style={styles.sortButtonText}>
                {sortBy === 'mostLikes' && 'Most Likes'}
                {sortBy === 'leastLikes' && 'Least Likes'}
                {sortBy === 'mostDislikes' && 'Most Dislikes'}
                {sortBy === 'leastDislikes' && 'Least Dislikes'}
                {sortBy === 'mostViews' && 'Most Views'}
                {sortBy === 'leastViews' && 'Least Views'}
              </Text>
              <Icon
                type="MaterialIcons"
                name="arrow-drop-down"
                size={24}
                color={COLORS.primary}
              />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Posts List */}
      <AnimatedFlatList
        ref={flatListRef}
        data={filteredAndSortedPosts}
        keyExtractor={(item: DummyPost) =>
          `${item.id}-${Math.random().toString(36).substring(2, 9)}`
        }
        renderItem={renderPostItem}
        contentContainerStyle={styles.listContent}
        onMomentumScrollBegin={scrollHandler}
        onScroll={handleScroll}
        scrollEventThrottle={17}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
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

      {/* Sort Options Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}>
        <BottomSheetView style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetTitle}>Sort Posts By</Text>
          {[
            {label: 'Most Likes', value: 'mostLikes'},
            {label: 'Least Likes', value: 'leastLikes'},
            {label: 'Most Dislikes', value: 'mostDislikes'},
            {label: 'Least Dislikes', value: 'leastDislikes'},
            {label: 'Most Views', value: 'mostViews'},
            {label: 'Least Views', value: 'leastViews'},
          ].map(option => (
            <Pressable
              key={option.value}
              style={[
                styles.sortOption,
                // sortBy === option.value && styles.selectedSortOption,
              ]}
              onPress={() => {
                setValue('sortBy', option.value as SortOption);
                bottomSheetRef.current?.close();
              }}>
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.value && styles.selectedSortOptionText,
                ]}>
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Icon
                  type="Ionicons"
                  name="checkmark"
                  size={22}
                  color={COLORS.primary}
                />
              )}
            </Pressable>
          ))}
        </BottomSheetView>
      </BottomSheet>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomSheetContainer: {
    flex: 1,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
  },
  bottomSheetTitle: {
    fontSize: FONTS.h4,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.m,
    textAlign: 'center',
  },
  hidden: {
    display: 'none',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedSortOption: {
    backgroundColor: COLORS.lightGray,
  },
  sortOptionText: {
    fontSize: FONTS.body,
    color: COLORS.textDark,
  },
  selectedSortOptionText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.l,
    justifyContent: 'space-evenly',
    borderBottomColor: COLORS.lightGray,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerTitle: {
    textAlignVertical: 'center',
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  searchSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  sortByContainer: {
    width: '30%',
  },
  sortByLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  sortButtonText: {
    fontSize: FONTS.small,
    color: COLORS.textDark,
    flex: 1,
  },
  searchContainer: {
    // justifyContent: 'center',
    // alignItems: 'flex-end',
    width: '50%',
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
