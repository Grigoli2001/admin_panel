import api from "../hooks/axios";

import { blogRequests } from "../constants/requests";
import { BlogResponse } from "../types/blog.types";

export const createBlog = async (formData: FormData): Promise<Response> => {
  const response = await api.post(
    blogRequests.createBlog.url,
    {
      formData,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const editBlog = async (
  id: string,
  formData: FormData
): Promise<Response> => {
  const response = await api.put(blogRequests.editBlog.url + id, {
    formData,
  });
  return response.data;
};

export const toggleBlogStatus = async (
  id: string,
  status?: string
): Promise<Response> => {
  const response = await api.put(blogRequests.toggleBlogStatus.url + id, {
    status,
  });
  return response.data;
};

export const getBlogs = async (
  page: number | null = null,
  limit: number | null = null,
  status: string = "",
  title: string = ""
): Promise<BlogResponse> => {
  const response = await api.get(
    blogRequests.getBlogs.url +
      `?page=${page}&limit=${limit}&status=${status}&title=${title}`
  );
  return response.data;
};
