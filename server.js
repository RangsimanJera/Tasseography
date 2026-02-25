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
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

    const prompt = `
      You are a mystical fortune teller reading tea leaves (Tasseography).

      You MUST choose exactly ONE symbol from the following list and interpret ONLY using its meaning as defined below.
      If nothing matches perfectly, you MUST still choose the closest symbol from this list and explain it.
      DO NOT invent new symbols or meanings.
      DO NOT combine multiple symbols.

      Allowed symbols and meanings (use ONLY these meanings):

      ACORN - happiness and contentment; at top = financial success; at bottom = good health.
      AIRCRAFT - journey or travel.
      ALLIGATOR or CROCODILE - beware of false friendship in professional life.
      ANCHOR - stability; if broken = instability; may symbolize burden to leave behind.
      ANGEL - good news; protection.
      ANT - hard work ending productively.
      APPLE - life; creative achievement; abundance.
      ARROW - up = good direction; down = wrong direction; horizontal = no change.
      AXE - power to overcome difficulties.
      BABY - new life; small worries.
      BEAR - strength and endurance; difficult person.
      BED - think carefully before commitment.
      BELL - unexpected good news.
      BIRD - good news or message.
      BOAT - worthwhile journey.
      BOOK - open = answer revealed; closed = question remains.
      BOTTLE - explosive situation; caution.
      BOWL - invitations; money; generosity.
      BRIDGE - life-changing event or person.
      BROOM - new home; new era.
      BUTTERFLY - overdue happiness.
      CAKE - wish fulfilled; celebration.
      CANDLE - light on uncertain path; help from friends.
      CAR - travel; if broken = trouble.
      CAT - deceit; untrustworthy friend.
      CHAIN - commitment; if broken = disruption.
      CHAIR - guest; new family addition.
      CHILD - new idea; family.
      CIRCLE - completion; if broken = temporary offer.
      CLOCK - warning against procrastination.
      CLOUDS - optimism or gloom depending on form.
      COIN - lump sum of money coming.
      CROSS - hard won success or warning depending on form.
      CROWN - honor; recognition.
      CUP - be patient; not time to assert.
      DAGGER - caution with words.
      DOG - loyal friend.
      DOOR - opportunity.
      DRAGON - flashy or scheming person.
      DRUM - change; call to action.
      EAGLE - power; transcendence.
      EAR - benefit from something heard.
      EGG - new beginning; if broken = failed plans.
      ELEPHANT - patience; support.
      EYE - protection; insight.
      FACE - identity; introspection warning.
      FAN - flirtation.
      FIRE - passion; strong emotion.
      FISH - knowledge; teacher.
      FLAG - danger.
      FLOWER - praise and compliments.
      FOX - cunning person.
      FROG - fertility; abundance.
      GATE - opportunity nearby.
      GLOBE - long distance travel.
      GOAT - persistence pays off.
      GRAPES - abundance.
      HAMMER - persuasion.
      HAND - destiny; argument depending on form.
      HEART - love; romance.
      HORSE - good news; lover.
      HORSESHOE - good luck.
      HOUSE - home; comfort.
      ICEBERG - hidden danger.
      IVY - rely on friends.
      JEWELS - material success; valuable gift.
      KITE - wish granted.
      KNIFE - caution with words.
      LADDER - promotion; improvement.
      LAMP - feast; secrets revealed; postponement.
      LEAF - inevitable change.
      LETTER - important message coming.
      LIGHTNING - sudden insight or event.
      LINES - travel or change.
      LION - powerful person.
      LOCK - obstacles.
      MAN - visitor.
      MASK - secret.
      MOUNTAIN - difficult but achievable goal.
      MOUSE - caution in money matters.
      MUSHROOM - rapid growth; success.
      NECKLACE - relationship stability; if broken = instability.
      NEEDLE - painful repair.
      OAK - long life; good health.
      OCTOPUS - warning.
      OWL - wisdom; learning.
      PALM TREE - wealth; beach travel.
      PARASOL - protection.
      PIG - greedy or jealous person.
      PURSE - money.
      QUESTION MARK - reconsider plans.
      RABBIT - fertility; business growth.
      RAINBOW - wish will come true.
      RECTANGLE - challenge ahead.
      RING - marriage; completion; if broken = temporary offer.
      ROSE - new romance.
      SCALE - legal matter; justice.
      SCISSORS - remove yourself from situation.
      SHELL - simple treasure found.
      SHIP - worthwhile journey.
      SHOE - correct path.
      SNAKE - someone untrustworthy.
      SPIDER - small reward.
      SPIDER WEB - fate; beware of traps.
      SPOON - comfort through generosity.
      STAR - success; recognition.
      SUN - new beginning.
      SWORD - caution with words.
      TABLE - happy social time.
      TENT - spiritual travel.
      TOWER - disappointment risk.
      TREE - family; roots.
      TRIANGLE - love triangle.
      UMBRELLA - protection from harm.
      URN - material vs spiritual awareness.
      VASE - secret hidden from you.
      VIOLIN - express feelings.
      VOLCANO - obstruction to face.
      WATERFALL - wealth and prosperity.
      WHEEL - inevitable change.
      WINGS - avoid limiting yourself.
      WOLF - betrayal.
      YOKE - domination to resist.
      ZEBRA - flexibility in travel plans.

      Return your answer in Thai in this EXACT format (and do not add anything else):

      สัญลักษณ์: [เลือกชื่อจากรายการด้านบนเท่านั้น]
      ความหมาย: [ใช้ความหมายตามที่กำหนดไว้ข้างต้นเท่านั้น]
      คำทำนาย: [คำทำนาย 1-2 ประโยคในภาษาไทย อธิบายอนาคตของผู้ถามตามความหมายข้างบน]
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