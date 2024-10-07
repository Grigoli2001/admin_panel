import React from "react";
import { getBlogs } from "../api/blog";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";

const BlogPage: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    data: blogs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogs"],
    queryFn: () => getBlogs(null, 10, "", ""),
  });

  console.log("blogs", blogs);
  console.log("isLoading", isLoading);
  console.log("isError", isError);
  console.log("user", user);

  return (
    <div>
      <h1>Blogs</h1>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {blogs && (
        <ul>
          {blogs.blogs?.map((blog) => (
            <li key={blog._id}>{blog.title}</li>
          ))}
        </ul>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default BlogPage;
