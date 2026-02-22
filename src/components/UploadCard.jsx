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
    const [error, setError] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // File validation
        if (!file.type.includes('application/pdf')) {
            setError('Please upload a valid PDF file');
            setUploadedFileName('');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            setError('File size must be less than 10MB');
            setUploadedFileName('');
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please login first");
            navigate("/login");
            return;
        }

        setError('');
        setUploadedFileName(file.name);
        setLoading(true);

        try {
            const reader = new FileReader();

            reader.onload = function(e) {
                const typedarray = new Uint8Array(e.target.result);
                pdfjsLib.getDocument(typedarray).promise
                    .then(pdf => {
                        let text = "";
                        return new Promise((resolve, reject) => {
                            for (let i = 1; i <= pdf.numPages; i++) {
                                pdf.getPage(i).then(page => {
                                    return page.getTextContent();
                                }).then(content => {
                                    const strings = content.items.map((item) => item.str);
                                    text += strings.join(" ");
                                }).then(() => {
                                    if (i === pdf.numPages) {
                                        resolve(text);
                                    }
                                }).catch(reject);
                            }
                        }).then(text => {
                            return analyzePDF(text, type, token);
                        }).then(response => {
                            if (!response.data || !response.data.result) {
                                throw new Error("Invalid server response");
                            }
                            setResult(response.data.result);
                        }).catch(err => {
                            console.error("Error analyzing PDF:", err);
                            setError(err.message || "Failed to analyze PDF");
                        }).finally(() => {
                            setLoading(false);
                        });
                    })
                    .catch(err => {
                        console.error("PDF loading error:", err);
                        setError(err.message || "Failed to load PDF");
                        setLoading(false);
                    });
            };

            reader.readAsArrayBuffer(file);

        } catch (err) {
            console.error("File reading error:", err);
            setError("Failed to read the file");
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-xl">
            <h2 className="text-xl mb-4 font-semibold">Upload PDF</h2>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
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

            {uploadedFileName && <p className="text-sm text-gray-300">{uploadedFileName}</p>}

            {loading && <Loader />}
        </div>
    );
}
