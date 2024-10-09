import * as React from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "../api/blog";
import { Blog } from "../types/blog.types";
import CreateBlogForm from "../components/CreateBlog";
import {
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
} from "@mui/material";

const SyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: 0,
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  "&:focus-visible": {
    outline: "3px solid",
    outlineColor: "hsla(210, 98%, 48%, 0.5)",
    outlineOffset: "2px",
  },
}));

const SyledCardContent = styled(CardContent)({
  display: "flex",
  flexDirection: "column",
  gap: 4,
  padding: 16,
  flexGrow: 1,
  "&:last-child": {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

function Author({ name, updated_at }: { name: string; updated_at: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          alignItems: "center",
        }}
      >
        <AvatarGroup max={3}>
          <Avatar
            alt={name}
            src="/static/images/avatar/1.jpg"
            sx={{ width: 24, height: 24 }}
          />
        </AvatarGroup>
        <Typography variant="caption">{name}</Typography>
      </Box>
      <Typography variant="caption">
        {new Date(updated_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
        })}
      </Typography>
    </Box>
  );
}

export default function BlogPage() {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [filterTitle, setFilterTitle] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<string>("");
  const [filterCategory, setFilterCategory] = React.useState<string>("");
  const PAGESIZE = 8;
  const navigate = useNavigate();

  const { data: blogs, isLoading } = useQuery({
    queryKey: [
      "blogs",
      page,
      PAGESIZE,
      filterStatus,
      filterCategory,
      filterTitle,
    ],
    queryFn: () =>
      getBlogs(page, PAGESIZE, filterStatus, filterCategory, filterTitle),
  });
  console.log("blogs", blogs);

  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handleCategory = (category: string) => {
    if (category === "all") {
      setFilterCategory("");
    } else {
      setPage(1);
      setFilterCategory(category);
    }
  };

  const handleBlogClick = (blogId: string) => {
    navigate(`/blog/${blogId}`);
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          flexDirection: "row",
          gap: 1,
          width: { xs: "100%", md: "fit-content" },
          overflow: "auto",
        }}
      >
        <FormControl
          sx={{ width: { xs: "100%", md: "25ch" } }}
          variant="outlined"
        >
          <OutlinedInput
            size="small"
            id="search"
            placeholder="Search…"
            sx={{ flexGrow: 1 }}
            startAdornment={
              <InputAdornment position="start" sx={{ color: "text.primary" }}>
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            }
            inputProps={{
              "aria-label": "search",
            }}
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
          />
        </FormControl>
        <IconButton size="small" aria-label="RSS feed">
          <AddCircleOutlineIcon onClick={handleOpenCreateDialog} />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          width: "100%",
          justifyContent: "space-between",
          alignItems: { xs: "start", md: "center" },
          gap: 4,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "row",
            gap: 3,
            overflow: "auto",
          }}
        >
          <Chip
            onClick={() => handleCategory("all")}
            size="medium"
            label="All categories"
            sx={{
              backgroundColor:
                filterCategory === "" ? "primary.main" : "transparent",
              color: filterCategory === "" ? "white" : "text.primary",
              ":hover": { backgroundColor: "primary.main" },
            }}
          />
          <Chip
            onClick={() => handleCategory("company")}
            size="medium"
            label="Company"
            sx={{
              backgroundColor:
                filterCategory === "company" ? "primary.main" : "transparent",
              color: filterCategory === "company" ? "white" : "text.primary",
              ":hover": { backgroundColor: "primary.main" },
            }}
          />
          <Chip
            onClick={() => handleCategory("product")}
            size="medium"
            label="Product"
            sx={{
              backgroundColor:
                filterCategory === "product" ? "primary.main" : "transparent",
              color: filterCategory === "product" ? "white" : "text.primary",
              ":hover": { backgroundColor: "primary.main" },
            }}
          />
          <Chip
            onClick={() => handleCategory("design")}
            size="medium"
            label="Design"
            sx={{
              backgroundColor:
                filterCategory === "design" ? "primary.main" : "transparent",
              color: filterCategory === "design" ? "white" : "text.primary",
              ":hover": { backgroundColor: "primary.main" },
            }}
          />
          <Chip
            onClick={() => handleCategory("engineering")}
            size="medium"
            label="Engineering"
            sx={{
              backgroundColor:
                filterCategory === "engineering"
                  ? "primary.main"
                  : "transparent",
              color:
                filterCategory === "engineering" ? "white" : "text.primary",
              ":hover": { backgroundColor: "primary.main" },
            }}
          />
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "row",
            gap: 1,
            width: { xs: "100%", md: "fit-content" },
            overflow: "auto",
          }}
        >
          <FormControl
            sx={{ minWidth: 120, ":focus": { borderColor: "green" } }}
            variant="standard"
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            sx={{ width: { xs: "100%", md: "25ch" } }}
            variant="outlined"
          >
            <OutlinedInput
              size="small"
              id="search"
              placeholder="Search…"
              sx={{ flexGrow: 1 }}
              startAdornment={
                <InputAdornment position="start" sx={{ color: "text.primary" }}>
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              }
              inputProps={{
                "aria-label": "search",
              }}
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
            />
          </FormControl>
          <IconButton size="small" aria-label="RSS feed">
            <AddCircleOutlineIcon onClick={handleOpenCreateDialog} />
          </IconButton>
        </Box>
      </Box>
      <Grid container spacing={2} columns={12}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <Grid
                key={index}
                size={{ xs: 12, md: index < 2 ? 6 : 4 }} // First two skeletons are md:6, others md:4
              >
                <Skeleton
                  sx={{ bgcolor: "grey.600", mt: 1 }}
                  variant="rounded"
                  width="100%"
                  height={200}
                  animation="wave"
                />
                <Skeleton
                  sx={{ bgcolor: "grey.600", mt: 1 }}
                  variant="rounded"
                  width="100%"
                  height={10}
                  animation="wave"
                />
                <Skeleton
                  sx={{ bgcolor: "grey.600", mt: 1 }}
                  variant="rounded"
                  animation="wave"
                  width="100%"
                  height={10}
                />
                <Skeleton
                  sx={{ bgcolor: "grey.600", mt: 1 }}
                  animation="wave"
                  variant="rounded"
                  width="100%"
                  height={10}
                />
              </Grid>
            ))
          : blogs?.blogs.map((blog: Blog, index) => (
              <Grid size={{ xs: 12, md: index < 2 ? 6 : 4 }} key={blog._id}>
                <SyledCard
                  variant="outlined"
                  onFocus={() => handleFocus(0)}
                  onBlur={handleBlur}
                  tabIndex={0}
                  className={focusedCardIndex === 0 ? "Mui-focused" : ""}
                  onClick={() => handleBlogClick(blog._id)}
                >
                  {blog.image ? (
                    <CardMedia
                      component="img"
                      alt="green iguana"
                      image={blog.image}
                      aspect-ratio="16 / 9"
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ) : null}
                  <SyledCardContent>
                    <Typography gutterBottom variant="caption" component="div">
                      {blog.category}
                    </Typography>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{ maxWidth: "80%", overflowWrap: "break-word" }}
                    >
                      {blog.title}
                    </Typography>
                    <StyledTypography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {blog.content}
                    </StyledTypography>
                  </SyledCardContent>
                  <Author
                    name={blog.author.name ?? "Unknown Author"}
                    updated_at={blog.updated_at}
                  />
                </SyledCard>
              </Grid>
            ))}
      </Grid>
      <Pagination
        sx={{ display: "flex", justifyContent: "right", gap: 2 }}
        count={blogs?.totalPages ?? 0}
        page={page}
        onChange={(_event, value) => setPage(value)}
      />
      <CreateBlogForm
        open={createDialogOpen}
        handleClose={handleCloseCreateDialog}
      />
    </Box>
  );
}
