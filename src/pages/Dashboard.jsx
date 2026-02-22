import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate(); // ✅ proper navigation

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(email, password);

      localStorage.setItem("token", response.data.access_token);

      alert("Login Successful ✅");

      navigate("/"); // ✅ redirect to home

    } catch (err) {
      setError("Invalid email or password. Redirecting to Register...");

      // ⏳ Small delay so user can see message
      setTimeout(() => {
        navigate("/register"); // ✅ redirect to register page
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login to Continue
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}