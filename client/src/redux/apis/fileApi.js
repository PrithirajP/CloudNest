import { apis } from "./baseApi";
import onQueryStarted from "../../utils/handleApisError";
import queryStringGenerator from "../../utils/queryStringGenerator";

const fileApi = apis.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query({
      query: (filters) =>
        queryStringGenerator("/api/v1/files", filters),
      onQueryStarted,
      providesTags: ["Files"],
    }),

    getSingleFile: builder.query({
      query: (id) => `/api/v1/files/${id}`,
      onQueryStarted,
    }),

    uploadFiles: builder.mutation({
      query: (data) => ({
        url: "/api/v1/files",
        method: "POST",
        body: data,
      }),
      onQueryStarted,
      invalidatesTags: ["Files"],
    }),

    updateFile: builder.mutation({
      query: ({ data, ids }) => ({
        url: `/api/v1/files/${ids.join(",")}`,
        method: "PUT",
        body: data,
      }),
      onQueryStarted,
      invalidatesTags: ["Files"],
    }),

    deleteFile: builder.mutation({
      query: ({ ids }) => ({
        url: `/api/v1/files/${ids.join(",")}`,
        method: "DELETE",
      }),
      onQueryStarted,
      invalidatesTags: ["Files"],
    }),

    uploadStreamVideo: builder.mutation({
      query: (data) => ({
        url: "/api/v1/files/upload-stream-video",
        method: "POST",
        body: data,
      }),
      onQueryStarted,
      invalidatesTags: ["StreamVideo"],
    }),

    getStreamVideo: builder.query({
      query: (filename) =>
        queryStringGenerator(
          "/api/v1/files/get-stream-video",
          filename
        ),
      providesTags: ["StreamVideo"],
      onQueryStarted,
    }),
  }),
});

export const {
  useGetFilesQuery,
  useLazyGetSingleFileQuery,
  useUploadFilesMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useUploadStreamVideoMutation,
  useLazyGetStreamVideoQuery,
} = fileApi;
