// BlogDetailPage.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBlogById } from "../api/blog";
import BlogForm from "../components/BlogForm";

interface BlogDetailPageProps {
  isEditing: boolean;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ isEditing }) => {
  const { id } = useParams<{ id: string }>();
  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id!),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!blog) return <div>Blog not found</div>;

  return (
    <BlogForm
      initialData={blog}
      isEditing={isEditing}
      onClose={() => window.history.back()}
    />
  );
};

export default BlogDetailPage;
