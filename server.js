import "dotenv/config"; // Load environment variables
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios"; // Import axios for making HTTP requests

const app = express();
const port = process.env.PORT || 3003;

app.use(
  cors({
    origin: "http://192.168.31.127:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());

app.post("/api/generate-questions", async (req, res) => {
  try {
    const { jobRole, experienceLevel, jobDescription } = req.body; // Destructure the request body
    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
        process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT // Use the correct environment variable syntax for Node.js
      }`,
      method: "post",
      data: {
        contents: [
          {
            parts: [
              {
                text: `Generate a pure json file without any other symbols for only 5 descriptive interview questions and its correct answer for a ${jobRole} with ${experienceLevel} experience based on the following job description:
                      "${jobDescription}"

                      Each question should include:
                      - A clear and concise question statement.
                      - An indication of the correct answer.
                      - Include at least two questions related to the job description. For example, if the job description is about software development, include questions about programming languages, frameworks, and tools.
                      - Include three technical question, including atleast one behavioral question, include one aptitude question

                      Provide the output in the following JSON format:

                      [
                        {
                          "questionno": "Question 1",
                          "question": "Your question here?",
                          "answer": ""
                        },
                        {
                          "questionno": "Question 2",
                          "question": "Your question here?",
                          "answer": ""
                        },
                        ...
                      ]`,
              },
            ],
          },
        ],
      },
    });

    // Assuming the structure of the response is correct
    const generatedQuestions =
      response.data.candidates[0].content.parts[0].text;
    res.json({ questions: generatedQuestions }); // Send the generated questions as the response
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Error generating questions" });
  }
});

app.post("/api/generate-feedback", async (req, res) => {
  try {
    const { interviewID, questions, answers, jobRole, experienceLevel, jobDescription } = req.body;

    // Validate that questions and answers are arrays
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      throw new Error("Invalid data format: questions and answers must be arrays");
    }

    // Convert the questions and answers arrays to a string representation
    const questionsText = questions
      .map((q, index) => `Question ${index + 1}: ${q}`)
      .join("\n");
    const answersText = answers
      .map((a, index) => `Answer ${index + 1}: ${a}`)
      .join("\n");

    console.log("Requesting feedback generation...");

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
      method: "post",
      data: {
        contents: [
          {
            parts: [
              {
                text: `Generate a pure json file without any other symbols for feedback of this interview with the following questions:

                      ${questionsText}

                      and the following answers:

                      ${answersText}

                      This feedback is for a user who selected a ${jobRole} role with ${experienceLevel} experience based on the following job description:
                      "${jobDescription}"

                      Each feedback should include:
                      - A clear and concise pros and cons statement.
                      - The answer provided by the user.
                      - An overall rating out of 10 after reviewing the user's answer.
                      - Strength points in the user's answer.
                      - Weak points in the user's answer.
                      - Suggestions to improve the user's answer.
                      - If user not write a proper answer, then show pros as None. 

                      Provide the output in the following JSON format:
                      
                      {
                        "feedback": [
                          {
                            "questionno": "Question 1",
                            "question": "${questionsText}",
                            "answer": "${answersText}",
                            "rating": "Overall rating out of 10 after reviewing the user's answer",
                            "pros": "Strength points in answer",
                            "cons": "Weak points in answer",
                            "suggestion": "Suggestion to improve answer"
                          },
                          {
                            "questionno": "Question 2",
                            "question": "${questionsText}",
                            "answer": "${answersText}",
                            "rating": "Overall rating out of 10 after reviewing the user's answer",
                            "pros": "Strength points in answer",
                            "cons": "Weak points in answer",
                            "suggestion": "Suggestion to improve answer"
                          }
                          ...
                        ],
                        "jobRole": "${jobRole}",
                        "experienceLevel": "${experienceLevel}",
                        "jobDescription": "${jobDescription}"
                        "interviewID": "${interviewID}"
                      }
                      `,
              },
            ],
          },
        ],
      },
    });

    console.log("External API response:", response.data);

    const generatedFeedback = response.data.candidates[0].content.parts[0].text;
    res.json({ feedback: generatedFeedback });
  } catch (error) {
    console.error("Error generating feedback:", error.message || error);
    res.status(500).json({ error: "Error generating feedback" });
  }
});



app.get("/test", (req, res) => {
  res.send("Server is working");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
