import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdmins, toggleAdminStatus } from "../api/admin";
import { Admin } from "../types/admin.types";
import { createAdmin } from "../api/auth";
import {
  Container,
  Button,
  Typography,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  TextField,
} from "@mui/material";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

const AdminListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [addAdminDialogOpen, setAddAdminDialogOpen] = React.useState(false);
  const [selectedAdmin, setSelectedAdmin] = React.useState<{
    id: string;
    status: string | null;
  } | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [newAdmin, setNewAdmin] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const {
    data: admins,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
  });

  const mutation = useMutation({
    mutationFn: ({
      adminId,
      status,
    }: {
      adminId: string;
      status: string | null;
    }) => toggleAdminStatus(adminId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
  const addAdminMutation = useMutation({
    mutationFn: (newAdminData: {
      name: string;
      email: string;
      password: string;
    }) =>
      createAdmin(newAdminData.email, newAdminData.password, newAdminData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setOpenSnackbar(true); // Show success notification
      setAddAdminDialogOpen(false); // Close add admin dialog
    },
  });

  const rows: GridRowsProp = Array.isArray(admins)
    ? admins.map((admin: Admin) => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        status: admin.status,
        createdAt:
          admin.created_at && new Date(admin.created_at).toLocaleString(),
      }))
    : [];

  const columns: GridColDef[] = [
    // { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "createdAt", headerName: "Created At", width: 300 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      filterable: false,
      sortable: false,
      renderCell: (params) => (
        <Button
          onClick={() =>
            handleDialogOpen(params.row.id as string, params.row.status)
          }
          variant="contained"
          fullWidth
          color={params.row.status == "active" ? "secondary" : "primary"}
        >
          {params.row.status == "active" ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  const handleDialogOpen = (adminId: string, status: string | null) => {
    setSelectedAdmin({ id: adminId, status });
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAdmin(null);
  };
  const handleAddAdminOpen = () => {
    setAddAdminDialogOpen(true);
  };

  const handleAddAdminClose = () => {
    setAddAdminDialogOpen(false);
  };
  const handleAddAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addAdminMutation.mutate(newAdmin);
  };

  const handleToggleStatus = () => {
    if (selectedAdmin) {
      mutation.mutate({
        adminId: selectedAdmin.id,
        status: null,
      });
    }
    setDialogOpen(false);
  };
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  if (error) return <Typography>Error fetching admins.</Typography>;

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Admins List</Typography>
        {/* Add Admin Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddAdminOpen}
        >
          Add Admin
        </Button>
      </Box>
      <DataGrid
        sx={{ minHeight: 600 }}
        pagination
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
        }}
        pageSizeOptions={[10, 15, 25]}
        loading={isLoading}
        slotProps={{
          loadingOverlay: {
            variant: "skeleton",
            noRowsVariant: "skeleton",
          },
        }}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        disableEnforceFocus
        disableRestoreFocus
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{" "}
            {selectedAdmin?.status === "active" ? "deactivate" : "activate"}{" "}
            this admin?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleToggleStatus} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Admin Dialog */}
      <Dialog open={addAdminDialogOpen} onClose={handleAddAdminClose}>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddAdmin} sx={{ mt: 2 }}>
            {/* Box as layout container for the form */}
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
              <Button onClick={handleAddAdminClose} color="primary">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Add Admin
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Admin status updated successfully"
      />
    </Container>
  );
};

export default AdminListPage;
