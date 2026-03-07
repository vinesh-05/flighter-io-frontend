import {
  Dialog,
  DialogContent,
  Box,
  Button,
  Typography,
  IconButton,
  Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LuggageIcon from "@mui/icons-material/Luggage";

type BookingConfig = {
  tripType: "one_way" | "round_trip";
  adults: number;
  children: number;
  infants: number;
};

type BookingConfigModalProps = {
  open: boolean;
  onClose: () => void;
  config: BookingConfig;
  setConfig: (config: BookingConfig) => void;
  onContinue: () => void;
};

export default function BookingConfigModal({
  open,
  onClose,
  config,
  setConfig,
  onContinue
}: BookingConfigModalProps) {

  const updateCount = (
    field: "adults" | "children" | "infants",
    delta: number
  ) => {
    setConfig({
      ...config,
      [field]: Math.max(0, config[field] + delta)
    });
  };

  // ✅ Backend-aligned validation (Preserved)
  const isValid =
    config.adults >= 1 &&
    config.infants <= config.adults &&
    config.adults + config.children + config.infants > 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px", // Heavy rounded corners
          padding: { xs: 1, sm: 2 },
          boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e3f2fd', p: 1, borderRadius: '12px' }}>
            <LuggageIcon sx={{ color: '#1976d2' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
            Trip Details
          </Typography>
        </Box>

        {/* Trip Type - Custom Pill Toggle */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ mb: 1.5, fontWeight: 600, fontSize: "0.85rem", color: "#5f6368", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Trip Type
          </Typography>

          <Box sx={{ 
              display: "flex", 
              backgroundColor: "#f1f3f4", 
              borderRadius: "50px", 
              padding: "4px" 
            }}
          >
            <Box
              onClick={() => setConfig({ ...config, tripType: "one_way" })}
              sx={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                borderRadius: "50px",
                cursor: "pointer",
                backgroundColor: config.tripType === "one_way" ? "#ffffff" : "transparent",
                boxShadow: config.tripType === "one_way" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                color: config.tripType === "one_way" ? "#1976d2" : "#5f6368",
                fontWeight: config.tripType === "one_way" ? 700 : 500,
                transition: "all 0.2s ease"
              }}
            >
              One Way
            </Box>
            <Box
              onClick={() => setConfig({ ...config, tripType: "round_trip" })}
              sx={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                borderRadius: "50px",
                cursor: "pointer",
                backgroundColor: config.tripType === "round_trip" ? "#ffffff" : "transparent",
                boxShadow: config.tripType === "round_trip" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                color: config.tripType === "round_trip" ? "#1976d2" : "#5f6368",
                fontWeight: config.tripType === "round_trip" ? 700 : 500,
                transition: "all 0.2s ease"
              }}
            >
              Round Trip
            </Box>
          </Box>
        </Box>

        {/* Passenger Counters */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <PassengerCounter
            label="Adults"
            subLabel="(12+ years)"
            count={config.adults}
            min={1}
            onIncrease={() => updateCount("adults", 1)}
            onDecrease={() => updateCount("adults", -1)}
          />
          <Divider sx={{ borderStyle: "dashed", borderColor: "#e0e0e0", my: 2 }} />
          
          <PassengerCounter
            label="Children"
            subLabel="(2–11 years)"
            count={config.children}
            onIncrease={() => updateCount("children", 1)}
            onDecrease={() => updateCount("children", -1)}
          />
          <Divider sx={{ borderStyle: "dashed", borderColor: "#e0e0e0", my: 2 }} />

          <PassengerCounter
            label="Infants"
            subLabel="(Under 2)"
            count={config.infants}
            onIncrease={() => updateCount("infants", 1)}
            onDecrease={() => updateCount("infants", -1)}
          />
        </Box>

        {/* Validation Message */}
        {!isValid && (
          <Box sx={{ mt: 3, p: 1.5, bgcolor: "#fff4f4", borderRadius: "12px", border: "1px solid #ffcdd2" }}>
            <Typography color="error" sx={{ fontSize: "0.8rem", fontWeight: 500, display: "flex", flexDirection: "column", gap: 0.5 }}>
              {config.adults < 1 && <span>• At least 1 adult is required</span>}
              {config.infants > config.adults && <span>• Number of infants cannot exceed adults</span>}
            </Typography>
          </Box>
        )}

        {/* Full-Width Action Button */}
        <Button
          fullWidth
          variant="contained"
          disabled={!isValid}
          onClick={() => {
            onContinue();
          }}
          sx={{
            mt: 4,
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
          CONTINUE
        </Button>

      </DialogContent>
    </Dialog>
  );
}

/* ---------- Helper Component ---------- */

function PassengerCounter({
  label,
  subLabel,
  count,
  onIncrease,
  onDecrease,
  min = 0
}: {
  label: string;
  subLabel: string;
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 600, color: "#202124", fontSize: "1rem" }}>{label}</Typography>
        <Typography sx={{ color: "#9aa0a6", fontSize: "0.8rem" }}>{subLabel}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={onDecrease}
          disabled={count <= min}
          sx={{ 
            width: 36, 
            height: 36, 
            backgroundColor: count <= min ? "#f1f3f4" : "#e3f2fd", 
            color: count <= min ? "#bdbdbd" : "#1976d2",
            "&:hover": { backgroundColor: "#bbdefb" }
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <Typography sx={{ minWidth: 20, textAlign: "center", fontWeight: 700, fontSize: "1.1rem", color: "#202124" }}>
          {count}
        </Typography>

        <IconButton 
          onClick={onIncrease}
          sx={{ 
            width: 36, 
            height: 36, 
            backgroundColor: "#e3f2fd", 
            color: "#1976d2",
            "&:hover": { backgroundColor: "#bbdefb" }
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}