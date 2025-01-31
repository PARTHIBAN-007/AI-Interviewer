import React, { useState, useEffect } from "react";

export default function EvaluationPage() {
  const [evaluationData, setEvaluationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch evaluation data when the component mounts
  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/evaluate_responses");
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation data");
        }
        const data = await response.json();
        setEvaluationData(data.Answers);  // Assuming the response structure matches the one you provided
      } catch (error) {
        setError("Error fetching evaluation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluationData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-6">Evaluation Report</h1>

      {evaluationData.length > 0 ? (
        evaluationData.map((answer, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full md:w-3/4 lg:w-1/2">
            <h2 className="text-xl font-semibold mb-2">Question:</h2>
            <p className="mb-4">{answer.question}</p>

            <h3 className="font-semibold mb-2">Response:</h3>
            <p className="mb-4">{answer.response || "No response provided"}</p>

            <h3 className="font-semibold mb-2">Accuracy:</h3>
            <p className="mb-4">{answer.accuracy || "No accuracy available"}</p>

            <h3 className="font-semibold mb-2">Improvised Response:</h3>
            <p>{answer.improvisedresponse || "No improvised response available"}</p>
          </div>
        ))
      ) : (
        <div>No evaluation data available.</div>
      )}
    </div>
  );
}
