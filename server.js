require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // รองรับรูปภาพขนาดใหญ่
app.use(express.static('public')); // ให้เข้าถึง index.html ได้

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/predict', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    // เตรียม Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Analyze the tea leaf patterns in this cup. Identify one distinct shape (animal/object) formed by the dark clumps using pareidolia. Interpret its meaning for fortune telling. Answer in Thai: Symbol, Meaning, Prediction.";

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, prediction: text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ success: false, error: "AI Spirit is unresponsive." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

module.exports = app;