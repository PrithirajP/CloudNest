import { apis } from "./baseApi";
import onQueryStarted from "../../utils/handleApisError";

const authApi = apis.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => ({
        url: "/api/v1/auth/me",
      }),
      onQueryStarted,
      providesTags: ["Auth"],
    }),

    signup: builder.mutation({
      query: (data) => ({
        url: "/api/v1/auth/signup",
        method: "POST",
        body: data,
      }),
      onQueryStarted,
    }),

    login: builder.mutation({
      query: (data) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: data,
      }),
      onQueryStarted,
      invalidatesTags: ["Auth", "Files"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      onQueryStarted,
      invalidatesTags: ["Auth", "Files"],
    }),

    twoFactorAuth: builder.mutation({
      query: (data) => ({
        url: "/api/v1/auth/two-factor-auth",
        method: "POST",
        body: data,
      }),
      onQueryStarted,
    }),

    verifyTwoFactorAuth: builder.mutation({
      query: (data) => ({
        url: "/api/v1/auth/verify-two-factor-auth",
        method: "POST",
        body: data,
      }),
      onQueryStarted,
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useTwoFactorAuthMutation,
  useVerifyTwoFactorAuthMutation,
} = authApi;
