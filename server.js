const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173', 'https://festivo.netlify.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

console.log("API key:", process.env.GOOGLE_CLOUD_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);

app.post("/api/generate-suggestions", async (req, res) => {
  const { age, interests, budget } = req.body;

  const prompt = `Propose 5 idées de cadeaux pour une personne de ${age} ans, intéressée par ${interests.join(", ")}, avec un budget de ${budget}.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);

    const giftSuggestions = result.response.text().split("\n\n").filter(s => s.length > 0);
    res.json({ suggestions: giftSuggestions });
  } catch (error) {
    console.error("Erreur lors de la génération des suggestions :", error);
    res.status(500).json({ error: "Erreur lors de la génération des suggestions" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});