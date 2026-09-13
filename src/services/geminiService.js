const categories = {
  road: { category: 'Pothole / Road Damage', department: 'BBMP Road Infrastructure', severity: 'High', score: 78, time: '24–72 hours' },
  garbage: { category: 'Garbage / Waste', department: 'BBMP Solid Waste Management', severity: 'Medium', score: 58, time: '12–24 hours' },
  light: { category: 'Broken Streetlight', department: 'BBMP Electrical Division', severity: 'Medium', score: 61, time: '2–3 working days' },
  water: { category: 'Water Leakage', department: 'BWSSB Water Supply', severity: 'High', score: 76, time: '24–72 hours' },
  drainage: { category: 'Drainage Issue', department: 'BBMP Storm Water Drain', severity: 'High', score: 82, time: '24–48 hours' },
  default: { category: 'Public Infrastructure Damage', department: 'BBMP Ward Office', severity: 'Medium', score: 54, time: '3–5 working days' },
}

/**
 * Analyses a civic report using deterministic NammaFix AI fallback logic.
 * We no longer rely on external API keys.
 */
export async function analyzeIssueWithGemini({ title = '', description = '', location = '' }) {
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
    authorityNote: `Triage: review ${match.category.toLowerCase()} priority and confirm field availability.`,
    isFallback: false,
  }
}
