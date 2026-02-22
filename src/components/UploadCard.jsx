import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
import { analyzePDF } from "../services/api";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function UploadCard({ setResult }) {
    const navigate = useNavigate(); // ✅ FIXED (inside component)

    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("resume");
    const [error, setError] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // File validation
        if (!file.type.includes("application/pdf")) {
            setError("Please upload a valid PDF file");
            setUploadedFileName("");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("File size must be less than 10MB");
            setUploadedFileName("");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please login first");
            navigate("/login");
            return;
        }

        setError("");
        setUploadedFileName(file.name);
        setLoading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const typedArray = new Uint8Array(arrayBuffer);

            const pdf = await pdfjsLib.getDocument(typedArray).promise;

            let fullText = "";

            // ✅ Correct async loop
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str);
                fullText += strings.join(" ") + " ";
            }

            const response = await analyzePDF(fullText, type, token);

            if (!response.data || !response.data.result) {
                throw new Error("Invalid server response");
            }

            setResult(response.data.result);

        } catch (err) {
            console.error("Error analyzing PDF:", err);
            setError(err.message || "Failed to analyze PDF");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-xl">
            <h2 className="text-xl mb-4 font-semibold">Upload PDF</h2>

            {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

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

            {uploadedFileName && (
                <p className="text-sm text-gray-300">
                    {uploadedFileName}
                </p>
            )}

            {loading && <Loader />}
        </div>
    );
}