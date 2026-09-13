const svgData = (label, accent, icon) => `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg width="900" height="620" viewBox="0 0 900 620" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#102d48"/><stop offset="1" stop-color="#07111f"/></linearGradient>
      <radialGradient id="glow" cx="72%" cy="20%" r="58%"><stop stop-color="${accent}" stop-opacity=".48"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="900" height="620" fill="url(#bg)"/><rect width="900" height="620" fill="url(#glow)"/>
    <g opacity=".22" stroke="#bde6ff"><path d="M0 480H900M0 520H900M0 560H900"/><path d="M80 0V620M240 0V620M400 0V620M560 0V620M720 0V620"/></g>
    <circle cx="450" cy="300" r="140" fill="${accent}" opacity=".16"/><circle cx="450" cy="300" r="107" fill="#07111f" stroke="${accent}" stroke-width="3"/>
    <text x="450" y="327" text-anchor="middle" font-size="108" font-family="Arial, sans-serif" fill="${accent}">${icon}</text>
    <rect x="52" y="50" width="245" height="44" rx="22" fill="#07111f" stroke="${accent}" stroke-opacity=".65"/>
    <text x="75" y="78" font-size="17" font-family="Arial, sans-serif" fill="#d7edff" letter-spacing="2">CIVIC REPORT</text>
    <text x="450" y="500" text-anchor="middle" font-size="31" font-weight="700" font-family="Arial, sans-serif" fill="#eef7ff">${label}</text>
    <text x="450" y="536" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" fill="#8eb5d1">NammaFix AI field report</text>
  </svg>`)}`

export const civicVisual = (category = 'General') => {
  const key = category.toLowerCase()
  if (key.includes('pothole') || key.includes('road')) return svgData('Road safety alert', '#fb923c', '◒')
  if (key.includes('garbage') || key.includes('waste')) return svgData('Waste collection needed', '#39d98a', '♻')
  if (key.includes('light') || key.includes('electric')) return svgData('Streetlight outage', '#fde047', '☀')
  if (key.includes('water') || key.includes('leak')) return svgData('Water infrastructure alert', '#38bdf8', '≈')
  if (key.includes('drain')) return svgData('Drainage safety alert', '#a78bfa', '≋')
  return svgData('Community needs attention', '#22a7f0', '✦')
}

const now = Date.now()
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString()

export const initialIssues = [
  {
    id: 'NF-1048', title: 'Deep pothole near Whitefield Main Road', category: 'Pothole / Road Damage', severity: 'Critical', urgencyScore: 94,
    description: 'A large pothole has opened up beside the busy turning lane near the metro feeder stop. Two-wheelers are swerving into traffic, especially after rain.',
    location: 'Whitefield Main Road, near Hope Farm Junction', department: 'BBMP Road Infrastructure', status: 'Verified', verifications: 28, createdAt: hoursAgo(5), image: civicVisual('Pothole'), isDuplicate: false,
    ai: { complaintSummary: 'High-risk road cavity on a high-traffic arterial approach, creating an immediate two-wheeler crash risk.', estimatedResolutionTime: '24–48 hours', safetyWarning: 'Avoid sudden lane changes near the cavity. Place temporary caution markers immediately.', actionPlan: ['Deploy barricades and reflective warning signs.', 'Inspect road base and drainage before patching.', 'Complete hot-mix repair and verify with a post-work photo.'], duplicateKeywords: ['whitefield pothole', 'hope farm road damage'], citizenMessage: 'Thank you — your report has been prioritised for road safety review.', authorityNote: 'High commuter corridor. Route to road maintenance emergency crew.' },
  },
  {
    id: 'NF-1047', title: 'Garbage pile blocking bus stop footpath', category: 'Garbage / Waste', severity: 'High', urgencyScore: 76,
    description: 'Uncollected mixed waste has accumulated beside the bus stop for three days. The footpath is blocked and stray animals are scattering the waste.',
    location: 'AECS Layout Bus Stop, Brookefield', department: 'BBMP Solid Waste Management', status: 'Assigned', verifications: 17, createdAt: hoursAgo(18), image: civicVisual('Garbage'), isDuplicate: false,
    ai: { complaintSummary: 'Overflowing mixed-waste pile affecting pedestrian access and creating a sanitation concern at a public transit stop.', estimatedResolutionTime: '12–24 hours', safetyWarning: 'Keep children away from the pile; sharp or contaminated materials may be present.', actionPlan: ['Dispatch ward waste collection vehicle.', 'Clear scattered waste and disinfect pavement.', 'Inspect bin capacity and collection schedule.'], duplicateKeywords: ['brookefield garbage', 'aecs bus stop waste'], citizenMessage: 'Your neighbourhood signal has been sent to the waste-management team.', authorityNote: 'Assign to ward collection route 12.' },
  },
  {
    id: 'NF-1046', title: 'Streetlight out on residential lane', category: 'Broken Streetlight', severity: 'Medium', urgencyScore: 62,
    description: 'The streetlight outside the community park has been off for a week, leaving the lane very dark after 8 PM.',
    location: '4th Cross, Kundalahalli Colony', department: 'BBMP Electrical Division', status: 'In Progress', verifications: 11, createdAt: hoursAgo(31), image: civicVisual('Streetlight'), isDuplicate: false,
    ai: { complaintSummary: 'Non-functional streetlight reducing night-time visibility on a residential lane near a public park.', estimatedResolutionTime: '2–3 working days', safetyWarning: 'Use the better-lit parallel lane after dark until repair is confirmed.', actionPlan: ['Test power feed and photocell.', 'Replace failed LED driver or fixture.', 'Conduct a night-time illumination check.'], duplicateKeywords: ['kundalahalli light', '4th cross streetlight'], citizenMessage: 'The electrical team has started a field check.', authorityNote: 'Technician visit scheduled for this evening.' },
  },
  {
    id: 'NF-1045', title: 'Water leakage near school road', category: 'Water Leakage', severity: 'High', urgencyScore: 81,
    description: 'Clean water has been flowing from a cracked pipe near the school boundary since morning. The pavement is slippery during drop-off hours.',
    location: 'Varthur School Road, near Chrysalis High', department: 'BWSSB Water Supply', status: 'Reported', verifications: 9, createdAt: hoursAgo(9), image: civicVisual('Water'), isDuplicate: false,
    ai: { complaintSummary: 'Visible water-pipe leak beside a school route causing water loss and a slip hazard during peak pedestrian movement.', estimatedResolutionTime: '24–72 hours', safetyWarning: 'Keep students clear of the wet pavement and avoid contact if water quality is uncertain.', actionPlan: ['Isolate the damaged section and assess pressure.', 'Repair pipe joint or cracked segment.', 'Restore surface safely and monitor for re-leakage.'], duplicateKeywords: ['varthur pipe leak', 'school road water'], citizenMessage: 'This report has been labelled high priority because it affects a school route.', authorityNote: 'Coordinate repair window outside school peak hours.' },
  },
  {
    id: 'NF-1044', title: 'Open drainage beside market entrance', category: 'Drainage Issue', severity: 'Critical', urgencyScore: 89,
    description: 'The drain cover near the market entrance is missing. It is hard to see in the evening and shoppers with bags could easily step into it.',
    location: 'Varthur Market Road, opposite vegetable market', department: 'BBMP Storm Water Drain', status: 'Resolved', verifications: 34, createdAt: hoursAgo(76), image: civicVisual('Drainage'), isDuplicate: false,
    ai: { complaintSummary: 'Uncovered drainage opening at a high-footfall market entrance, presenting an immediate fall and injury hazard.', estimatedResolutionTime: 'Same day emergency response', safetyWarning: 'Do not approach the opening. A sturdy temporary barrier is required until a cover is restored.', actionPlan: ['Install a high-visibility temporary barricade.', 'Measure and fit a load-rated drain cover.', 'Inspect adjacent covers for deterioration.'], duplicateKeywords: ['varthur market drain', 'open drain cover'], citizenMessage: 'Resolved — thank you for helping keep the market entrance safer.', authorityNote: 'Resolution image reviewed by ward supervisor.' },
  },
]
