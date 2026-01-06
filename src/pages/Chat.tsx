import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import api from "../api/axios";
import FlightCardList from "../components/FlightCardList";
import { useNavigate } from "react-router-dom";

const extractPaymentUrl = (text: string) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(regex);

  if (!matches) return null;

  return matches.find(url =>
    url.includes("stripe") ||
    url.includes("checkout") ||
    url.includes("pay")
  ) || null;
};

export default function Chat() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);   // 👈 Added
  const navigate = useNavigate();
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};
const goToMyBookings = () => {
  navigate("/my-bookings");
};

  const bookFlightByClick = async (flightId: string) => {
  const msg = `book flight ${flightId}`;

  setMessages((prev) => [...prev, { sender: "user", text: msg }]);
  setIsTyping(true);

  try {
    const res = await api.post("/chat/message", { message: msg });

    let botText = res.data.bot_response;

    if (typeof botText === "object") {
      botText = `PAYMENT_DATA_JSON::${JSON.stringify(botText)}`;
    }

    setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
  } catch (err: any) {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Error: " + err.message }
    ]);
  }

  setIsTyping(false);
};

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setIsTyping(true);   // 👈 Bot starts typing

    try {
      const res = await api.post("/chat/message", { message: input });

      const bot_response = res.data.bot_response;
      const flights = res.data.flights;
      const origin = res.data.origin;
      const destination = res.data.destination;
      const date = res.data.date;

      let botText = bot_response;

      if (typeof bot_response === "object") {
        botText = `PAYMENT_DATA_JSON::${JSON.stringify(bot_response)}`;
      }

      if (flights && flights.length > 0) {
        botText = `FLIGHT_DATA_JSON::${JSON.stringify(
          { origin, destination, date, flights }
        )}`;
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      setIsTyping(false);   // 👈 Bot done typing

    } catch (err: any) {
      setIsTyping(false);    // 👈 Stop typing even on error
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: " + err.message }
      ]);
    }

    setInput("");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#f1f1f1"
      }}
    >

    {/* Header */}
    <Box
      sx={{
        p: 2,
        background: "#1976d2",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <Typography sx={{ fontSize: "22px", fontWeight: "bold" }}>
        Flighter-AI Chat
      </Typography>

      {/* Right-side buttons */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          color="error"
          onClick={goToMyBookings}
        >
          My Bookings
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>


      {/* Chat messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          color: "black"
        }}
      >
        {messages.map((m, i) => {
          const text = String(m.text);
          const paymentUrl = extractPaymentUrl(text);
          const cleanedText = paymentUrl ? text.replace(paymentUrl, "") : text;

          if (text.startsWith("FLIGHT_DATA_JSON::")) {
            const data = JSON.parse(text.replace("FLIGHT_DATA_JSON::", ""));
            return (
              <Box key={i} sx={{ mb: 2 }}>
                <FlightCardList
                  data={data}
                  onSelect={(flightId: string) => bookFlightByClick(flightId)}
                    />

              </Box>
            );
          }

          return (
            <Box
              key={i}
              sx={{
                textAlign: m.sender === "user" ? "right" : "left",
                mb: 1,
                p: 1.5,
                maxWidth: "80%",
                ml: m.sender === "user" ? "auto" : "0",
                background: m.sender === "user" ? "#f1f1f1" : "white",
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {cleanedText}
              </Typography>

              {paymentUrl && (
                <Button
                  variant="contained"
                  color="warning"
                  href={paymentUrl}
                  target="_blank"
                  sx={{ mt: 1 }}
                >
                  Pay Now
                </Button>
              )}
            </Box>
          );
        })}

        {/* Typing animation */}
        {isTyping && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              background: "white",
              width: "70px",
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </Box>
        )}
      </Box>

      {/* Input area */}
      <Box
        sx={{
          display: "flex",
          p: 2,
          gap: 1,
          background: "white",
          borderTop: "1px solid #f1f1f1"
        }}
      >
        <TextField
          fullWidth
          label="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button variant="contained" onClick={sendMessage}>
          Send
        </Button>
      </Box>

      {/* Typing bubble animation CSS */}
      <style>
        {`
        .typing-dot {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          display: inline-block;
          animation: blink 1.4s infinite both;
          margin-right: 3px;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        `}
      </style>
    </Box>
  );
}
