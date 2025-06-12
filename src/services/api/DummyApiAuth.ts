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
  }),
  overrideExisting: false,
});

export const {useDummyLoginMutation, useDummyRegisterMutation} = dummyAuthApi;
