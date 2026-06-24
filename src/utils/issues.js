import { demoIssues } from '../data/demoIssues'

const STORAGE_KEY = 'nammafix-issues-v1'

export const statuses = ['Reported', 'Verified', 'Assigned', 'In Progress', 'Resolved']
export const categories = ['Pothole / Road Damage', 'Garbage / Waste', 'Broken Streetlight', 'Water Leakage', 'Drainage Issue', 'Public Infrastructure Damage', 'Other']

export const severityStyles = {
  Low: 'border-civic/30 bg-civic/10 text-civic',
  Medium: 'border-sky-500/30 bg-sky-500/15 text-sky-200',
  High: 'border-amber/50 bg-amber text-ink',
  Critical: 'border-danger bg-danger text-white',
}

export const statusStyles = {
  Reported: 'border-sky-500/30 bg-sky-500/15 text-sky-200',
  Verified: 'border-civic/30 bg-civic/10 text-civic',
  Assigned: 'border-amber/35 bg-amber/10 text-amber',
  'In Progress': 'border-sky-500/30 bg-sky-500/15 text-sky-200',
  Resolved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
}

export function loadIssues() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : demoIssues
  } catch {
    return demoIssues
  }
}

export function persistIssues(issues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues))
}

export const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(date))
export const urgencyTone = (score) => score >= 85 ? 'bg-rose-400' : score >= 70 ? 'bg-orange-400' : score >= 50 ? 'bg-yellow-300' : 'bg-emerald-400'

const stopWords = new Set(['the', 'and', 'near', 'road', 'main', 'with', 'from', 'this', 'that', 'issue', 'report', 'area', 'lane', 'stop', 'for', 'has', 'been'])

const wordsFrom = (value = '') => new Set(
  value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length > 2 && !stopWords.has(word)),
)

const sharedWordCount = (first, second) => [...first].filter((word) => second.has(word)).length

/** Lightweight, transparent duplicate matching for this local MVP. */
export function findPossibleDuplicates(candidate, issues) {
  const candidatePlace = wordsFrom(`${candidate.area || ''} ${candidate.location || ''}`)
  const candidateTitle = wordsFrom(candidate.title)
  return issues.filter((issue) => {
    const issuePlace = wordsFrom(`${issue.area || ''} ${issue.location || ''}`)
    const issueTitle = wordsFrom(issue.title)
    const sameCategory = candidate.category && candidate.category === issue.category
    const locationOverlap = sharedWordCount(candidatePlace, issuePlace)
    const titleOverlap = sharedWordCount(candidateTitle, issueTitle)
    return (sameCategory && (locationOverlap >= 1 || titleOverlap >= 1)) || locationOverlap >= 2 || titleOverlap >= 2
  }).slice(0, 3)
}

