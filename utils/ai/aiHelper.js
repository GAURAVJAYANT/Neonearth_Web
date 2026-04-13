const axios = require("axios");

const OLLAMA_URL = process.env.AI_URL || "http://localhost:11434/api/generate";
const AI_MODEL = process.env.AI_MODEL || "mistral";

async function askAI(prompt) {
  try {
    const res = await axios.post(OLLAMA_URL, {
      model: AI_MODEL,
      prompt,
      stream: false
    });

    return res.data.response;
  } catch (err) {
    console.error("AI Error:", err.message);
    return "AI failed";
  }
}

module.exports = { askAI };