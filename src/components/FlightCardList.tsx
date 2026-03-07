import { Box, Typography, Button, Paper, Divider, Chip } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function FlightCardList({ data, onSelect }: any) {
  const { origin, destination, date, flights } = data;

  // Helper to format origin/dest codes (e.g., "London" -> "LONDON")
  const formatLocation = (loc: string) => loc ? loc.toUpperCase() : "";

  return (
    <Box sx={{ width: "100%" }}>
      {/* Optional Header (can be removed if chat context is enough) */}
      <Typography variant="subtitle2" sx={{ color: "#5f6368", mb: 2, ml: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Select a flight for {date}
      </Typography>

      {flights.map((f: any, index: number) => {
        // 🔹 Normalize flight object (PRESERVED FROM ORIGINAL CODE)
        const parsedPrice = Number(
          String(f.price ?? "").replace(/[^\d.]/g, "")
        );

        if (Number.isNaN(parsedPrice)) {
          console.error("INVALID PRICE FROM API:", f.price);
          return null; // skip rendering this flight
        }

        const flight = {
          flight_id: String(f.id),
          airline: f.airline,
          price: parsedPrice,
          origin,
          destination,
          date,
          departure_time: f.departure_time,
          arrival_time: f.arrival_time
        };

        return (
          <Paper
            key={index}
            elevation={0}
            onClick={() => onSelect(flight)}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mb: 3,
              borderRadius: "16px",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              backgroundColor: "#ffffff",
              "&:hover": { 
                backgroundColor: "#f4f9ff", // Light blue tint on hover like the image
                borderColor: "#b3d4ff",
                boxShadow: "0 8px 24px rgba(25, 118, 210, 0.08)"
              }
            }}
          >
            {/* LEFT SIDE: Flight Details */}
            <Box sx={{ flex: 1, p: 2.5 }}>
              {/* Top Row: Airline & Flight ID */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#757575", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {f.airline}
                  </Typography>
                  <FlightIcon sx={{ color: "#9e9e9e", fontSize: "1.1rem", transform: "rotate(45deg)" }} />
                  <Typography sx={{ color: "#202124", fontWeight: 600, fontSize: "0.95rem" }}>
                    Flight: #{f.id}
                  </Typography>
                </Box>
                <Chip 
                  label="Non-stop" 
                  size="small" 
                  sx={{ backgroundColor: "#f1f3f4", color: "#5f6368", fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px" }} 
                />
              </Box>

              <Divider sx={{ mb: 2, opacity: 0.6 }} />

              {/* Middle Row: Times & Duration */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                
                {/* Depart */}
                <Box sx={{ textAlign: "left", flex: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#5f6368", fontWeight: 600, letterSpacing: "0.5px" }}>DEPART</Typography>
                  <Typography sx={{ fontSize: "2.2rem", fontWeight: 700, color: "#0288d1", lineHeight: 1.1 }}>
                    {f.departure_time}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, color: "#202124", fontSize: "1rem" }}>{formatLocation(origin)}</Typography>
                    <AccessTimeIcon sx={{ fontSize: "0.9rem", color: "#9e9e9e" }} />
                  </Box>
                </Box>

                {/* Duration Line */}
                <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column", alignItems: "center", px: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#5f6368", mb: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: "0.9rem" }} />
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{f.duration}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%", opacity: 0.8 }}>
                    <Box sx={{ height: "2px", flex: 1, backgroundColor: "#0288d1", borderRadius: "2px" }} />
                    <FlightIcon sx={{ color: "#0288d1", transform: "rotate(90deg)", mx: 1, fontSize: "1.2rem" }} />
                    <Box sx={{ height: "2px", flex: 1, backgroundColor: "#0288d1", borderRadius: "2px" }} />
                  </Box>
                  <Typography sx={{ fontSize: "0.8rem", color: "#5f6368", mt: 0.5, fontWeight: 500 }}>
                    {formatLocation(origin)} → {formatLocation(destination)}
                  </Typography>
                </Box>

                {/* Arrive */}
                <Box sx={{ textAlign: "right", flex: 1 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#5f6368", fontWeight: 600, letterSpacing: "0.5px" }}>ARRIVE</Typography>
                  <Typography sx={{ fontSize: "2.2rem", fontWeight: 700, color: "#0288d1", lineHeight: 1.1 }}>
                    {f.arrival_time}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, color: "#202124", fontSize: "1rem" }}>{formatLocation(destination)}</Typography>
                    <AccessTimeIcon sx={{ fontSize: "0.9rem", color: "#9e9e9e" }} />
                  </Box>
                </Box>

              </Box>
            </Box>

            {/* Vertical Divider (Hidden on mobile) */}
            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" }, borderStyle: "dashed", borderColor: "#bdbdbd" }} />
            {/* Horizontal Divider for mobile */}
            <Divider flexItem sx={{ display: { xs: "block", md: "none" }, borderStyle: "dashed", borderColor: "#bdbdbd", mx: 2 }} />

            {/* RIGHT SIDE: Pricing & Action */}
            <Box sx={{ 
                minWidth: { xs: "100%", md: "200px" }, 
                p: 2.5, 
                display: "flex", 
                flexDirection: { xs: "row", md: "column" }, 
                alignItems: { xs: "center", md: "flex-end" }, 
                justifyContent: { xs: "space-between", md: "center" },
                backgroundColor: "#fafbfc" // Very slight contrast background for price section
              }}
            >
              <Box sx={{ textAlign: { xs: "left", md: "right" }, mb: { xs: 0, md: 2 } }}>
                <Typography sx={{ display: "flex", alignItems: "baseline", gap: 0.5, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#202124", letterSpacing: "-1px" }}>
                    ₹{parsedPrice.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#9e9e9e", fontWeight: 600, mt: -0.5 }}>
                  INR
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent duplicate trigger from paper click
                  onSelect(flight);
                }}
                endIcon={<ChevronRightIcon />}
                sx={{
                  backgroundColor: "#0288d1",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  boxShadow: "0 4px 10px rgba(2, 136, 209, 0.3)",
                  "&:hover": {
                    backgroundColor: "#0277bd",
                    boxShadow: "0 6px 14px rgba(2, 136, 209, 0.4)",
                  }
                }}
              >
                BOOK NOW
              </Button>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}