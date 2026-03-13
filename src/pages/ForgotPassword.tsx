import { useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  OutlinedInput, 
  InputAdornment, 
  Paper 
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Icons
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import FlightIcon from '@mui/icons-material/Flight';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // 🔹 Preserved exactly from your original code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await res.json();
      const msg = data.message || data.detail || "Something went wrong";

      setMessage(msg);

      // detect rate limit
      if (msg.toLowerCase().includes("too many")) {
        setBlocked(true);
      }

    } catch {
      setMessage("Server error. Please try again.");
    }

    setLoading(false);
  };

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
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "16px",
              backgroundColor: "#f4f9ff",
              border: "2px solid #2563eb",
              transform: "rotate(10deg)", // Gives it that modern app icon feel
            }}
          >
            <FlightIcon sx={{ color: "#2563eb", fontSize: 32, transform: "rotate(35deg)" }} />
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#202124", mb: 1, letterSpacing: "-0.5px" }}>
          Forgot Password?
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4, px: 1 }}>
          No worries, we've got you covered. Enter your email and we'll send a reset link.
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Email Input Area */}
          <Box sx={{ mb: 4, textAlign: "left" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 1.5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Email Address
            </Typography>
            <OutlinedInput
              fullWidth
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
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
            disabled={loading || blocked}
            endIcon={!loading && !blocked && <SendRoundedIcon />}
            sx={{
              backgroundColor: blocked ? "#9ca3af" : "#2563eb",
              color: "white",
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              borderRadius: "50px", // Pill shape from the design
              padding: "12px 0",
              boxShadow: blocked ? "none" : "0 8px 16px rgba(37, 99, 235, 0.25)",
              "&:hover": {
                backgroundColor: blocked ? "#9ca3af" : "#1d4ed8",
                boxShadow: blocked ? "none" : "0 10px 20px rgba(37, 99, 235, 0.35)",
              },
              "&:disabled": {
                backgroundColor: "#cbd5e1",
                color: "#ffffff"
              }
            }}
          >
            {loading ? "SENDING..." : blocked ? "BLOCKED" : "SEND RESET LINK"}
          </Button>
        </form>

        {/* Dynamic Message Alert */}
        {message && (
          <Box 
            sx={{ 
              mt: 3, 
              p: 2, 
              borderRadius: "12px", 
              backgroundColor: blocked ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${blocked ? "#fecaca" : "#bbf7d0"}`
            }}
          >
            <Typography sx={{ 
              fontSize: "0.85rem", 
              fontWeight: 600, 
              color: blocked ? "#ef4444" : "#16a34a" 
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