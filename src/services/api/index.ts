import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../utils/storage';

export const dummyJsonApi = createApi({
  reducerPath: 'dummyJsonApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com/',
    prepareHeaders: async headers => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['DummyUsers', 'DummyPosts'],
  endpoints: () => ({}),
});

export const reqresApi = createApi({
  reducerPath: 'reqresApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://reqres.in/api/',
    prepareHeaders: headers => {
      headers.set('x-api-key', 'reqres-free-v1');
      return headers;
    },
  }),
  tagTypes: ['Auth', 'ReqresUsers'],
  endpoints: () => ({}),
});

// Export empty base APIs to be extended in separate files
export const enhancedDummyJsonApi = dummyJsonApi;
export const enhancedReqresApi = reqresApi;
