import React from 'react';
import {StyleProp, TextStyle} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import {COLORS} from '../../utils/constants/theme';

export type IconType =
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'Fontisto'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';

interface IconProps {
  type: IconType;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}

const Icon: React.FC<IconProps> = ({
  type,
  name,
  size = 24,
  color = COLORS.text,
  style,
  onPress,
}) => {
  const getIconComponent = () => {
    switch (type) {
      case 'AntDesign':
        return (
          <AntDesign
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'Entypo':
        return (
          <Entypo
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'EvilIcons':
        return (
          <EvilIcons
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'Feather':
        return (
          <Feather
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'FontAwesome':
        return (
          <FontAwesome
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'FontAwesome5':
        return (
          <FontAwesome5
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'Fontisto':
        return (
          <Fontisto
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'Foundation':
        return (
          <Foundation
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'Ionicons':
        return (
          <Ionicons
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'MaterialCommunityIcons':
        return (
          <MaterialCommunityIcons
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'MaterialIcons':
        return (
          <MaterialIcons
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'Octicons':
        return (
          <Octicons
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'SimpleLineIcons':
        return (
          <SimpleLineIcons
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      case 'Zocial':
        return (
          <Zocial
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
      default:
        return (
          <MaterialIcons
            name={name}
            size={size}
            color={color}
            style={style}
            onPress={onPress}
          />
        );
    }
  };

  return getIconComponent();
};

export default Icon;
