import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle checkbox state
  const handleRememberMeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRememberMe(event.target.checked);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    setLoading(true);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email");
      setLoading(false);
      return;
    }
    if (!password || password.length < 8) {
      setPasswordError(true);
      setPasswordErrorMessage("Please enter a valid password");
      setLoading(false);
      return;
    }

    await loginUser(email, password, rememberMe);
  };

  const loginUser = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    await login(email, password, rememberMe)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error(error);
        if (error.response?.status === 404) {
          console.error("Invalid email or password.");
          setEmailError(true);
          setEmailErrorMessage("Invalid email or password.");
          setPasswordError(true);
          setPasswordErrorMessage("Invalid email or password.");
        }
        if (error.response?.status === 403) {
          console.error("Account is inactive.");
          setEmailError(true);
          setEmailErrorMessage("Account is inactive.");
        }
        setLoading(false);
      });
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Card sx={{ width: "100%", boxShadow: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                Sign in
              </Typography>

              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ width: "100%" }}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={emailError}
                  helperText={emailErrorMessage}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange} // Track checkbox state
                      color="primary"
                    />
                  }
                  label="Remember me"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{
                    mt: 2,
                    mb: 2,
                    height: 50,
                    background: "linear-gradient(to right, #6a11cb, #2575fc)",
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SignIn;
