import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useGetDummyUserByIdQuery} from '../../services/api/usersApi';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
} from '../../utils/constants/theme';
import {logout} from '../../store/slices/authSlice';
import Icon from '../../components/ui/Icon';
import Button from '../../components/ui/Button';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const {
    data: userData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetDummyUserByIdQuery(authUser?.id ?? 1);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleRetry = async () => {
    try {
      await refetch().unwrap();
    } catch (error) {
      console.error('Failed to refetch user data:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator size="large" message="Loading profile data..." />
      </View>
    );
  }

  if (isError || !userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading profile data</Text>
        <Button title="Retry" onPress={handleRetry} variant="ghost" fullWidth />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          tintColor={COLORS.primary}
          title="Pull to refresh"
          titleColor={COLORS.primary}
          colors={[COLORS.primary]}
          refreshing={isFetching}
          onRefresh={handleRetry}
        />
      }>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{uri: userData.image}}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <Text style={styles.userName}>
            {userData.firstName} {userData.lastName}
          </Text>
          {userData.company?.title && (
            <Text style={styles.userTitle}>{userData.company.title}</Text>
          )}
        </View>
      </View>

      {/* User Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoItem}>
          <Icon
            type="MaterialIcons"
            name="email"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>{userData.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon
            type="MaterialIcons"
            name="phone"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>{userData.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon
            type="MaterialIcons"
            name="location-on"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            {userData.address?.address}, {userData.address?.city}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon
            type="MaterialIcons"
            name="work"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>{userData.company?.name}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <View style={styles.additionalInfoContainer}>
          <View style={styles.additionalInfoItem}>
            <Text style={styles.additionalInfoValue}>{userData.age}</Text>
            <Text style={styles.additionalInfoLabel}>Age</Text>
          </View>
          <View style={styles.additionalInfoItem}>
            <Text style={styles.additionalInfoValue}>{userData.gender}</Text>
            <Text style={styles.additionalInfoLabel}>Gender</Text>
          </View>
        </View>
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="secondary"
        style={styles.logoutButton}
        textStyle={styles.logoutButtonText}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.l,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.body,
    textAlign: 'center',
    marginBottom: SPACING.m,
  },
  header: {
    marginBottom: SPACING.l,
  },
  coverPhoto: {
    height: 160,
    backgroundColor: COLORS.lightGray,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  profileContainer: {
    alignItems: 'center',
    // marginTop: -60,
    marginBottom: SPACING.m,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.lightGray,
  },
  userName: {
    fontSize: FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: SPACING.s,
  },
  userTitle: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginHorizontal: SPACING.m,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  infoText: {
    fontSize: FONTS.body,
    color: COLORS.textLight,
    marginLeft: SPACING.s,
    flex: 1,
  },
  additionalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.s,
  },
  additionalInfoItem: {
    alignItems: 'center',
    flex: 1,
    padding: SPACING.s,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.s,
    marginHorizontal: SPACING.xs,
  },
  additionalInfoValue: {
    fontSize: FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  additionalInfoLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: SPACING.xs / 2,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    margin: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
