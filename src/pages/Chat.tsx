import { useState, useRef, useEffect } from "react";
import { 
  Box, Button, Typography, Avatar, IconButton, 
  Menu, MenuItem, Divider, Paper, InputBase, Tooltip, Chip 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import type { VirtuosoHandle } from "react-virtuoso";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; 

import api from "../api/axios";
import FlightCardList from "../components/FlightCardList";
import BookingConfigModal from "../components/BookingConfigModal";
import PassengerDetailsModal from "../components/PassengerDetailsModal";
import UploadPassengerDetailsDialog from "../components/UploadPassengerDetails";

const extractPaymentUrl = (text: string) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(regex);
  if (!matches) return null;
  return matches.find(url =>
    url.includes("stripe") || url.includes("checkout") || url.includes("pay")
  ) || null;
};

type BookingConfig = {
  tripType: "one_way" | "round_trip";
  adults: number;
  children: number;
  infants: number;
};

export default function Chat() {
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [bookingConfigOpen, setBookingConfigOpen] = useState(false);
  const [passengerModalOpen, setPassengerModalOpen] = useState(false);
  const [uploadDetailsOpen, setUploadDetailsOpen] = useState(false);
  const [bookingConfig, setBookingConfig] = useState<BookingConfig>({
    tripType: "one_way", adults: 1, children: 0, infants: 0
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const navigate = useNavigate();
  const username = localStorage.getItem("name") || "Guest User";
  const email = localStorage.getItem("email") || "";

  useEffect(() => {
    api.get("/chat/history")
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    const shouldOpen = localStorage.getItem("open_upload_passenger_details");
    if (shouldOpen === "true") {
      setUploadDetailsOpen(true);
      localStorage.removeItem("open_upload_passenger_details");
    }
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const bookFlightByClick = (flight: any) => {
    setSelectedFlight(flight);
    setBookingConfigOpen(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await api.post("/chat/message", { message: userMessage });
      const { bot_response, flights, origin, destination, date } = res.data;

      let botText = bot_response;
      if (typeof bot_response === "object") {
        botText = `PAYMENT_DATA_JSON::${JSON.stringify(bot_response)}`;
      }
      if (flights && flights.length > 0) {
        botText = `FLIGHT_DATA_JSON::${JSON.stringify({ origin, destination, date, flights })}`;
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error: " + err.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderFlightData = (text: string) => {
    let data;
    try { data = JSON.parse(text.replace("FLIGHT_DATA_JSON::", "")); } catch { return null; }

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ width: '100%', maxWidth: '850px', mt: 1, px: { xs: 2, md: 0 } }}>
          {data.origin && data.destination && data.date && (
            <Typography variant="subtitle2" sx={{ color: "#5f6368", mb: 1.5, ml: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "0.75rem" }}>
              Flights: {data.origin} → {data.destination} • {new Date(data.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </Typography>
          )}
          <FlightCardList data={data} onSelect={(f: any) => bookFlightByClick(f)} />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", bgcolor: "#ffffff", position: 'relative', overflow: 'hidden' }}>
      
      {/* HEADER */}
      <Paper elevation={0} sx={{ p: "12px 24px", color: "#202124", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, borderRadius: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1976d2', color: 'white', borderRadius: '8px', p: 1 }}>
            <AirplaneTicketIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Flighter AI</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart Travel Assistant</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right", display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{username}</Typography>
            <Typography sx={{ fontSize: "11px", color: "#5f6368" }}>{email}</Typography>
          </Box>
          <Tooltip title="Profile Menu">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#e0e0e0", color: "#5f6368", fontSize: '1rem', fontWeight: 'bold' }}>
                    {username?.[0]?.toUpperCase()}
                </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* CHAT AREA (Full width for edge scrollbar, content centered inside) */}
      <Box sx={{ flexGrow: 1, position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
          
        {/* GEMINI-STYLE EMPTY STATE */}
        {messages.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', height: '100%', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pb: '15vh' }}>
              <Box sx={{ p: 2, borderRadius: 4, border: '1px solid #e0e0e0', mb: 3 }}>
                <AutoAwesomeIcon sx={{ color: '#1976d2', fontSize: 32 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: '#202124' }}>
                How can I help you today?
              </Typography>
              <Typography sx={{ color: '#5f6368', mb: 4, textAlign: 'center' }}>
                Search for flights, check your bookings, or ask about travel requirements.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {["Flights to London", "Cheapest trip to Bali", "My next booking"].map((chip) => (
                  <Chip 
                    key={chip} label={chip} 
                    onClick={() => setInput(chip)} 
                    sx={{ bgcolor: 'white', border: '1px solid #e0e0e0', px: 1, py: 2, borderRadius: '20px', '&:hover': { bgcolor: '#f5f5f5' } }} 
                    clickable 
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* VIRTUALIZED MESSAGES */}
        {messages.length > 0 && (
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            followOutput="smooth"
            atBottomStateChange={setIsAtBottom}
            style={{ height: "100%", width: "100%", padding: "20px 0" }}
            itemContent={(_, m) => {
              const isUser = m.sender === "user";
              const rawText = m.text || m.message || ""; 
              const text = String(rawText);
              
              const paymentUrl = extractPaymentUrl(text);
              const cleanedText = paymentUrl ? text.replace(paymentUrl, "") : text;
              
              if (text.startsWith("FLIGHT_DATA_JSON::")) return renderFlightData(text);

              return (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Box sx={{ width: '100%', maxWidth: '850px', display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", px: { xs: 2, md: 0 }, mb: 3 }}>
                    {/* Bot Avatar */}
                    {!isUser && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, ml: 1 }}>
                        <AutoAwesomeIcon sx={{ color: '#1976d2', fontSize: 16 }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#202124' }}>Flighter AI</Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      maxWidth: { xs: "90%", md: "75%" }, p: "12px 16px",
                      borderRadius: isUser ? "24px" : "8px 24px 24px 24px",
                      background: isUser ? "#1976d2" : "#f0f4f9",
                      color: isUser ? "white" : "#202124",
                    }}>
                      <Typography sx={{ fontSize: "1rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {cleanedText}
                      </Typography>

                      {paymentUrl && (
                        <Button variant="contained" color="warning" href={paymentUrl} target="_blank" fullWidth sx={{ mt: 1.5, borderRadius: "20px", fontWeight: 'bold', textTransform: 'none' }}>
                          Complete Payment
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            }}
            components={{
              Footer: () => (
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Box sx={{ width: '100%', maxWidth: '850px', px: { xs: 2, md: 0 }, pb: 2 }}>
                    {isTyping && (
                      <Box sx={{ display: "flex", gap: 0.5, p: "12px 16px", bgcolor: "#f0f4f9", borderRadius: "8px 24px 24px 24px", width: "fit-content" }}>
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </Box>
                    )}
                    <Box sx={{ height: "140px" }} /> {/* Spacing for floating input */}
                  </Box>
                </Box>
              )
            }}
          />
        )}

        {/* Scroll Down Button (Shifted relative to center) */}
        {messages.length > 0 && !isAtBottom && (
          <Tooltip title="Scroll to bottom" placement="left">
            <IconButton
              onClick={() => virtuosoRef.current?.scrollToIndex({ index: messages.length - 1, behavior: "smooth" })}
              sx={{ 
                position: "absolute", bottom: 140, 
                left: { xs: 'auto', md: 'calc(50% + 360px)' }, 
                right: { xs: 20, md: 'auto' },
                background: "white", color: "#1976d2", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", "&:hover": { background: "#f5f5f5" } 
              }}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* FLOATING INPUT */}
      <Box sx={{ 
        position: 'absolute', bottom: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 2, pt: 6,
        background: 'linear-gradient(to top, #ffffff 70%, rgba(255,255,255,0.8) 90%, transparent)'
      }}>
        <Paper elevation={0} sx={{ 
            display: "flex", alignItems: "center", p: "8px 12px", borderRadius: "32px", width: "90%", maxWidth: "850px",
            background: '#f0f4f9',
        }}>
          <InputBase
            fullWidth
            placeholder="Where would you like to go?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            sx={{ ml: 2, flex: 1, fontSize: '1rem' }}
          />
          <IconButton onClick={sendMessage} disabled={!input.trim()} sx={{ color: input.trim() ? "#1976d2" : "#9aa0a6" }}>
            <SendRoundedIcon />
          </IconButton>
        </Paper>
        <Typography sx={{ color: '#5f6368', fontSize: '0.7rem', mt: 1.5, letterSpacing: '0.3px' }}>
            Flighter AI can make mistakes. Verify important travel details.
        </Typography>
      </Box>

      {/* MODALS & MENU */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem onClick={() => { handleMenuClose(); navigate("/my-bookings"); }}>
            <AccountCircleIcon sx={{ mr: 1.5, color: '#5f6368' }} /> My Bookings
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setUploadDetailsOpen(true); }}>
            <AirplaneTicketIcon sx={{ mr: 1.5, color: '#5f6368' }} /> Upload Passenger Details
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>Logout</MenuItem>
      </Menu>

      <BookingConfigModal open={bookingConfigOpen} onClose={() => setBookingConfigOpen(false)} config={bookingConfig} setConfig={setBookingConfig} onContinue={() => { setBookingConfigOpen(false); setPassengerModalOpen(true); }} />
      <PassengerDetailsModal open={passengerModalOpen} onClose={() => setPassengerModalOpen(false)} flight={selectedFlight} bookingConfig={bookingConfig} />
      <UploadPassengerDetailsDialog open={uploadDetailsOpen} onClose={() => setUploadDetailsOpen(false)} onSuccess={() => {}} />

      <style>{`
        /* Minimalist Gemini-style Scrollbar */
        * { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.15) transparent; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.15); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.25); }
        
        /* Typing animation */
        .typing-dot { width: 6px; height: 6px; background: #90a4ae; border-radius: 50%; animation: blink 1.4s infinite both; margin-right: 4px; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; margin-right: 0; }
        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </Box>
  );
}