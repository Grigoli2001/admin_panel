import { Skeleton, CardMedia, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Blog } from "../types/blog.types";
import {
  SyledCard,
  SyledCardContent,
  StyledTypography,
} from "../styles/customComponents";
import { Author } from "./BlogPageComponents";

export default function BlogList({
  isLoading,
  blogs,
  handleBlogClick,
  focusedCardIndex,
  handleFocus,
  handleBlur,
}: {
  isLoading: boolean;
  blogs: Blog[] | null;
  handleBlogClick: (id: string) => void;
  focusedCardIndex: number | null;
  handleFocus: (index: number) => void;
  handleBlur: () => void;
}) {
  return (
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
        : blogs?.map((blog: Blog, index) => (
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
  );
}
