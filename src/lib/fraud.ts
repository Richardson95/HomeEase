import type { Property } from '@/types'

// ============================================================================
// AI Duplicate / Fraud detection (Section 7).
// Heuristic, on-device simulation of an embedding-similarity service.
// Compares description (token Jaccard), location, rent proximity and image
// fingerprints to produce a 0–100 fraud score. Tuned to reduce false positives:
// a listing is only flagged when MULTIPLE independent signals agree.
// ============================================================================

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'has', 'are', 'you', 'all',
  'very', 'spacious', 'lovely', 'nice', 'good', 'great', 'located', 'available',
])

/** Jaccard similarity between two token sets (0–1). */
function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a)
  const sb = new Set(b)
  if (sa.size === 0 || sb.size === 0) return 0
  let inter = 0
  for (const t of sa) if (sb.has(t)) inter++
  return inter / (sa.size + sb.size - inter)
}

/** Image "fingerprint" overlap — in production this would be a perceptual hash. */
function imageOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0
  const sb = new Set(b.map(fingerprint))
  const shared = a.map(fingerprint).filter((f) => sb.has(f)).length
  return shared / Math.min(a.length, b.length)
}

function fingerprint(url: string): string {
  // Strip query/cache-busting so the same source image matches across listings.
  return url.split('?')[0].split('/').pop() || url
}

function addressSimilarity(a: Property, b: Property): number {
  let score = 0
  if (a.lga.toLowerCase() === b.lga.toLowerCase()) score += 0.5
  const an = normalize(a.location)
  const bn = normalize(b.location)
  score += 0.5 * jaccard(an, bn)
  return score
}

export interface DuplicateResult {
  fraudScore: number // 0–100
  matchedPropertyId?: string
  reasons: string[]
}

/**
 * Score a candidate listing against existing ones. Only listings owned by a
 * DIFFERENT user are considered duplicates (an owner re-listing their own
 * property is legitimate), which removes the most common false positive.
 */
export function detectDuplicate(candidate: Property, existing: Property[]): DuplicateResult {
  let best: DuplicateResult = { fraudScore: 0, reasons: [] }
  const candTokens = normalize(`${candidate.title} ${candidate.description}`)

  for (const other of existing) {
    if (other.id === candidate.id) continue
    if (other.ownerId === candidate.ownerId) continue // same owner = not fraud

    const descSim = jaccard(candTokens, normalize(`${other.title} ${other.description}`))
    const addrSim = addressSimilarity(candidate, other)
    const imgSim = imageOverlap(candidate.images, other.images)
    const rentClose =
      candidate.rent > 0 && other.rent > 0
        ? 1 - Math.min(1, Math.abs(candidate.rent - other.rent) / Math.max(candidate.rent, other.rent))
        : 0

    const reasons: string[] = []
    // Require corroborating signals — a single high signal is not enough.
    let signals = 0
    if (imgSim >= 0.5) { signals++; reasons.push(`${Math.round(imgSim * 100)}% identical photos`) }
    if (descSim >= 0.55) { signals++; reasons.push(`${Math.round(descSim * 100)}% description match`) }
    if (addrSim >= 0.8) { signals++; reasons.push('same address & area') }
    if (rentClose >= 0.97 && addrSim >= 0.5) { signals++; reasons.push('identical rent & location') }

    // Weighted score, but gated by number of agreeing signals to cut false positives.
    const raw = 0.45 * imgSim + 0.3 * descSim + 0.15 * addrSim + 0.1 * rentClose
    const gate = signals >= 2 ? 1 : signals === 1 ? 0.45 : 0.15
    const fraudScore = Math.round(Math.min(100, raw * 100 * gate))

    if (fraudScore > best.fraudScore) {
      best = { fraudScore, matchedPropertyId: other.id, reasons }
    }
  }
  return best
}

export const FRAUD_FLAG_THRESHOLD = 70 // >= this auto-routes to manual review queue
