import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-pdf-analyzer-ktoo.onrender.com",
});

export const loginUser = (email, password) => {
  return API.post("/auth/login", { email, password });
};

export const analyzePDF = (text, type, token) => {
  return API.post(
    "/analyze",
    { text, document_type: type },
    { headers: { token } }
  );
};

export default API;