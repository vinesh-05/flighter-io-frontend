import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  OutlinedInput, 
  InputAdornment, 
  Paper 
} from "@mui/material";

// Icons
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlightIcon from '@mui/icons-material/Flight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Preserved exactly from your original code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token,
          new_password: password
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset successful. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.detail || data.error);
      }

    } catch {
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  const isSuccess = message.toLowerCase().includes("successful");

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
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: "24px",
          padding: { xs: 4, md: 5 },
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          backgroundColor: "#ffffff",
          textAlign: "center"
        }}
      >
        {/* Brand / Logo Area */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5, mb: 3 }}>
          <FlightIcon sx={{ color: "#1976d2", fontSize: 36, transform: "rotate(45deg)" }} />
          <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#0A2540", letterSpacing: "-0.5px" }}>
            Flight AI
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0A2540", mb: 1.5, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          Reset Password
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4, px: 1, lineHeight: 1.5 }}>
          Enter your new password below. Password must be at least 8 characters and include at least one number.
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* New Password Input */}
          <Box sx={{ mb: 3, textAlign: "left" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A2540", mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              New Password
            </Typography>
            <OutlinedInput
              fullWidth
              type="password"
              required
              placeholder="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                color: "#202124",
                fontWeight: 500,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: "2px" }
              }}
            />
          </Box>

          {/* Confirm Password Input */}
          <Box sx={{ mb: 4, textAlign: "left" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0A2540", mb: 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Confirm Password
            </Typography>
            <OutlinedInput
              fullWidth
              type="password"
              required
              placeholder="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                color: "#202124",
                fontWeight: 500,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb", borderWidth: "2px" }
              }}
            />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !password || !confirmPassword || isSuccess}
            endIcon={!loading && <RestartAltIcon />}
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "uppercase",
              borderRadius: "50px", // Pill shape
              padding: "12px 0",
              boxShadow: "0 8px 16px rgba(25, 118, 210, 0.25)",
              "&:hover": {
                backgroundColor: "#1565c0",
                boxShadow: "0 10px 20px rgba(25, 118, 210, 0.35)",
              },
              "&:disabled": {
                backgroundColor: "#cbd5e1",
                color: "#ffffff"
              }
            }}
          >
            {loading ? "RESETTING..." : "RESET PASSWORD"}
          </Button>
        </form>

        {/* Dynamic Message Alert */}
        {message && (
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              borderRadius: "12px", 
              backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`
            }}
          >
            <Typography sx={{ 
              fontSize: "0.85rem", 
              fontWeight: 600, 
              color: isSuccess ? "#16a34a" : "#ef4444" 
            }}>
              {message}
            </Typography>
          </Box>
        )}

        {/* Back Link */}
        <Button
          variant="text"
          onClick={() => navigate("/login")}
          startIcon={<ArrowBackIcon fontSize="small" />}
          sx={{
            mt: 4,
            color: "#64748b",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "transparent",
              color: "#202124"
            }
          }}
        >
          Back to Sign In
        </Button>
      </Paper>
    </Box>
  );
}