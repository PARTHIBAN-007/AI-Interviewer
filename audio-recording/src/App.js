import React, { useState } from "react";
import axios from "axios";

function App() {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const predefinedRole = "Machine Learning Engineer";

  const availableTopics = [
    "Linear Regression",
    "Gradient Descent",
    "Data Analysis",
    "Data Manipulation",
    "Transformers",
    "Random Forest",
    "Decision Tree",
    "Deep Learing",
    "Statistics",
    "Regularization",
    "Neural Networks",
    "Hypothesis Testing",
    "Natural Language Processing",
    "Large Language Model",
  ];

  const handleTopicClick = (topic) => {
    setSelectedTopics((prevTopics) =>
      prevTopics.includes(topic)
        ? prevTopics.filter((t) => t !== topic) // Deselect topic
        : [...prevTopics, topic] // Select topic
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      role: predefinedRole,
      topics: selectedTopics,
    };

    try {
      // Sending the data to the backend endpoint '/config_question'
      const response = await axios.post("http://127.0.0.1:8000/config-question/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Response from backend:", response.data);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">AI Mock Interviewer </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <input
              type="text"
              value={predefinedRole}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Select Topics</label>
            <div className="grid grid-cols-2 gap-3">
              {availableTopics.map((topic) => (
                <div
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className={`px-4 py-2 border rounded-lg cursor-pointer text-center ${
                    selectedTopics.includes(topic)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
