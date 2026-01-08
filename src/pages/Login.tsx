import { useState } from "react";
import { TextField, Button, Card,Box,CardContent, Typography } from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await api.post("/users/login", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("name",res.data.user.name);
      localStorage.setItem("email",res.data.user.email);
      alert("Login Successful!");
      navigate("/chat");
    } catch (err: any) {
      alert(err.response.data.detail);
    }
  };

return (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000000ff",
    }}
  >
    <Card sx={{ width: 400, padding: "30px" }}>
      <CardContent>
        <Typography variant="h5" textAlign="center">
          Login
        </Typography>

        <TextField
          label="Username or email"
          name="identifier"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />


        <TextField
          label="Password"
          type="password"
          name="password"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Login
        </Button>

        <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate("/signup")}>
          Create new account
        </Button>
      </CardContent>
    </Card>
  </Box>
);
}
