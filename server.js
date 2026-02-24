require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path'); // <--- 1. เพิ่มบรรทัดนี้

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// บรรทัดนี้บางที Vercel หา folder ไม่เจอ เราจะแก้ด้วย route ด้านล่างแทน
app.use(express.static('public'));

// --- ส่วน API เดิมของคุณ ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/predict', async (req, res) => {
  // ... (โค้ด API เดิม ไม่ต้องแก้) ...
});

// --- 2. เพิ่มส่วนนี้ เพื่อบังคับเปิดหน้าเว็บ ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

module.exports = app; // <--- อย่าลืมบรรทัดนี้เด็ดขาด