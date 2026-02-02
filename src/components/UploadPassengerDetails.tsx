import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from "@mui/material";
import { useState } from "react";
import api from "../api/axios";

type Gender = "MALE" | "FEMALE" | "OTHER";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Upload Passenger Details</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Full Name"
          sx={{ mb: 2 }}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField
          fullWidth
          type="date"
          label="Date of Birth"
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />

        <TextField
          select
          fullWidth
          label="Gender"
          sx={{ mb: 2 }}
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
        >
          <MenuItem value="MALE">Male</MenuItem>
          <MenuItem value="FEMALE">Female</MenuItem>
          <MenuItem value="OTHER">Other</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Email (optional)"
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label="Phone (optional)"
          sx={{ mb: 2 }}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <TextField
          fullWidth
          label="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
