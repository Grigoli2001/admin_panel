// BlogForm.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlog, editBlog } from "../api/blog";
import { Blog } from "../types/blog.types";

interface BlogFormProps {
  initialData?: Blog | null;
  onClose: () => void;
  isEditing?: boolean;
}

const BlogForm: React.FC<BlogFormProps> = ({
  initialData,
  onClose,
  isEditing,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.content || "");
  const [image, setImage] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const createBlogMutation = useMutation({
    mutationFn: (formData: FormData) => createBlog(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
  });

  const editBlogMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      editBlog(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", description);
    if (image) formData.append("image", image); // Image upload

    if (isEditing && initialData) {
      editBlogMutation.mutate({ id: initialData._id, formData });
    } else {
      createBlogMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>{isEditing ? "Edit Blog" : "Add New Blog"}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              required
              inputProps={{ maxLength: 120 }} // Validation for title length
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              required
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
            />
          </Box>
          <DialogActions sx={{ mt: 3 }}>
            <Button onClick={onClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? "Update Blog" : "Add Blog"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BlogForm;
