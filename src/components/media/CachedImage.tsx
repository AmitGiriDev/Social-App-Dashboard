import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  StyleProp,
  ImageStyle,
} from 'react-native';
import FastImage, {
  FastImageProps,
  ImageStyle as FastImageStyle,
} from 'react-native-fast-image';
import {COLORS} from '../../utils/constants/theme';

interface CachedImageProps extends Omit<FastImageProps, 'style'> {
  style?: StyleProp<ImageStyle>;
  showLoader?: boolean;
  loaderColor?: string;
  fallbackSource?: number | {uri: string};
}

const CachedImage: React.FC<CachedImageProps> = ({
  source,
  style,
  showLoader = true,
  loaderColor = COLORS.primary,
  fallbackSource,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const imageSource = error || !source ? fallbackSource : source;

  return (
    <View style={[styles.container, style]}>
      {imageSource && (
        <FastImage
          source={imageSource}
          style={[styles.image, style as FastImageStyle]}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          resizeMode={FastImage.resizeMode.cover}
          {...rest}
        />
      )}
      {loading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={loaderColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CachedImage;
