import { useState } from "react";
import { 
  Box, Typography, Button, IconButton, OutlinedInput, InputAdornment, Paper 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Icons
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await api.post("/users/signup", form);
      alert("Signup successful!");      
      navigate("/login");
      localStorage.setItem("open_upload_passenger_details", "true");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Signup failed");
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f4f9 0%, #e1e8f0 100%)",
        padding: 2,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Top Logo and Titles */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            mb: 2,
            border: "2px solid #2563eb"
          }}
        >
          <FlightTakeoffIcon sx={{ color: "#2563eb" }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#000", mb: 1, letterSpacing: "-0.5px" }}>
          Flighter AI
        </Typography>
        <Typography sx={{ color: "#2563eb", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
          Create your account
        </Typography>
      </Box>

      {/* Signup Form Card */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: "24px",
          padding: { xs: 3, md: 5 },
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Username Input */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#000", mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Username
          </Typography>
          <OutlinedInput
            fullWidth
            name="username"
            placeholder="johndoe123"
            value={form.username}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <PersonOutlineIcon sx={{ color: "#000", fontSize: 20 }} />
              </InputAdornment>
            }
            sx={{
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              color: "#000",
              fontWeight: 500,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: "2px" }
            }}
          />
        </Box>

        {/* Email Input */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#000", mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Email Address
          </Typography>
          <OutlinedInput
            fullWidth
            name="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <MailOutlineIcon sx={{ color: "#000", fontSize: 20 }} />
              </InputAdornment>
            }
            sx={{
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              color: "#000",
              fontWeight: 500,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: "2px" }
            }}
          />
        </Box>

        {/* Password Input */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#000", mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Password
          </Typography>
          <OutlinedInput
            fullWidth
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: "#000", fontSize: 20 }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{ color: "#000" }}
                >
                  {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            }
            sx={{
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              color: "#000",
              fontWeight: 500,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: "2px" }
            }}
          />
        </Box>

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          endIcon={<ArrowForwardIcon />}
          sx={{
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: 600,
            fontSize: "1rem",
            textTransform: "none",
            borderRadius: "12px",
            padding: "12px 0",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
            "&:hover": {
              backgroundColor: "#1d4ed8",
              boxShadow: "0 6px 20px rgba(37, 99, 235, 0.5)",
            }
          }}
        >
          Create Account
        </Button>
      </Paper>

      {/* Footer Text */}
      <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: "#64748b", fontSize: "0.875rem", fontWeight: 500 }}>
          Already have an account?
        </Typography>
        <Typography 
          onClick={() => navigate("/login")}
          sx={{ 
            color: "#2563eb", 
            fontSize: "0.875rem", 
            fontWeight: 600, 
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" }
          }}
        >
          Sign In
        </Typography>
      </Box>
    </Box>
  );
}