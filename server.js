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
    const { jobRole, experienceLevel, jobDescription } = req.body;
    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
        process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
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

    const generatedQuestions = response.data.candidates[0].content.parts[0].text;
    res.json({ questions: generatedQuestions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Error generating questions" });
  }
});

app.post("/api/generate-feedback", async (req, res) => {
  try {
    const { interviewID, questions, answers, jobRole, experienceLevel, jobDescription } = req.body;

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      throw new Error("Invalid data format: questions and answers must be arrays");
    }

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
      method: "post",
      data: {
        contents: [
          {
            parts: [
              {
                text: `Generate a pure json file without any other unnecessary symbols for feedback of this interview with the following questions and answers:

                      Questions:
                      ${questions.map((q, index) => `Question ${index + 1}: ${q}`).join("\n")}

                      Answers:
                      ${answers.map((a, index) => `Answer ${index + 1}: ${a}`).join("\n")}

                      This feedback is for a user who selected a ${jobRole} role with ${experienceLevel} experience based on the following job description:
                      "${jobDescription}"

                      Each feedback should include:
                      - A clear and concise pros and cons statement.
                      - The answer provided by the user.
                      - The question provided by the user.
                      - An overall rating out of 10 after reviewing the user's answer.
                      - Strength points in the user's answer.
                      - Weak points in the user's answer.
                      - Suggestions to improve the user's answer.
                      - If user not write a proper answer, then show pros as None. 

                      Provide the output in the following JSON format:

                      [
                        {
                          "questionno": "Question 1",
                          "question": "question 1 statement",
                          "answer": "${answers[0]}",
                          "rating": "Overall rating out of 10 after reviewing the user's answer",
                          "pros": "Strength points in the user's answer",
                          "cons": "Weak points in the user's answer",
                          "suggestion": "Suggestions to improve the user's answer"
                        },
                        {
                          "questionno": "Question 2",
                          "question": "question 2 statement",
                          "answer": "${answers[1]}",
                          "rating": "Overall rating out of 10 after reviewing the user's answer",
                          "pros": "Strength points in the user's answer",
                          "cons": "Weak points in the user's answer",
                          "suggestion": "Suggestions to improve the user's answer"
                        },
                        {
                          "questionno": "Question 3",
                          "question": "question 3 statement",
                          "answer": "${answers[2]}",
                          "rating": "Overall rating out of 10 after reviewing the user's answer",
                          "pros": "Strength points in the user's answer",
                          "cons": "Weak points in the user's answer",
                          "suggestion": "Suggestions to improve the user's answer"
                        },
                        {
                          "questionno": "Question 4",
                          "question": "question 4 statement",
                          "answer": "${answers[3]}",
                          "rating": "Overall rating out of 10 after reviewing the user's answer",
                          "pros": "Strength points in the user's answer",
                          "cons": "Weak points in the user's answer",
                          "suggestion": "Suggestions to improve the user's answer"
                        },
                        {
                          "questionno": "Question 5",
                          "question": "question 5 statement",
                          "answer": "${answers[4]}",
                          "rating": "Overall rating out of 10 after reviewing the user's answer",
                          "pros": "Strength points in the user's answer",
                          "cons": "Weak points in the user's answer",
                          "suggestion": "Suggestions to improve the user's answer"
                        },
                      ]`
              },
            ],
          },
        ],
      },
    });

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
