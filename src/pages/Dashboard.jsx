import { useState } from "react";
import { loginUser, registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false); // 🔥 toggle mode
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // ✅ REGISTER API
        const response = await registerUser(email, password);

        alert("Registration Successful ✅ Please Login");
        setIsRegister(false); // Switch back to login
      } else {
        // ✅ LOGIN API
        const response = await loginUser(email, password);

        localStorage.setItem("token", response.data.access_token);

        alert("Login Successful ✅");
        navigate("/");
      }

    } catch (err) {
      if (!isRegister) {
        // 🔥 If login fails → switch to register mode
        setError("User not found. Please register.");
        setIsRegister(true);
      } else {
        setError("Registration failed. Try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Register New Account" : "Login to Continue"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            {loading
              ? isRegister
                ? "Registering..."
                : "Logging in..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </form>

        {/* 🔥 Toggle Button */}
        <p className="text-sm text-center mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => {
              setError("");
              setIsRegister(!isRegister);
            }}
            className="text-purple-400 cursor-pointer underline"
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>

      </div>
    </div>
  );
}