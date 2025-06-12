import {enhancedReqresApi} from './index';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';

// Define response types
export interface AuthResponse {
  id?: number;
  token: string;
  name?: string;
  email?: string;
  error?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// Extend the reqresApi with auth endpoints
export const authApi = enhancedReqresApi.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: credentials => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: {token: string}) => {
        return {token: response.token};
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
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: userData => ({
        url: 'register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: {token: string; id: number}) => {
        return {token: response.token, id: response.id};
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

export const {useLoginMutation, useRegisterMutation} = authApi;
