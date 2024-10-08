import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBlogById, editBlog } from "../api/blog";
import { capitalize } from "../utils/utils";
import {
  Box,
  Typography,
  Button,
  TextField,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Input,
} from "@mui/material";
import { useAuth } from "../context/useAuth";
import Grid from "@mui/material/Grid2";

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlog, setEditedBlog] = useState({
    title: "",
    content: "",
    status: "active",
    image: "" as string | File,
    category: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id!),
  });
  const mutation = useMutation({
    mutationFn: ({
      blogId,
      formData,
    }: {
      blogId: string;
      formData: FormData;
    }) => editBlog(blogId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      setIsEditing(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.log("error", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    },
  });

  const handleEditToggle = () => {
    if (user?.username !== blog?.author.name && !isSuperAdmin) {
      setErrorMessage("You do not have permission to edit this blog.");
      setIsEditing(false);
      return;
    }
    if (blog) {
      setEditedBlog({
        title: blog.title,
        content: blog.content,
        status: blog.status,
        image: blog.image,
        category: blog.category,
      });
    }
    setIsEditing(!isEditing);
  };
  const isEdited = () => {
    return (
      editedBlog.title !== blog?.title ||
      editedBlog.content !== blog?.content ||
      editedBlog.status !== blog?.status ||
      editedBlog.image !== blog?.image ||
      editedBlog.category !== blog?.category
    );
  };
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleSave = async () => {
    const edited = isEdited();
    if (id && editedBlog && edited) {
      console.log("editedBlog", editedBlog);
      const formdata = new FormData();
      formdata.append("title", editedBlog.title);
      formdata.append("content", editedBlog.content);
      formdata.append("category", editedBlog.category);
      formdata.append("status", editedBlog.status);
      formdata.append("image", editedBlog.image);

      mutation.mutate({ blogId: id, formData: formdata });
    } else {
      setIsEditing(false);
    }
  };

  // Handle the new image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Generate a preview URL for the new image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl); // Update the image preview

      // Update the edited blog with the selected file
      setEditedBlog({
        ...editedBlog,
        image: file,
      });
    }
  };

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </Grid>
      </Grid>
    );
  }

  if (!blog) return <div>Blog not found</div>;

  return (
    <Box sx={{ maxWidth: "100%", p: 2 }}>
      <Grid container spacing={2}>
        {/* Blog Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isEditing ? (
              <TextField
                label="Blog Title"
                value={editedBlog.title}
                onChange={(e) =>
                  setEditedBlog({ ...editedBlog, title: e.target.value })
                }
              />
            ) : (
              <Typography variant="h4">{blog.title}</Typography>
            )}

            {isEditing ? (
              <TextField
                label="Blog Content"
                value={editedBlog.content}
                onChange={(e) =>
                  setEditedBlog({ ...editedBlog, content: e.target.value })
                }
                multiline
                rows={6}
              />
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {blog.content}
              </Typography>
            )}

            {isEditing && (blog.image || imagePreview) ? (
              <Box
                component="img"
                src={imagePreview || blog.image}
                alt={blog.title}
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  cursor: "pointer", // Make the image look clickable
                  border: "2px solid", // Optional styling for edit mode
                  borderColor: "primary.main",
                }}
                onClick={handleImageClick} // Trigger input click on image click
              />
            ) : blog.image ? (
              <Box
                component="img"
                src={blog.image}
                alt={blog.title}
                sx={{ maxWidth: "100%", height: "auto" }}
              />
            ) : null}

            {/* Hidden file input */}
            {isEditing && (
              <Input
                sx={{ display: "none" }} // Hide the input field
                type="file"
                inputRef={fileInputRef} // Connect the ref to the input
                onChange={handleImageChange} // Handle the file change
              />
            )}
            {isEditing && !blog.image && !imagePreview && (
              <Input
                type="file"
                inputRef={fileInputRef} // Connect the ref to the input
                onChange={handleImageChange} // Handle the file change
              />
            )}
          </Box>
        </Grid>

        {/* Blog Meta Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1">
              Author: {blog.author.name}
            </Typography>
            <Typography variant="subtitle2">
              Last updated: {new Date(blog.updated_at).toLocaleString()}
            </Typography>
            <Typography
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography component={"span"} sx={{ mr: 2 }}>
                Category
              </Typography>
              {isEditing ? (
                <FormControl
                  sx={{
                    minWidth: 120,
                    ":focus": { borderColor: "green" },
                    height: 40,
                    ml: 1,
                    alignItems: "center",
                  }}
                  variant="outlined"
                >
                  <Select
                    value={blog.category}
                    onChange={(e) =>
                      setEditedBlog({ ...editedBlog, category: e.target.value })
                    }
                    size="small"
                    variant="outlined"
                  >
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="engineering">Engineering</MenuItem>
                    <MenuItem value="design">Design</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                capitalize(blog.category)
              )}
            </Typography>
            <Typography
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography component={"span"} sx={{ mr: 2 }}>
                Status
              </Typography>
              {isEditing ? (
                <FormControl
                  sx={{
                    minWidth: 120,
                    ":focus": { borderColor: "green" },
                    height: 40,
                    ml: 1,
                    alignItems: "center",
                  }}
                  variant="outlined"
                >
                  <Select
                    value={editedBlog.status}
                    onChange={(e) =>
                      setEditedBlog({ ...editedBlog, status: e.target.value })
                    }
                    size="small"
                    variant="outlined"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                capitalize(blog.status)
              )}
            </Typography>

            {/* Edit / Save Button */}
            <Button
              variant="contained"
              onClick={isEditing ? handleSave : handleEditToggle}
              color={isEditing ? "primary" : "secondary"}
            >
              {isEditing ? "Save Changes" : "Edit Blog"}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={errorMessage ? true : false}
        autoHideDuration={6000}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    </Box>
  );
};

export default BlogDetailPage;
