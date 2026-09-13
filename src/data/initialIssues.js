
export const civicVisual = (category = 'General') => {
  const key = category.toLowerCase()
  if (key.includes('pothole') || key.includes('road')) return '/civic_pothole_whitefield.jpg'
  if (key.includes('garbage') || key.includes('waste')) return '/civic_garbage_brookefield.jpg'
  if (key.includes('light') || key.includes('electric')) return '/civic_streetlight_kundalahalli.jpg'
  if (key.includes('water') || key.includes('leak')) return '/civic_water_leak_varthur.jpg'
  if (key.includes('drain')) return '/civic_drain_varthur.jpg'
  return '/civic_pothole_whitefield.jpg'
}

const now = Date.now()
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString()

export const initialIssues = [
  {
    id: 'NF-1048', title: 'Deep crater pothole near Whitefield Main Road', category: 'Pothole / Road Damage', severity: 'Critical', urgencyScore: 94,
    description: 'A 1.8-meter-wide road cavity with water accumulation has opened up near Hope Farm Junction. Two-wheelers are swerving dangerously into oncoming traffic during peak commute hours.',
    location: 'Whitefield Main Road, near Hope Farm Junction (Ward 84)', department: 'BBMP Road Infrastructure (East Zone)', status: 'Verified', verifications: 28, createdAt: hoursAgo(5), image: '/civic_pothole_whitefield.jpg', isDuplicate: false,
    ai: { complaintSummary: 'High-risk road cavity on a high-traffic arterial approach, creating an immediate two-wheeler crash risk.', estimatedResolutionTime: '24–48 hours', safetyWarning: 'Avoid sudden lane changes near the cavity. Temporary caution markers placed.', actionPlan: ['Deploy barricades and reflective warning signs.', 'Inspect road base and drainage before patching.', 'Complete hot-mix repair with BBMP Rapid Patcher and verify with audit photograph.'], duplicateKeywords: ['whitefield pothole', 'hope farm road damage'], citizenMessage: 'Thank you — your report has been prioritised for emergency road repair dispatch.', authorityNote: 'High commuter corridor. Assigned to BBMP East Zone Rapid Jet-Patch Unit.' },
  },
  {
    id: 'NF-1047', title: 'Unsegregated municipal waste pile blocking bus shelter', category: 'Garbage / Waste', severity: 'High', urgencyScore: 76,
    description: 'Heavy overflow of uncollected commercial cardboard and mixed waste blocking pedestrian access at Brookefield BMTC bus shelter for over 72 hours.',
    location: 'AECS Layout Bus Stop, Brookefield (Ward 85)', department: 'BBMP Solid Waste Management (Mahadevapura)', status: 'Assigned', verifications: 17, createdAt: hoursAgo(18), image: '/civic_garbage_brookefield.jpg', isDuplicate: false,
    ai: { complaintSummary: 'Overflowing mixed-waste pile affecting pedestrian access and creating a sanitation hazard at a public transit shelter.', estimatedResolutionTime: '12–24 hours', safetyWarning: 'Keep children away from the pile; sharp or contaminated materials may be present.', actionPlan: ['Dispatch ward compacting waste collection vehicle.', 'Clear scattered waste and disinfect pavement with bleaching powder.', 'Inspect commercial generator compliance in AECS layout.'], duplicateKeywords: ['brookefield garbage', 'aecs bus stop waste'], citizenMessage: 'Your neighbourhood report has been dispatched to the Mahadevapura waste management division.', authorityNote: 'Assign to ward collection compactor vehicle KA-01-EA-8812.' },
  },
  {
    id: 'NF-1046', title: 'Non-functional LED streetlight on residential cross road', category: 'Broken Streetlight', severity: 'Medium', urgencyScore: 62,
    description: 'The municipal LED streetlight fixture at 6th Cross Kundalahalli has been non-operational for 7 days, leaving a 120-meter residential corridor in complete darkness after dusk.',
    location: '6th Cross, Kundalahalli Main Road (Ward 85)', department: 'BBMP Electrical Division', status: 'In Progress', verifications: 11, createdAt: hoursAgo(31), image: '/civic_streetlight_kundalahalli.jpg', isDuplicate: false,
    ai: { complaintSummary: 'Non-functional streetlight reducing night-time visibility and public safety on a residential lane.', estimatedResolutionTime: '2–3 working days', safetyWarning: 'Exercise caution while walking after dark until fixture replacement is confirmed.', actionPlan: ['Test junction box power feed and automated photocell sensor.', 'Replace failed 60W LED driver or luminaire.', 'Conduct night-time lux illumination verification.'], duplicateKeywords: ['kundalahalli light', '6th cross streetlight'], citizenMessage: 'The BBMP electrical division technician has initiated line diagnostics.', authorityNote: 'Technician work-order generated under Sakala SLA.' },
  },
  {
    id: 'NF-1045', title: 'Burst BWSSB water supply pipeline flooding main road', category: 'Water Leakage', severity: 'High', urgencyScore: 81,
    description: 'High-pressure underground clean drinking water supply pipeline burst outside Sai Vidya Mandir school gate. High-volume potable water gushing onto the carriageway, causing road shoulder erosion.',
    location: 'Varthur School Road, near Sai Vidya Mandir (Ward 149)', department: 'BWSSB Water Supply & Sewerage', status: 'Reported', verifications: 9, createdAt: hoursAgo(9), image: '/civic_water_leak_varthur.jpg', isDuplicate: false,
    ai: { complaintSummary: 'High-pressure potable water pipeline rupture causing roadway inundation and municipal resource waste beside school zone.', estimatedResolutionTime: '24–72 hours', safetyWarning: 'Keep students clear of the gushing water and avoid vehicular hydroplaning.', actionPlan: ['Isolate upstream sluice valve to prevent further water loss.', 'Excavate trench and install repair coupling on 150mm cast iron main.', 'Restore road sub-base and coordinate with BBMP for surface reinstatement.'], duplicateKeywords: ['varthur pipe leak', 'school road water'], citizenMessage: 'This report has been flagged as high-priority due to proximity to school entrance.', authorityNote: 'Emergency notification sent to BWSSB East Executive Engineer.' },
  },
  {
    id: 'NF-1044', title: 'Exposed open storm water drain (Rajakaluve) slab collapse', category: 'Drainage Issue', severity: 'Critical', urgencyScore: 89,
    description: 'Heavy RCC drain cover slab has collapsed into the roadside stormwater canal right outside the busy Varthur vegetable market entrance, creating a 6-foot-deep fall hazard.',
    location: 'Varthur Market Road, opposite vegetable market (Ward 149)', department: 'BBMP Storm Water Drain (SWD Division)', status: 'Resolved', verifications: 34, createdAt: hoursAgo(76), image: '/civic_drain_varthur.jpg', isDuplicate: false,
    ai: { complaintSummary: 'Collapsed stormwater drain cover slab creating an immediate fatal fall and pedestrian safety hazard at a high-footfall market.', estimatedResolutionTime: 'Same day emergency response', safetyWarning: 'Do not approach the open pit. High-visibility warning barricades placed.', actionPlan: ['Deploy high-visibility steel barricades and solar flashers immediately.', 'Cast and install heavy-duty precast RCC load-rated slab.', 'Inspect adjoining 50-meter drain alignment for structural cracks.'], duplicateKeywords: ['varthur market drain', 'open drain cover'], citizenMessage: 'Resolved — precast heavy-duty RCC slab installed and verified by Assistant Executive Engineer.', authorityNote: 'Resolution photograph and completion docket approved by SWD Chief Engineer.' },
  },
]
