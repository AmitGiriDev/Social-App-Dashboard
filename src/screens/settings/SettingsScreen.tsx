import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {logout} from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <Button
        title="Logout"
        onPress={() => dispatch(logout())}
        variant="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SettingsScreen;
