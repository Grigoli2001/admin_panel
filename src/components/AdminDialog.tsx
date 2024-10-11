import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { createAdmin } from "../api/auth";
import { useState } from "react";

import { QueryClient } from "@tanstack/react-query";

export default function AdminDialog({
  open,
  onClose,
  queryClient,
  setMessage,
  setAddAdminDialogOpen,
}: {
  open: boolean;
  onClose: () => void;
  queryClient: QueryClient;
  setMessage: (message: string) => void;
  setAddAdminDialogOpen: (open: boolean) => void;
}) {
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });
  const handleAddAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addAdminMutate(newAdmin);
  };
  const { mutate: addAdminMutate, isPending } = useMutation({
    mutationFn: (newAdminData: {
      name: string;
      email: string;
      password: string;
    }) =>
      createAdmin(newAdminData.email, newAdminData.password, newAdminData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setMessage("Succesfully changed status");
      setAddAdminDialogOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setMessage(error.response.data.error);
    },
  });
  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddAdmin} sx={{ mt: 2 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                required
                value={newAdmin.name}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, name: e.target.value })
                }
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                required
                type="email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, email: e.target.value })
                }
              />
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                required
                type="password"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin({ ...newAdmin, password: e.target.value })
                }
              />
            </Box>
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={onClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {isPending ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Add"
                )}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
