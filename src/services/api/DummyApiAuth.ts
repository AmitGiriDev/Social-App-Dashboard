import {dummyJsonApi, enhancedDummyJsonApi} from './index';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';

// Define response types
export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  image: string;
  accessToken: string;
  refreshToken: string;
  error?: string;
}

// For user update
export interface UserUpdateRequest {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
}

export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age?: number;
  gender?: 'male' | 'female';
  email: string;
  phone?: string;
  username?: string;
  image?: string;
  address?: {
    address?: string;
    city?: string;
    postalCode?: string;
    state?: string;
  };
  company?: {
    name?: string;
    title?: string;
    department?: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
}

// Extend the reqresApi with auth endpoints
export const dummyAuthApi = dummyJsonApi.injectEndpoints({
  endpoints: builder => ({
    dummyLogin: builder.mutation<AuthResponse, LoginRequest>({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => {
        return response;
      },
      transformErrorResponse: (response: FetchBaseQueryError) => {
        const errorMessage =
          typeof response.data === 'object' &&
          response.data !== null &&
          'error' in response.data
            ? String(response.data.error)
            : 'Login failed';
        return {error: errorMessage};
      },
    }),
    dummyRegister: builder.mutation<AuthResponse, RegisterRequest>({
      query: userData => ({
        url: 'auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: AuthResponse) => {
        return response;
      },
      transformErrorResponse: (response: FetchBaseQueryError) => {
        const errorMessage =
          typeof response.data === 'object' &&
          response.data !== null &&
          'error' in response.data
            ? String(response.data.error)
            : 'Registration failed';
        return {error: errorMessage};
      },
    }),
    updateDummyUser: builder.mutation<UserData, UserUpdateRequest>({
      query: ({id, ...userData}) => ({
        url: `users/${id}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: userData,
      }),
      transformResponse: (response: UserData) => {
        return response;
      },
      transformErrorResponse: (response: FetchBaseQueryError) => {
        const errorMessage =
          typeof response.data === 'object' &&
          response.data !== null &&
          'error' in response.data
            ? String(response.data.error)
            : 'Profile update failed';
        return {error: errorMessage};
      },
      // Invalidate user data cache when profile is updated
      invalidatesTags: (result, error, {id}) => [{type: 'DummyUsers', id}],
    }),
  }),
  overrideExisting: false,
});

export const {
  useDummyLoginMutation,
  useDummyRegisterMutation,
  useUpdateDummyUserMutation,
} = dummyAuthApi;
