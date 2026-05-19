import { getToken } from "@/app/tokenHleper";
import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",

  // baseQuery: fetchBaseQuery({
  //   baseUrl: "http://192.168.1.120:3000",
  // }),
   baseQuery: fetchBaseQuery({
    baseUrl: "http://192.168.1.120:3000",

    prepareHeaders: (headers) => {
      const token = getToken();
      console.log("tokennsss" , token)
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

login: builder.mutation({
  query: (body) => ({
    url: "/auth/login",
    method: "POST",
    body,
  }),
}),
forgotPassword: builder.mutation({
  query: (body) => ({
    url: "/auth/forgot-password",
    method: "POST",
    body,
  }),
}),
createOrder: builder.mutation({
  query: (body) => ({
    url: "/orders",
    method: "POST",
    body,
  }),
}),
getMyOrders: builder.query({
  query: () => ({
    url: "/orders/my",
    method: "GET",
  }),
}),


    getProducts: builder.query<any, void>({
      query: () => "/products",
    }),
  }),
});

export const {
  useGetProductsQuery,
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
} = productsApi;