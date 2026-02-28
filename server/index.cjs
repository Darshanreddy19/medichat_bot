const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// reuse same pseudo-response logic as frontend
const responses = {
  diabetes: `## Diabetes Overview

Diabetes is a chronic condition affecting how your body processes blood sugar (glucose).

### Common Symptoms
- Increased thirst & frequent urination
- Unexplained weight loss
- Fatigue & blurred vision
- Slow-healing sores

### Management
- **Medication:** Metformin 500mg, twice daily with meals
- **Monitoring:** Check blood sugar 2-4 times daily
- **Diet:** Low glycemic index foods
- **Exercise:** 150 min/week moderate activity

⚠️ *Always consult your healthcare provider for personalized advice.*`,
  blood_pressure: `## Hypertension Management

High blood pressure (≥130/80 mmHg) increases risk of heart disease and stroke.

### Treatment Plan
- **ACE Inhibitors:** Lisinopril 10mg, once daily
- **Lifestyle:** DASH diet, reduce sodium to <2300mg/day
- **Exercise:** 30 min aerobic activity, 5 days/week
- **Monitoring:** Check BP twice daily (morning & evening)

### Warning Signs
- Severe headaches
- Chest pain
- Vision problems

⚠️ *Seek immediate care if BP exceeds 180/120 mmHg.*`,
  asthma: `## Asthma Treatments

Asthma is a chronic respiratory condition causing airway inflammation.

### Medications
- **Controller:** Fluticasone inhaler, 2 puffs twice daily
- **Rescue:** Albuterol inhaler, as needed for symptoms
- **Duration:** Long-term daily controller + rescue PRN

### Action Plan
1. Green Zone: No symptoms — continue controller
2. Yellow Zone: Mild symptoms — use rescue inhaler
3. Red Zone: Severe symptoms — seek emergency care

⚠️ *Work with your doctor to create a personalized asthma action plan.*`,
  fatigue: `## Chronic Fatigue

Persistent fatigue lasting 6+ months may indicate Chronic Fatigue Syndrome (CFS).

### Common Causes
- Sleep disorders
- Thyroid dysfunction
- Anemia or vitamin deficiency
- Depression or anxiety

### Evaluation
- **Blood tests:** CBC, thyroid panel, vitamin D & B12
- **Sleep study** if sleep issues suspected

### Management
- **Sleep hygiene:** 7-9 hrs, consistent schedule
- **Graded exercise therapy**
- **Cognitive behavioral therapy**

⚠️ *Chronic fatigue warrants medical evaluation to rule out underlying conditions.*`,
};

function simulateResponse(message) {
  const lower = message.toLowerCase();
  let resp =
    "Thank you for your question. I can provide information about various chronic conditions including **diabetes**, **hypertension**, **asthma**, **chronic fatigue**, and more.\n\nCould you please be more specific about what you'd like to know? For example:\n- Symptoms of a specific condition\n- Medication information\n- Treatment plans\n- Lifestyle recommendations";

  if (lower.includes("diabetes")) resp = responses.diabetes;
  else if (lower.includes("blood pressure") || lower.includes("hypertension"))
    resp = responses.blood_pressure;
  else if (lower.includes("asthma")) resp = responses.asthma;
  else if (lower.includes("fatigue") || lower.includes("tired")) resp = responses.fatigue;

  return resp;
}

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const reply = simulateResponse(message || '');
  // simulate typing delay
  setTimeout(() => {
    res.json({ response: reply });
  }, 1500);
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
