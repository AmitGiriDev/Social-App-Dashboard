import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {store} from './src/store';
import RootNavigator from './src/navigation';
import {initializeAuth} from './src/store/slices/authSlice';
// Initialize vector icons
import {LogBox} from 'react-native';

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
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
