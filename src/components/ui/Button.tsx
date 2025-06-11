import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import Icon from './Icon';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: {
    type:
      | 'AntDesign'
      | 'Feather'
      | 'Ionicons'
      | 'MaterialIcons'
      | 'MaterialCommunityIcons';
    name: string;
    position?: 'left' | 'right';
  };
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
  onPress,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {damping: 10, stiffness: 200});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 10, stiffness: 200});
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  // Determining button styles based on variant and size
  const getButtonStyles = () => {
    let buttonStyle: ViewStyle = {};
    let textColor: string = COLORS.white;

    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: COLORS.primary,
        };
        textColor = COLORS.white;
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: COLORS.secondary,
        };
        textColor = COLORS.white;
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: COLORS.primary,
        };
        textColor = COLORS.primary;
        break;
      case 'ghost':
        buttonStyle = {
          backgroundColor: 'transparent',
        };
        textColor = COLORS.primary;
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.m,
          borderRadius: 6,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SPACING.m,
          paddingHorizontal: SPACING.l,
          borderRadius: 8,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: SPACING.l,
          paddingHorizontal: SPACING.xl,
          borderRadius: 10,
        };
        break;
    }

    // Disabled style
    if (disabled) {
      buttonStyle = {
        ...buttonStyle,
        backgroundColor:
          variant === 'outline' || variant === 'ghost'
            ? 'transparent'
            : COLORS.lightGray,
        borderColor:
          variant === 'outline' ? COLORS.lightGray : buttonStyle.borderColor,
        opacity: 0.7,
      };
      textColor =
        variant === 'outline' || variant === 'ghost'
          ? COLORS.gray
          : COLORS.darkGray;
    }

    // Full width style
    if (fullWidth) {
      buttonStyle = {
        ...buttonStyle,
        width: '100%',
      };
    }

    return {buttonStyle, textColor};
  };

  const {buttonStyle, textColor} = getButtonStyles();

  // Getting text size based on button size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return FONTS.small;
      case 'large':
        return FONTS.h5;
      default:
        return FONTS.body;
    }
  };

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || icon.position !== position) return null;

    return (
      <Icon
        type={icon.type}
        name={icon.name}
        size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
        color={textColor}
        style={position === 'left' ? styles.leftIcon : styles.rightIcon}
      />
    );
  };

  return (
    <AnimatedTouchable
      style={[styles.button, buttonStyle, animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {renderIcon('left')}
          <Text
            style={[
              styles.text,
              {color: textColor, fontSize: getTextSize()},
              textStyle,
            ]}>
            {title}
          </Text>
          {renderIcon('right')}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
});

export default Button;
