import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
import { analyzePDF } from "../services/api";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function UploadCard({ setResult }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("resume");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");

    // 🔐 Check login before processing
    if (!token) {
      alert("Please login first");
      navigate("/login");
    }

    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            text += strings.join(" ");
          }

          const response = await analyzePDF(text, type, token);

          setResult(response.data.result);
        } catch (err) {
          console.error("Error analyzing PDF:", err);
          alert("Something went wrong while analyzing the PDF.");
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);

    } catch (err) {
      console.error("File reading error:", err);
      alert("Failed to read the PDF file.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-xl">
      <h2 className="text-xl mb-4 font-semibold">Upload PDF</h2>

      <select
        className="mb-4 p-2 rounded bg-white/20 w-full"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="resume">Resume Review</option>
        <option value="general">General Summary</option>
      </select>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        className="mb-4"
      />

      {loading && <Loader />}
    </div>
  );
}