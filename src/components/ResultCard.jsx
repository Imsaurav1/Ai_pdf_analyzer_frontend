export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="mt-6 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Analysis Result</h2>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {result}
      </div>
    </div>
  );
}