import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {Controller, Control, FieldValues, Path} from 'react-hook-form';
import {COLORS, FONTS, SPACING} from '../../utils/constants/theme';
import Icon from '../ui/Icon';

interface FormInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  rules?: Record<string, any>;
  secureTextEntry?: boolean;
  icon?: {
    type:
      | 'AntDesign'
      | 'Feather'
      | 'Ionicons'
      | 'MaterialIcons'
      | 'MaterialCommunityIcons';
    name: string;
  };
  containerStyles?: StyleProp<ViewStyle>;
  error?: string;
  ref?: React.RefObject<TextInput>;
}

function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  secureTextEntry: initialSecureTextEntry,
  icon,
  error,
  containerStyles,
  ref,
  ...rest
}: FormInputProps<T>) {
  const [secureTextEntry, setSecureTextEntry] = React.useState(
    initialSecureTextEntry,
  );

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={[styles.container, containerStyles]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: {onChange, onBlur, value},
          fieldState: {error: fieldError},
        }) => (
          <>
            <View
              style={[styles.inputContainer, fieldError && styles.inputError]}>
              {icon && (
                <View style={styles.iconContainer}>
                  <Icon
                    type={icon.type}
                    name={icon.name}
                    size={20}
                    color={COLORS.gray}
                  />
                </View>
              )}
              <TextInput
                ref={ref ?? React.createRef<TextInput>()}
                style={[styles.input, icon && styles.inputWithIcon]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value as string}
                secureTextEntry={secureTextEntry}
                placeholderTextColor={COLORS.gray}
                {...rest}
              />
              {initialSecureTextEntry && (
                <TouchableOpacity
                  style={styles.secureButton}
                  onPress={toggleSecureEntry}
                  activeOpacity={0.7}>
                  <Icon
                    type="Ionicons"
                    name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
              )}
            </View>
            {(fieldError || error) && (
              <Text style={styles.errorText}>
                {fieldError?.message?.toString() || error}
              </Text>
            )}
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: FONTS.body,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: SPACING.m,
    fontSize: FONTS.body,
    color: COLORS.textDark,
  },
  inputWithIcon: {
    paddingLeft: SPACING.xs,
  },
  iconContainer: {
    paddingLeft: SPACING.m,
  },
  secureButton: {
    padding: SPACING.m,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.small,
    marginTop: SPACING.xs,
  },
});

export default FormInput;
