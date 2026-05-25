/**
 * Returns cross-niche affinity data for the given niche.
 * Week 2: uses mock scores from the affinityEngine.
 * Week 3: switch computeAffinity to use computeRealOverlapScore.
 */

const VALID_NICHES = new Set(['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories']);

// Mock affinity scores — replace with real data in Week 3
const MOCK_AFFINITY = {
  Trades:         [
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',      engagement_pct: 42, examples: ['Building a survival shelter', 'Wilderness navigation'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',              engagement_pct: 24, examples: ['ADHD at work', 'Neurodivergent adults in trades'] },
    { category: 'Mythology',      description: 'African mythology & world culture enthusiasts',   engagement_pct: 18, examples: ['Craftsmen in mythology', 'African smithing traditions'] },
    { category: 'Stories',        description: '1001 Nights & world storytelling audiences',      engagement_pct: 15, examples: ['Stories of trade guilds', 'Oral traditions'] },
  ],
  Mythology:      [
    { category: 'Stories',        description: '1001 Nights & world storytelling audiences',      engagement_pct: 55, examples: ['Scheherazade', 'Anansi stories', 'Folklore'] },
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',      engagement_pct: 22, examples: ['Survival myths', 'Nature spirits'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',              engagement_pct: 20, examples: ['Mythic thinking', 'Cultural neurodiversity'] },
    { category: 'Trades',         description: 'Skilled trade workers & vocational training',     engagement_pct: 18, examples: ['Smithing myths', 'Craftsmen legends'] },
  ],
  Scouts:         [
    { category: 'Trades',         description: 'Skilled trade workers & vocational training',     engagement_pct: 42, examples: ['Tool use', 'Knot tying', 'Outdoor construction'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',              engagement_pct: 31, examples: ['Scouting for ADHD kids', 'Outdoor therapy'] },
    { category: 'Mythology',      description: 'African mythology & world culture enthusiasts',   engagement_pct: 22, examples: ['Native American traditions', 'Wilderness folklore'] },
    { category: 'Stories',        description: '1001 Nights & world storytelling audiences',      engagement_pct: 19, examples: ['Campfire stories', 'Oral tradition'] },
  ],
  Neurodivergent: [
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',      engagement_pct: 31, examples: ['Outdoor therapy', 'Nature & ADHD'] },
    { category: 'Stories',        description: '1001 Nights & world storytelling audiences',      engagement_pct: 28, examples: ['Bedtime stories', 'Sensory-friendly content'] },
    { category: 'Trades',         description: 'Skilled trade workers & vocational training',     engagement_pct: 24, examples: ['Trades & autism employment', 'Vocational paths'] },
    { category: 'Mythology',      description: 'African mythology & world culture enthusiasts',   engagement_pct: 20, examples: ['Cultural identity', 'Mythic narratives'] },
  ],
  Stories:        [
    { category: 'Mythology',      description: 'African mythology & world culture enthusiasts',   engagement_pct: 55, examples: ['Yoruba mythology', 'African folktales'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',              engagement_pct: 28, examples: ['Bedtime routines', 'Soothing narratives'] },
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',      engagement_pct: 19, examples: ['Adventure stories', 'Campfire tales'] },
    { category: 'Trades',         description: 'Skilled trade workers & vocational training',     engagement_pct: 15, examples: ['Artisan stories', 'Craftsmen folklore'] },
  ],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { niche } = req.query;

  if (!niche || !VALID_NICHES.has(niche)) {
    return res.status(400).json({ error: 'Invalid niche' });
  }

  try {
    const data = MOCK_AFFINITY[niche] || [];
    res.status(200).json(data);
  } catch (err) {
    console.error('[api/affinity]', err.message);
    res.status(500).json({ error: 'Failed to fetch affinity data' });
  }
}
