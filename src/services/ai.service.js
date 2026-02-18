const axios = require("axios");

async function askAI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    }
  );

  return res.data.candidates[0].content.parts[0].text;
}

module.exports = { askAI };
