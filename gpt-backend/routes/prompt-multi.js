const express = require('express');
const GPT4Adapter = require('../models/gpt4');
const Claude4Adapter = require('../models/claude4');
const GPT4oAdapter = require('../models/gpt4o');
const GeminiAdapter = require('../models/gemini');
const DeepSeekAdapter = require('../models/deepseek');

const router = express.Router();

// Build a system prompt for general knowledge Q&A
const SYSTEM_PROMPT = `You are a helpful, precise assistant. Answer the user's question clearly and concisely. Prefer factual, up-to-date knowledge.`;

router.post('/prompt-sequential', async (req, res) => {
  const { prompt, webpageContent, selectedText, conversationId, mode = 'chat' } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  // Prepare context-aware user content
  let userContent = prompt;
  if (selectedText && selectedText.trim()) {
    userContent = `[SELECTED_TEXT]: ${selectedText}\n\nUser Question: ${prompt}`;
  } else if (webpageContent && webpageContent.trim()) {
    userContent = `[WEBPAGE_CONTENT]: ${String(webpageContent).slice(0, 2000)}\n\nUser Question: ${prompt}`;
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent }
  ];

  // Instantiate adapters with env-configured keys
  const adapters = [
    { name: 'gpt4', inst: new GPT4Adapter(process.env.GPT4_API_KEY || '') },
    { name: 'claude4', inst: new Claude4Adapter(process.env.CLAUDE4_API_KEY || '') },
    { name: 'gpt4o', inst: new GPT4oAdapter(process.env.GPT4O_API_KEY || process.env.GPT4_API_KEY || '') },
    { name: 'gemini', inst: new GeminiAdapter(process.env.GEMINI_API_KEY || '') },
    { name: 'deepseek', inst: new DeepSeekAdapter(process.env.DEEPSEEK_API_KEY || '') }
  ];

  const results = await Promise.allSettled(adapters.map(async ({ name, inst }) => {
    try {
      const content = await inst.callAPI(messages, 0.2, 1200);
      return { name, content };
    } catch (err) {
      return { name, error: err.message };
    }
  }));

  const answers = results
    .filter(r => r.status === 'fulfilled' && r.value?.content)
    .map(r => r.value);

  const errors = results
    .filter(r => r.status === 'fulfilled' && r.value?.error)
    .map(r => r.value)
    .concat(results.filter(r => r.status === 'rejected').map(r => ({ name: 'unknown', error: String(r.reason || 'failed') })));

  if (answers.length === 0) {
    return res.status(502).json({ error: 'All providers failed', errors });
  }

  // Synthesize a final answer by preferring GPT-4/GPT-4o/Claude order
  const preferredOrder = ['gpt4', 'gpt4o', 'claude4', 'gemini', 'deepseek'];
  let final = answers.find(a => preferredOrder.includes(a.name))?.content || answers[0].content;

  // Attach a compact provenance footer
  const footer = `\n\n— Answer synthesized from: ${answers.map(a => a.name).join(', ')}`;
  final = `${final}${footer}`;

  res.json({ response: final, providers: answers.map(a => a.name), errors });
});

module.exports = router;

