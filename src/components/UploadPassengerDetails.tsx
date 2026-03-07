import {
  Dialog,
  DialogContent,
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Divider
} from "@mui/material";
import { useState } from "react";
import api from "../api/axios";

// Icons for modern UI
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

type Gender = "MALE" | "FEMALE" | "OTHER";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// Reusable styling for our custom rounded TextFields
const modernInputSx = {
  mb: 2.5,
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: "#64748b",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2563eb",
  }
};

export default function UploadPassengerDetailsDialog({
  open,
  onClose,
  onSuccess
}: Props) {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !dob || !gender) {
      alert("Full name, DOB and gender are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/details/upload", {
        full_name: fullName,
        dob,
        gender,
        email: email || null,
        phone: phone || null,
        address: address || null
      });

      onSuccess?.();
      onClose();

      // reset form
      setFullName("");
      setDob("");
      setGender("MALE");
      setEmail("");
      setPhone("");
      setAddress("");
    } catch (err: any) {
      alert(
        err.response?.data?.detail || "Failed to upload passenger details"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          padding: { xs: 1, sm: 2 },
          boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
          backgroundColor: "#ffffff"
        }
      }}
    >
      {/* Custom Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2 }, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e3f2fd', p: 1, borderRadius: '12px' }}>
            <PersonAddAlt1Icon sx={{ color: '#1976d2' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
              Save Traveler
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#5f6368" }}>
              Store details for faster booking
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#9aa0a6" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' } }}>
        
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", mb: 2 }}>
          Personal Information
        </Typography>

        <TextField
          fullWidth
          label="Full Name (as on ID)"
          sx={modernInputSx}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="First Last"
        />

        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            type="date"
            label="Date of Birth"
            InputLabelProps={{ shrink: true }}
            sx={modernInputSx}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <TextField
            select
            fullWidth
            label="Gender"
            sx={modernInputSx}
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </TextField>
        </Box>

        <Divider sx={{ my: 1, borderStyle: "dashed", borderColor: "#e2e8f0" }} />

        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", my: 2 }}>
          Contact Information <Typography component="span" sx={{ fontSize: "0.7rem", color: "#9aa0a6", fontWeight: 500, textTransform: "none" }}>(Optional)</Typography>
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            label="Email Address"
            sx={modernInputSx}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />

          <TextField
            fullWidth
            label="Phone Number"
            sx={modernInputSx}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 890"
          />
        </Box>

        <TextField
          fullWidth
          label="Home Address"
          sx={{ ...modernInputSx, mb: 1 }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, City, Country"
        />
      </DialogContent>

      {/* Footer Actions */}
      <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0, mt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !fullName || !dob || !gender}
          startIcon={!loading && <SaveOutlinedIcon />}
          sx={{
            borderRadius: "50px",
            padding: "12px 0",
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "0.5px",
            backgroundColor: "#1976d2",
            boxShadow: "0 8px 16px rgba(25, 118, 210, 0.25)",
            "&:hover": {
              backgroundColor: "#1565c0",
              boxShadow: "0 10px 20px rgba(25, 118, 210, 0.35)",
            },
            "&:disabled": {
              backgroundColor: "#e0e0e0",
              color: "#9e9e9e"
            }
          }}
        >
          {loading ? "SAVING PROFILE..." : "SAVE PASSENGER"}
        </Button>
      </Box>
    </Dialog>
  );
}