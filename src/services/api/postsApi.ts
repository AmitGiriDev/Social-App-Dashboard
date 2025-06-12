import {enhancedDummyJsonApi} from './index';

// Types for DummyJSON API responses

export interface DummyPost {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  image?: string;
}

export interface DummyComment {
  id: number;
  body: string;
  postId: number;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
}

interface PostsResponse {
  posts: DummyPost[];
  total: number;
  skip: number;
  limit: number;
}

interface CommentsResponse {
  comments: DummyComment[];
  total: number;
  skip: number;
  limit: number;
}

interface CreatePostRequest {
  title: string;
  body: string;
  userId: number;
  tags?: string[];
  reactions?: number;
}

interface UpdatePostRequest {
  id: number;
  title?: string;
  body?: string;
  tags?: string[];
  reactions?: number;
}

// Extend the DummyJSON API with posts endpoints
export const postsApi = enhancedDummyJsonApi.injectEndpoints({
  endpoints: builder => ({
    getPosts: builder.query<PostsResponse, {limit?: number; skip?: number}>({
      query: ({limit = 10, skip = 0} = {}) => ({
        url: 'posts',
        params: {limit, skip},
      }),
      transformResponse: (response: PostsResponse) => response,
      providesTags: result =>
        result?.posts
          ? [
              ...result.posts.map(({id}) => ({
                type: 'DummyPosts' as const,
                id,
              })),
              {type: 'DummyPosts', id: 'LIST'},
            ]
          : [{type: 'DummyPosts', id: 'LIST'}],
    }),
    getPostById: builder.query<DummyPost, number>({
      query: id => `posts/${id}`,
      providesTags: (result, error, id) => [{type: 'DummyPosts', id}],
    }),
    getPostComments: builder.query<DummyComment[], number>({
      query: postId => `comments/post/${postId}`,
      transformResponse: (response: CommentsResponse) => response.comments,
      providesTags: (result, error, postId) => [
        {type: 'DummyPosts', id: `post-${postId}-comments`},
      ],
    }),
    searchPosts: builder.query<DummyPost[], string>({
      query: query => ({
        url: 'posts/search',
        params: {q: query},
      }),
      transformResponse: (response: PostsResponse) => response.posts,
    }),
    getPostsByUser: builder.query<DummyPost[], number>({
      query: userId => ({
        url: `posts/user/${userId}`,
      }),
      transformResponse: (response: {posts: DummyPost[]}) => response.posts,
      providesTags: (result, error, userId) => [
        {type: 'DummyPosts', id: `user-${userId}`},
      ],
    }),
    createPost: builder.mutation<DummyPost, CreatePostRequest>({
      query: newPost => ({
        url: 'posts/add',
        method: 'POST',
        body: {
          ...newPost,
          tags: newPost.tags || [],
          reactions: newPost.reactions || 0,
        },
      }),
      invalidatesTags: [{type: 'DummyPosts', id: 'LIST'}],
    }),
    updatePost: builder.mutation<DummyPost, UpdatePostRequest>({
      query: ({id, ...patch}) => ({
        url: `posts/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, {id}) => [
        {type: 'DummyPosts', id},
        {type: 'DummyPosts', id: 'LIST'},
      ],
    }),
    deletePost: builder.mutation<{id: number; isDeleted: boolean}, number>({
      query: id => ({
        url: `posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        {type: 'DummyPosts', id},
        {type: 'DummyPosts', id: 'LIST'},
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetPostCommentsQuery,
  useSearchPostsQuery,
  useGetPostsByUserQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLazyGetPostsQuery,
} = postsApi;
