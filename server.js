import 'dotenv/config';  // Load environment variables
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios'; // Import axios for making HTTP requests

const app = express();
const port = process.env.PORT || 3003;

app.use(cors({
  origin: 'http://192.168.31.127:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());

app.post('/api/generate-questions', async (req, res) => {
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
                text: `Generate a pure json file without any other symbols for only 5 multiple-choice interview questions and its correct answer for a ${jobRole} with ${experienceLevel} experience based on the following job description:
                      "${jobDescription}"

                      Each question should include:
                      - A clear and concise question statement.
                      - Four answer options labeled "a", "b", "c", and "d".
                      - An indication of the correct answer.

                      Provide the output in the following JSON format:

                      [
                        {
                          "question": "Your question here?",
                          "options": {
                            "a": "Option A",
                            "b": "Option B",
                            "c": "Option C",
                            "d": "Option D"
                          },
                          "answer": "a"
                        },
                        {
                          "question": "Your question here?",
                          "options": {
                            "a": "Option A",
                            "b": "Option B",
                            "c": "Option C",
                            "d": "Option D"
                          },
                          "answer": "b"
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
    const generatedQuestions = response.data.candidates[0].content.parts[0].text;
    res.json({ questions: generatedQuestions }); // Send the generated questions as the response

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Error generating questions' });
  }
});

app.get('/test', (req, res) => {
  res.send('Server is working');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
