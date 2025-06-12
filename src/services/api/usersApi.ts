import {dummyJsonApi} from './index';

// DummyJSON User type (richer data)
interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  ip: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
}

interface DummyUsersResponse {
  users: DummyUser[];
  total: number;
  skip: number;
  limit: number;
}

// Extend the DummyJSON API with user endpoints
export const dummyUsersApi = dummyJsonApi.injectEndpoints({
  endpoints: builder => ({
    getDummyUsers: builder.query<DummyUsersResponse, void>({
      query: () => 'users',
      providesTags: result =>
        result
          ? [
              ...result.users.map(({id}) => ({
                type: 'DummyUsers' as const,
                id,
              })),
              {type: 'DummyUsers', id: 'LIST'},
            ]
          : [{type: 'DummyUsers', id: 'LIST'}],
    }),
    getDummyUserById: builder.query<DummyUser, number>({
      query: id => `users/${id}`,
      providesTags: (result, error, id) => [{type: 'DummyUsers', id}],
    }),
    searchDummyUsers: builder.query<DummyUsersResponse, string>({
      query: query => `users/search?q=${query}`,
      providesTags: [{type: 'DummyUsers', id: 'SEARCH'}],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDummyUsersQuery,
  useGetDummyUserByIdQuery,
  useSearchDummyUsersQuery,
} = dummyUsersApi;
