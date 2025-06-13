import React from 'react';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {store} from './src/store';
import RootNavigator from './src/navigation';
import {initializeAuth} from './src/store/slices/authSlice';
// Initialize vector icons
import {LogBox, SafeAreaView} from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Initialize auth state
store.dispatch(initializeAuth());

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <SafeAreaView style={{flex: 1}}>
          <RootNavigator />
        </SafeAreaView>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
