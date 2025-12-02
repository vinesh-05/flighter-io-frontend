import { useState } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const res = await api.post("/users/login", form);
      localStorage.setItem("token", res.data.access_token);
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response.data.detail);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "80px auto", padding: "20px" }}>
      <CardContent>
        <Typography variant="h5" textAlign="center">Login</Typography>

        <TextField
          label="Username"
          name="username"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <TextField
          label="Email"
          name="email"
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

        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
          Login
        </Button>

        <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate("/signup")}>
          Create new account
        </Button>
      </CardContent>
    </Card>
  );
}
