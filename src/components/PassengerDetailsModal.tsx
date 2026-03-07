import {
  Dialog,
  DialogContent,
  Box,
  Menu,
  Button,
  TextField,
  Typography,
  MenuItem,
  IconButton
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api/axios";

// Icons for modern UI
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Gender = "MALE" | "FEMALE" | "OTHER";
type PassengerType = "ADULT" | "CHILD" | "INFANT";

type Passenger = {
  full_name: string;
  dob: string;
  gender: Gender;

  email?: string;
  phone?: string;
  address?: string;

  guardian_index?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  flight: any;
  bookingConfig: {
    tripType: "one_way" | "round_trip";
    adults: number;
    children: number;
    infants: number;
  };
};

/* ---------- HELPERS ---------- */

function getPassengerType(dob: string, travelDate: string): PassengerType {
  const birth = new Date(dob);
  const travel = new Date(travelDate);

  let age = travel.getFullYear() - birth.getFullYear();
  const m = travel.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && travel.getDate() < birth.getDate())) age--;

  if (age < 2) return "INFANT";
  if (age < 12) return "CHILD";
  return "ADULT";
}

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

export default function PassengerDetailsModal({
  open,
  onClose,
  flight,
  bookingConfig
}: Props) {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedPassengers, setSavedPassengers] = useState<Passenger[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePassengerIndex, setActivePassengerIndex] = useState<number | null>(null);
  const [showAutofillDialog, setShowAutofillDialog] = useState(false);

  /* ---------- INIT PASSENGERS ---------- */

  useEffect(() => {
    if (!open) return;
    api.get("/details/get")
      .then(res => {
        console.log("Saved passengers:", res.data);
        setSavedPassengers(res.data);
      });

    const list: Passenger[] = [];

    const total =
      bookingConfig.adults +
      bookingConfig.children +
      bookingConfig.infants;

    for (let i = 0; i < total; i++) {
      list.push({
        full_name: "",
        dob: "",
        gender: "MALE"
      });
    }

    setPassengers(list);
  }, [open, bookingConfig]);

  /* ---------- HELPERS ---------- */

  const autofillPassenger = (index: number, data: Passenger) => {
    setPassengers(prev =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              full_name: data.full_name,
              dob: String(data.dob).slice(0, 10), // 🔥 IMPORTANT
              gender: data.gender,
              email: data.email,
              phone: data.phone,
              address: data.address,
              guardian_index: undefined
            }
          : p
      )
    );
  };

  const updatePassenger = (
    index: number,
    field: keyof Passenger,
    value: any
  ) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const adultIndices = passengers
    .map((p, i) =>
      p.dob && getPassengerType(p.dob, flight.date) === "ADULT"
        ? i
        : null
    )
    .filter((i) => i !== null) as number[];

  const isValid = passengers.every((p, _idx) => {
    if (!p.full_name || !p.dob) return false;

    const type = p.dob
      ? getPassengerType(p.dob, flight.date)
      : null;

    if (!type) return false;

    if (type === "ADULT") {
      return !!p.email && !!p.phone && !!p.address;
    }

    return p.guardian_index !== undefined;
  });

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const primaryAdultIndex = passengers.findIndex(
        (p) =>
          p.dob &&
          getPassengerType(p.dob, flight.date) === "ADULT"
      );

      if (primaryAdultIndex === -1) {
        alert("At least one adult is required");
        setLoading(false);
        return;
      }

      const payload = {
        flight: {
          flight_id: flight.flight_id,
          airline: flight.airline,
          price: flight.price,
          date: flight.date,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time
        },
        trip_type: bookingConfig.tripType,
        booking_contact_email:
          passengers[primaryAdultIndex].email!,
        passengers
      };

      const bookingRes = await api.post(
        "/bookings/create",
        payload
      );

      const stripeRes = await api.post(
        "/payments/create-session",
        {
          booking_id: bookingRes.data.booking_id
        }
      );

      window.location.href = stripeRes.data.checkout_url;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      alert(
        typeof detail === "string"
          ? detail
          : JSON.stringify(detail, null, 2)
      );
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
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
      {/* Custom Header Area */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2 }, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e3f2fd', p: 1, borderRadius: '12px' }}>
            <PeopleAltIcon sx={{ color: '#1976d2' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
              Travelers
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#5f6368" }}>
              Please enter details exactly as they appear on ID.
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#9aa0a6" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '10px' } }}>
        
        {passengers.map((p, index) => {
          const type = p.dob
            ? getPassengerType(p.dob, flight?.date)
            : null;

          return (
            <Box
              key={index}
              sx={{
                mb: 4,
                p: 3,
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                position: "relative",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#cbd5e1" }
              }}
            >
              {/* Passenger Card Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography sx={{ fontWeight: 700, color: "#1976d2", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                  Passenger {index + 1} {type ? `• ${type}` : ""}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<AutoFixHighIcon />}
                  sx={{ 
                    borderRadius: "50px", 
                    textTransform: "none", 
                    fontWeight: 600,
                    backgroundColor: "#f0f4f9",
                    color: "#1976d2",
                    px: 2,
                    "&:hover": { backgroundColor: "#e3f2fd" }
                  }}
                  onClick={() => {
                    setActivePassengerIndex(index);
                    setShowAutofillDialog(true);
                  }}
                >
                  Autofill
                </Button>
              </Box>

              {/* Form Fields */}
              <TextField
                fullWidth
                label="Full Name"
                sx={modernInputSx}
                value={p.full_name}
                placeholder="First Last"
                onChange={(e) => updatePassenger(index, "full_name", e.target.value)}
              />

              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                  sx={modernInputSx}
                  value={p.dob}
                  onChange={(e) => updatePassenger(index, "dob", e.target.value)}
                />

                <TextField
                  select
                  fullWidth
                  label="Gender"
                  sx={modernInputSx}
                  value={p.gender}
                  onChange={(e) => updatePassenger(index, "gender", e.target.value)}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Box>

              {/* Adult Fields */}
              {type === "ADULT" && (
                <Box sx={{ mt: 1, pt: 2, borderTop: "1px dashed #e2e8f0" }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", mb: 2 }}>Contact Details</Typography>
                  <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                    <TextField
                      fullWidth
                      label="Email"
                      sx={modernInputSx}
                      value={p.email || ""}
                      onChange={(e) => updatePassenger(index, "email", e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      sx={modernInputSx}
                      value={p.phone || ""}
                      onChange={(e) => updatePassenger(index, "phone", e.target.value)}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Address"
                    sx={{ ...modernInputSx, mb: 0 }}
                    value={p.address || ""}
                    onChange={(e) => updatePassenger(index, "address", e.target.value)}
                  />
                </Box>
              )}

              {/* Child/Infant Guardian Field */}
              {type && type !== "ADULT" && (
                <Box sx={{ mt: 1, pt: 2, borderTop: "1px dashed #e2e8f0" }}>
                  <TextField
                    select
                    fullWidth
                    label="Select Guardian"
                    sx={{ ...modernInputSx, mb: 0 }}
                    value={p.guardian_index ?? ""}
                    onChange={(e) => updatePassenger(index, "guardian_index", Number(e.target.value))}
                  >
                    {adultIndices.length === 0 ? (
                       <MenuItem disabled value=""><em>No adults added yet</em></MenuItem>
                    ) : (
                      adultIndices.map((i) => (
                        <MenuItem key={i} value={i}>
                          {passengers[i]?.full_name || `Adult ${i + 1}`}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Box>
              )}
            </Box>
          );
        })}
      </DialogContent>

      {/* Footer Actions */}
      <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button 
            onClick={onClose} 
            sx={{ 
              minWidth: "auto", 
              p: 2, 
              color: "#5f6368", 
              borderRadius: "16px",
              "&:hover": { backgroundColor: "#f1f3f4" } 
            }}
          >
            <ArrowBackIcon />
          </Button>

          <Button
            fullWidth
            variant="contained"
            disabled={!isValid || loading}
            onClick={handleSubmit}
            endIcon={!loading && <CreditCardIcon />}
            sx={{
              borderRadius: "50px",
              padding: "14px 0",
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
            {loading ? "PROCESSING..." : "PROCEED TO SECURE PAYMENT"}
          </Button>
        </Box>
      </Box>

      {/* Legacy Menu kept for safety from original code, but we rely on Dialog below */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        disablePortal
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        onClose={() => { setAnchorEl(null); setActivePassengerIndex(null); }}
      >
        {savedPassengers.map((sp, i) => (
          <MenuItem
            key={i}
            onClick={() => {
              if (activePassengerIndex !== null) autofillPassenger(activePassengerIndex, sp);
              setAnchorEl(null);
              setActivePassengerIndex(null);
            }}
          >
            {sp.full_name}
          </MenuItem>
        ))}
      </Menu>

      {/* Modernized Autofill Dialog */}
      <Dialog
        open={showAutofillDialog}
        onClose={() => setShowAutofillDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Select Saved Profile</Typography>
          <IconButton onClick={() => setShowAutofillDialog(false)} size="small"><CloseIcon /></IconButton>
        </Box>

        <DialogContent dividers sx={{ borderTop: "1px solid #f1f3f4", borderBottom: "1px solid #f1f3f4", p: 2 }}>
          {savedPassengers.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center", color: "#9aa0a6" }}>
              <PeopleAltIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
              <Typography>No saved passengers found</Typography>
            </Box>
          ) : (
            savedPassengers.map((sp, i) => (
              <Box
                key={i}
                sx={{
                  p: 2,
                  mb: 1.5,
                  cursor: "pointer",
                  borderRadius: "12px",
                  border: "1px solid #e0e0e0",
                  transition: "all 0.2s",
                  "&:hover": { backgroundColor: "#f4f9ff", borderColor: "#1976d2" }
                }}
                onClick={() => {
                  if (activePassengerIndex !== null) {
                    autofillPassenger(activePassengerIndex, sp);
                  }
                  setShowAutofillDialog(false);
                  setActivePassengerIndex(null);
                }}
              >
                <Typography sx={{ fontWeight: 700, color: "#202124" }}>{sp.full_name}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#5f6368" }}>DOB: {sp.dob}</Typography>
              </Box>
            ))
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}