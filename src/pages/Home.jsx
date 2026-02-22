import { useState } from "react";
import Navbar from "../components/Navbar";
import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";

export default function Home() {
  const [result, setResult] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      <Navbar />

      <div className="flex flex-col items-center mt-12 w-full">
        <UploadCard setResult={setResult} />
        <ResultCard result={result} />
      </div>
    </div>
  );
}