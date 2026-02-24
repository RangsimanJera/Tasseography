require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // รองรับรูปภาพ

// ตั้งค่าให้ Express หาไฟล์ในโฟลเดอร์ public เจอ (แก้ปัญหา Vercel หาไม่เจอ)
app.use(express.static(path.join(__dirname, 'public')));

// เตรียม API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/predict', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    // -----------------------------------------------------------
    // 🟢 แก้ไขตรงนี้ครับ (เลือกโมเดลที่ไวที่สุด)
    // ใช้ "gemini-1.5-flash" แทน "gemini-pro" หรือตัวอื่นๆ
    // -----------------------------------------------------------
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
        You are a mystical fortune teller reading tea leaves (Tasseography).
        Look at the dark tea leaf patterns in the cup image.
        1. Identify ONE distinct shape (animal, object, or symbol) formed by the leaves.
        2. Give a mystical interpretation of that symbol for the user's future.
        3. Format the response in Thai language as follows:
           - สัญลักษณ์: [Symbol Name]
           - ความหมาย: [Meaning]
           - คำทำนาย: [Prediction 1-2 sentences]
        Keep it short and mystical.
        `;

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
    res.status(500).json({ success: false, error: "The spirits are silent." });
  }
});

// บังคับ Route หน้าแรกให้เปิดไฟล์ index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

module.exports = app;