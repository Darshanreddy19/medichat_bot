const express = require('express');
const cors = require('cors');
const path = require('path');
const { diseaseData, symptomHints } = require('./medicalDataset.cjs');

const app = express();
app.use(cors());
app.use(express.json());

const emergencyKeywords = [
  'chest pain',
  'stroke symptoms',
  'face drooping',
  'fainting',
  'passed out',
  'cannot breathe',
  "can't breathe",
  'seizure',
  'suicidal',
  'bleeding heavily',
  'vomiting blood',
  'black stool',
  'blood in vomit',
  'severe shortness of breath',
];

const symptomKeywords = ['symptom', 'symptoms', 'sign', 'signs', 'feel', 'feeling'];
const treatmentKeywords = ['treat', 'treatment', 'manage', 'management', 'control', 'cure', 'plan'];
const medicationKeywords = ['medicine', 'medication', 'drug', 'tablet', 'dose', 'inhaler', 'insulin'];
const testKeywords = ['test', 'scan', 'investigation', 'blood test', 'diagnosis', 'diagnose', 'screening'];
const preventionKeywords = ['prevent', 'prevention', 'avoid', 'reduce risk', 'protection'];

// Best-effort conversation memory per client key.
const conversationState = new Map();

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function detectIntent(normalizedMessage) {
  if (includesAny(normalizedMessage, treatmentKeywords)) return 'management';
  if (includesAny(normalizedMessage, medicationKeywords)) return 'medications';
  if (includesAny(normalizedMessage, testKeywords)) return 'tests';
  if (includesAny(normalizedMessage, preventionKeywords)) return 'prevention';
  if (includesAny(normalizedMessage, symptomKeywords)) return 'symptoms';
  return 'overview';
}

function tokenize(text) {
  return normalizeText(text).split(' ').filter(Boolean);
}

function scoreDiseaseMatch(normalizedMessage, disease) {
  const messageTokens = tokenize(normalizedMessage);
  const aliasTokens = disease.aliases.flatMap((alias) => tokenize(alias));

  let score = 0;

  for (const alias of disease.aliases) {
    if (normalizedMessage.includes(alias)) score += 5;
  }

  const aliasSet = new Set(aliasTokens);
  for (const token of messageTokens) {
    if (aliasSet.has(token)) score += 1;
  }

  return score;
}

function detectDisease(normalizedMessage) {
  let bestKey = null;
  let bestScore = 0;

  Object.entries(diseaseData).forEach(([key, disease]) => {
    const score = scoreDiseaseMatch(normalizedMessage, disease);
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  });

  if (!bestKey || bestScore < 2) return null;
  return { key: bestKey, score: bestScore, data: diseaseData[bestKey] };
}

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function formatMedications(medications) {
  if (!medications || medications.length === 0) return '';
  if (typeof medications[0] === 'string') {
    return formatList(medications);
  }
  return medications
    .map((med) => `- **${med.name}**: ${med.dosage}\n  📋 Frequency: ${med.frequency}\n  💊 Purpose: ${med.purpose}`)
    .join('\n\n');
}

function formatNaturalRemedies(remedies) {
  if (!remedies || remedies.length === 0) return '';
  return `\n### 🌿 Natural Remedies (Supportive)\n${remedies
    .map((rem) => `- **${rem.name}**: ${rem.dosage}\n  🕒 Usage: ${rem.frequency}\n  ✨ Benefit: ${rem.benefit}`)
    .join('\n\n')}`;
}

function buildDiseaseResponse(disease, intent) {
  const { title, symptoms, management, tests, medications, naturalRemedies, prevention, redFlags } = disease;

  const sections = {
    symptoms: `## 🔍 ${title}: What You Might Be Experiencing\n\n**These are the common signs to watch for:**\n${formatList(symptoms)}\n\n### ⚠️ When To Seek Urgent Care Immediately\n${formatList(redFlags)}\n\n*Remember: This is educational information, not a diagnosis. Consult a healthcare professional for personalized advice.*`,
    management: `## 📋 ${title}: Your Treatment & Management Plan\n\n**Here's how to manage this condition effectively:**\n${formatList(management)}\n\n### 🧪 Key Monitoring You'll Need\n${formatList(tests)}\n\n*Work closely with your doctor to create a personalized plan tailored to your needs.*`,
    medications: `## 💊 ${title}: Medical Treatment Options\n\n**Prescription medications that help:**\n${formatMedications(medications)}${formatNaturalRemedies(naturalRemedies)}\n\n### ⚡ Important Safety Notes\n- Always take medicines exactly as prescribed\n- Inform your doctor about all supplements and natural remedies\n- Report any side effects immediately\n- Never stop medication without medical guidance\n\n*Medication works best combined with lifestyle changes!*`,
    tests: `## 🧪 ${title}: Recommended Diagnostic Tests\n\n**These tests help confirm diagnosis and guide treatment:**\n${formatList(tests)}\n\n### Why These Specific Tests?\n- Confirm what you're dealing with\n- Measure how serious it is\n- Track if treatment is working\n- Detect any complications early\n\n*Ask your doctor which tests are priority for your situation.*`,
    prevention: `## 🛡️ ${title}: Prevention & Lifestyle Tips\n\n**Build healthy habits to prevent or manage this condition:**\n${formatList(prevention)}\n\n### 💪 Daily Habits That Make a Difference\n- Get consistent quality sleep (7-9 hours)\n- Stay hydrated throughout the day\n- Move your body regularly\n- Manage stress through relaxation\n- Eat whole, unprocessed foods\n\n*Prevention is always easier than treating complications!*`,
    overview: `## 🏥 ${title}: Complete Overview\n\n**What You're Dealing With:**\n${formatList(symptoms)}\n\n**How to Manage It:**\n${formatList(management)}\n\n**Critical Warning Signs:**\n${formatList(redFlags)}\n\n*For severe or worsening symptoms, seek professional medical care right away!*`,
  };

  return sections[intent] || sections.overview;
}

function buildGeneralSymptomResponse(normalizedMessage) {
  const matched = symptomHints.filter((entry) => normalizedMessage.includes(entry.symptom));
  if (!matched.length) return null;

  const lines = matched.map((m) => `- **${m.symptom}** may be linked with: ${m.hints.join(', ')}`);
  return `## Symptom-Based Guidance\n\n${lines.join('\n')}\n\n### Suggested Next Steps\n- Track symptom timing, triggers, and severity\n- Record basic vitals if available (temperature, pulse, BP, glucose when relevant)\n- Consult a clinician for confirmation and targeted treatment`;
}

function buildUnknownDiseaseResponse() {
  const supported = Object.values(diseaseData)
    .slice(0, 12)
    .map((d) => d.title)
    .join(', ');

  return `## I Can Help With Many Conditions\n\nI could not confidently detect a specific disease from your message.\n\n### Try asking in this format\n- "Symptoms of migraine"\n- "Treatment for COPD"\n- "Tests for CKD"\n\n### Example supported topics\n${supported}\n\n*If you share your main symptoms, I can suggest likely condition categories and next steps.*`;
}

function buildEmergencyResponse() {
  return `## Urgent Safety Advice\n\nYour message may include emergency warning signs.\n\n### Please act now\n- Call local emergency services immediately\n- Do not drive yourself if symptoms are severe\n- Go to the nearest emergency department\n\n*I can provide general information, but this needs urgent in-person care.*`;
}

function simulateResponse(message, previousState) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return {
      response:
        '## How I Can Help\n\nI can answer about diabetes, hypertension, asthma, COPD, CKD, thyroid disorders, anemia, heart disease, stroke, migraine, arthritis, GERD, IBS, TB, dengue, and more.\n\n### Ask in this format\n- Symptoms of asthma\n- Tests for thyroid\n- Treatment for diabetes\n- Prevention tips for hypertension',
      state: previousState,
    };
  }

  if (includesAny(normalizedMessage, emergencyKeywords)) {
    return { response: buildEmergencyResponse(), state: previousState };
  }

  const intent = detectIntent(normalizedMessage);
  const diseaseMatch = detectDisease(normalizedMessage);

  if (diseaseMatch) {
    return {
      response: buildDiseaseResponse(diseaseMatch.data, intent),
      state: { lastDiseaseKey: diseaseMatch.key, lastIntent: intent, updatedAt: Date.now() },
    };
  }

  // Follow-up support: if user asks "what tests?" after a disease was identified.
  if (
    previousState &&
    previousState.lastDiseaseKey &&
    diseaseData[previousState.lastDiseaseKey] &&
    ['tests', 'medications', 'management', 'symptoms', 'prevention', 'overview'].includes(intent)
  ) {
    return {
      response: buildDiseaseResponse(diseaseData[previousState.lastDiseaseKey], intent),
      state: { lastDiseaseKey: previousState.lastDiseaseKey, lastIntent: intent, updatedAt: Date.now() },
    };
  }

  const symptomHint = buildGeneralSymptomResponse(normalizedMessage);
  if (symptomHint) {
    return {
      response: symptomHint,
      state: previousState,
    };
  }

  return {
    response: buildUnknownDiseaseResponse(),
    state: previousState,
  };
}

function responseDelayMs(message) {
  const length = (message || '').length;
  if (length < 40) return 350;
  if (length < 140) return 550;
  return 800;
}

function getClientKey(req) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown-ip';
  const ua = req.get('user-agent') || 'unknown-ua';
  return `${ip}|${ua}`;
}

app.get('/api/diseases', (req, res) => {
  const list = Object.entries(diseaseData).map(([key, value]) => ({
    key,
    title: value.title,
    aliases: value.aliases,
  }));

  res.json({ count: list.length, diseases: list });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const clientKey = getClientKey(req);
  const prev = conversationState.get(clientKey);

  const { response, state } = simulateResponse(message || '', prev);
  const delay = responseDelayMs(message || '');

  if (state) conversationState.set(clientKey, state);

  setTimeout(() => {
    res.json({ response });
  }, delay);
});

// serve production build if available
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
