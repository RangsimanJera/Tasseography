require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ตั้งค่าให้ Express หาไฟล์ในโฟลเดอร์ public เจอ (แก้ปัญหา Vercel หาไม่เจอ)
app.use(express.static(path.join(__dirname, 'public')));

// เตรียม API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/predict', async (req, res) => {
  try {
    const {
      symbolName,
      symbolMeaning,
      symbolNameTH,
      symbolMeaningTH,
      userQuestion,
    } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const safeSymbolName = symbolName || "Unknown symbol";
    const safeSymbolNameTH = symbolNameTH || "";
    const safeSymbolMeaning = symbolMeaning || "";
    const safeSymbolMeaningTH = symbolMeaningTH || "";
    const safeQuestion = userQuestion || "ไม่ได้ระบุคำถามชัดเจน";

    const prompt = `
คุณคือหมอดูผู้เชี่ยวชาญด้านการอ่านก้นถ้วยชา (tasseography) พูดภาษาไทยได้อย่างเป็นธรรมชาติ

ระบบได้วิเคราะห์ลายใบชาในถ้วยเรียบร้อยแล้ว และพบ "สัญลักษณ์หลัก" ดังนี้ (ห้ามเปลี่ยนหรือแต่งเพิ่มเอง):
- ชื่อภาษาอังกฤษ: ${safeSymbolName}
- ชื่อภาษาไทย: ${safeSymbolNameTH}
- ความหมายหลัก (EN): ${safeSymbolMeaning}
- ความหมายหลัก (TH): ${safeSymbolMeaningTH}

คนที่มาดูดวงกำลังสงสัยเรื่องนี้:
"${safeQuestion}"

ให้คุณใช้เฉพาะความหมายของสัญลักษณ์ด้านบนเป็นแกนหลัก แล้วผูกคำทำนายในบริบทของคำถามผู้ถาม
น้ำเสียงควรอบอุ่น เป็นมิตร ลึกลับนิด ๆ แต่ไม่ต้องน่ากลัว

ตอบกลับเป็นภาษาไทย 100% และใช้รูปแบบนี้เท่านั้น:
สัญลักษณ์: [พิมพ์ชื่อภาษาไทยของสัญลักษณ์ เช่น ${safeSymbolNameTH || "หัวใจ"}]
ความหมาย: [สรุปความหมายสั้น ๆ 1 บรรทัด โดยอิงจากข้อมูลที่ให้ไป]
คำทำนาย: [เขียนคำทำนาย 2-3 ประโยค เชื่อมโยงกับคำถามของผู้ถามอย่างเป็นธรรมชาติ ไม่เกิน 120 คำ]
`;

    const result = await model.generateContent(prompt);
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