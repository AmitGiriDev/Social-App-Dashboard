import {useCallback, useRef, useState, useEffect} from 'react';
import {FlatList, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

interface UseInfiniteScrollOptions<T> {
  initialPage?: number;
  threshold?: number;
  initialData?: T[];
  onLoadMore?: (page: number) => any;
  getHasMore?: () => boolean;
}

export const useInfiniteScroll = <T>({
  initialPage = 1,
  threshold = 0.8,
  initialData = [],
  onLoadMore,
  getHasMore,
}: UseInfiniteScrollOptions<T> = {}) => {
  const [data, setData] = useState<T[]>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(initialPage);
  const flatListRef = useRef<FlatList>(null);
  const count = useRef(1);
  const isLoadTriggeredRef = useRef(false);
  const appendData = useCallback(
    (newData: T[]) => {
      setData(prevData => {
        console.log([...prevData, ...newData]);

        return [...prevData, ...newData];
      });
      hasMoreRef.current = getHasMore?.() || false;
    },
    [getHasMore],
  );

  const handleLoadMore = useCallback(async () => {
    const hasMoreVal = getHasMore?.() || false;
    hasMoreRef.current = hasMoreVal;
    if (!hasMoreRef.current || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      if (onLoadMore) {
        const result = await onLoadMore(pageRef.current);
        appendData(result?.posts || []);
      }
      pageRef.current += 1;
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onLoadMore, getHasMore, appendData]);

  useEffect(() => {
    if (initialData && initialData.length > 0 && count.current < 2) {
      setData(initialData);
      count.current++;
    }
  }, [initialData]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hasMoreRef.current || isLoading) {
        return;
      }

      const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
      const scrollPosition = contentOffset.y;
      const visibleLength = layoutMeasurement.height;
      const contentLength = contentSize.height;

      const scrollPercentage = (scrollPosition + visibleLength) / contentLength;

      if (scrollPercentage > threshold) {
        if (!isLoadTriggeredRef.current) {
          isLoadTriggeredRef.current = true;
          handleLoadMore().finally(() => {
            setTimeout(() => {
              isLoadTriggeredRef.current = false;
            }, 2000);
          });
        }
      }
    },
    [isLoading, threshold, handleLoadMore],
  );

  const reset = useCallback(() => {
    setData([]);
    pageRef.current = initialPage;
    hasMoreRef.current = true;
    setIsLoading(false);
  }, [initialPage]);

  const scrollToTop = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({offset: 0, animated: true});
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    pageRef.current = initialPage;
    if (onLoadMore) {
      try {
        await onLoadMore(initialPage);
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        setRefreshing(false);
      }
    } else {
      setRefreshing(false);
    }
  }, [initialPage, onLoadMore]);

  return {
    data,
    setData,
    appendData,
    isLoading,
    hasMore: hasMoreRef.current,
    page: pageRef.current,
    refreshing,
    handleLoadMore,
    handleRefresh,
    reset,
    scrollToTop,
    handleScroll,
    flatListRef,
  };
};

export default useInfiniteScroll;
