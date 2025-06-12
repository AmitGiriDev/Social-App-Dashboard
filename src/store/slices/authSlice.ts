import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import storage, {STORAGE_KEYS} from '../../utils/storage';
import {AppDispatch} from '..';

// Define types for our state
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  image: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};
// Create the slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
      state.isLoading = false;
    },
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;

      storage.setItem(STORAGE_KEYS.USER_DATA, action.payload);
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.accessToken);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout: state => {
      state.user = null;
      state.isAuthenticated = false;

      storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      storage.removeItem(STORAGE_KEYS.USER_DATA);
    },
    clearError: state => {
      state.error = null;
    },
  },
});

const initializeAuth = () => async (dispatch: AppDispatch) => {
  try {
    console.log('Initializing auth state...');
    const user = await storage.getItem<User>(STORAGE_KEYS.USER_DATA);
    dispatch(authSlice.actions.initializeAuth(user));
  } catch (error) {
    console.error('Failed to initialize auth state:', error);
    dispatch(authSlice.actions.initializeAuth(null));
  }
};

export const {loginStart, loginSuccess, loginFailure, logout, clearError} =
  authSlice.actions;
export {initializeAuth};
export default authSlice.reducer;
