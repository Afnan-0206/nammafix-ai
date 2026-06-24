const schemaHint = `{
  "category": "",
  "severity": "Low | Medium | High | Critical",
  "urgencyScore": 0,
  "department": "",
  "complaintSummary": "",
  "estimatedResolutionTime": "",
  "safetyWarning": "",
  "actionPlan": ["", "", ""],
  "duplicateKeywords": [""],
  "citizenMessage": "",
  "authorityNote": ""
}`

const categories = {
  road: { category: 'Pothole / Road Damage', department: 'BBMP Road Infrastructure', severity: 'High', score: 78, time: '24–72 hours' },
  garbage: { category: 'Garbage / Waste', department: 'BBMP Solid Waste Management', severity: 'Medium', score: 58, time: '12–24 hours' },
  light: { category: 'Broken Streetlight', department: 'BBMP Electrical Division', severity: 'Medium', score: 61, time: '2–3 working days' },
  water: { category: 'Water Leakage', department: 'BWSSB Water Supply', severity: 'High', score: 76, time: '24–72 hours' },
  drainage: { category: 'Drainage Issue', department: 'BBMP Storm Water Drain', severity: 'High', score: 82, time: '24–48 hours' },
  default: { category: 'Public Infrastructure Damage', department: 'BBMP Ward Office', severity: 'Medium', score: 54, time: '3–5 working days' },
}

function fallbackAnalysis({ title = '', description = '', location = '' }) {
  const source = `${title} ${description}`.toLowerCase()
  let match = categories.default
  if (/pothole|road|crater|asphalt|footpath/.test(source)) match = categories.road
  else if (/garbage|waste|trash|dump|litter/.test(source)) match = categories.garbage
  else if (/street.?light|lamp|dark|electric/.test(source)) match = categories.light
  else if (/water|leak|pipe|overflow/.test(source)) match = categories.water
  else if (/drain|sewage|manhole|gutter/.test(source)) match = categories.drainage

  const critical = /open|accident|school|injury|danger|busy|traffic|deep/.test(source)
  const severity = critical && match.severity !== 'Critical' ? (match.severity === 'High' ? 'Critical' : 'High') : match.severity
  const urgencyScore = Math.min(98, match.score + (critical ? 13 : 0))
  const area = location ? ` at ${location}` : ''
  return {
    category: match.category,
    severity,
    urgencyScore,
    department: match.department,
    complaintSummary: `${match.category} reported${area}. ${description || 'Field review is recommended to confirm scope and safety risk.'}`,
    estimatedResolutionTime: critical ? 'Same day assessment; repair within 24–48 hours' : match.time,
    safetyWarning: critical ? 'Potential public safety risk detected. Keep people clear of the area and request temporary barricading.' : 'Use normal caution near the affected area until the field team confirms it is safe.',
    actionPlan: ['Create a field inspection task for the assigned ward team.', 'Secure the affected area and document the repair scope.', 'Complete the repair and attach a closure photo for community verification.'],
    duplicateKeywords: [match.category.toLowerCase(), location?.split(',')[0]?.toLowerCase() || 'local civic report'],
    citizenMessage: 'Your report is logged. NammaFix AI has prepared a clear route for the responsible civic team.',
    authorityNote: `Fallback triage: review ${match.category.toLowerCase()} priority and confirm field availability.`,
    isFallback: true,
  }
}

function stripJson(text = '') {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
}

function normalizeAnalysis(payload, fallback) {
  const validSeverities = ['Low', 'Medium', 'High', 'Critical']
  return {
    ...fallback,
    ...payload,
    severity: validSeverities.includes(payload.severity) ? payload.severity : fallback.severity,
    urgencyScore: Math.max(0, Math.min(100, Number(payload.urgencyScore) || fallback.urgencyScore)),
    actionPlan: Array.isArray(payload.actionPlan) && payload.actionPlan.length ? payload.actionPlan.slice(0, 3) : fallback.actionPlan,
    duplicateKeywords: Array.isArray(payload.duplicateKeywords) ? payload.duplicateKeywords.slice(0, 5) : fallback.duplicateKeywords,
    isFallback: false,
  }
}

/**
 * Analyses a civic report with Gemini when a Google AI Studio key is present.
 * Falls back to deterministic, realistic civic triage if the key/API is unavailable.
 */
export async function analyzeIssueWithGemini({ imageBase64, title, description, location }) {
  const fallback = fallbackAnalysis({ title, description, location })
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return fallback

  const prompt = `You are NammaFix AI, a careful civic infrastructure analysis agent for Bengaluru, India.
Analyse the citizen's report and optional image. Do not invent facts unsupported by the report. Give practical, concise triage suitable for a municipal authority.

Report title: ${title}
Citizen description: ${description}
Location: ${location}

Return VALID JSON ONLY. No markdown, no explanation. Use exactly this shape:
${schemaHint}`

  const parts = [{ text: prompt }]
  if (imageBase64?.startsWith('data:')) {
    const [prefix, data] = imageBase64.split(',')
    const mimeType = prefix.match(/data:(.*?);base64/)?.[1] || 'image/jpeg'
    parts.push({ inlineData: { mimeType, data } })
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    })
    if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`)
    const body = await response.json()
    const output = body?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
    if (!output) throw new Error('Gemini returned no text output')
    return normalizeAnalysis(JSON.parse(stripJson(output)), fallback)
  } catch (error) {
    console.warn('Gemini analysis unavailable; using local civic triage.', error)
    return fallback
  }
}
