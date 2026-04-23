import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = 'src/content/blog'
const SITE_URL  = 'https://www.coacheckin.com'
const TODAY     = new Date().toISOString().split('T')[0]

const KEYWORD_TARGETS = [
  { keyword: 'how to get more personal training clients',        tags: ['client acquisition', 'personal trainer tips', 'coaching business'] },
  { keyword: 'online personal trainer pricing guide',            tags: ['personal trainer pricing', 'coaching business', 'online coaching'] },
  { keyword: 'personal trainer client onboarding process',       tags: ['client onboarding', 'personal trainer tips', 'coaching workflow'] },
  { keyword: 'how to scale your online coaching business',       tags: ['scale coaching business', 'online coaching', 'coaching growth'] },
  { keyword: 'fitness coach vs personal trainer differences',    tags: ['fitness coach', 'personal trainer', 'coaching'] },
  { keyword: 'online coaching program structure best practices', tags: ['coaching program', 'program design', 'online coaching'] },
  { keyword: 'workout program design for clients',               tags: ['workout program design', 'personal trainer tips', 'program design'] },
  { keyword: 'fitness check-in questions for clients',           tags: ['client check-ins', 'habit tracking', 'coaching workflow'] },
  { keyword: 'how to use client data to improve coaching',       tags: ['fitness data tracking', 'client results', 'coaching technology'] },
  { keyword: 'building a personal training brand online',        tags: ['personal training brand', 'coaching business', 'online presence'] },
  { keyword: 'best practices for online fitness coaching',       tags: ['online fitness coaching', 'coaching best practices', 'personal trainer tips'] },
  { keyword: 'how to write effective workout programs',          tags: ['workout program writing', 'program design', 'personal trainer tips'] },
  { keyword: 'personal trainer burnout prevention',             tags: ['trainer burnout', 'coaching business', 'personal trainer tips'] },
  { keyword: 'how to run a successful fitness check-in call',   tags: ['check-in call', 'client communication', 'coaching workflow'] },
  { keyword: 'fitness client progress tracking methods',        tags: ['progress tracking', 'client results', 'personal trainer tips'] },
]

// ── Read existing posts ──────────────────────────────────────────────────────
const existingFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
const coveredTags   = new Set()
const existingPosts = []

for (const file of existingFiles) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
  const { data } = matter(raw)
  for (const tag of (data.tags ?? [])) coveredTags.add(tag)
  if (data.title) existingPosts.push({ title: data.title, slug: file.replace(/\.md$/, '') })
}

const target =
  KEYWORD_TARGETS.find(t => !t.tags.some(tag => coveredTags.has(tag))) ??
  KEYWORD_TARGETS[Math.floor(Math.random() * KEYWORD_TARGETS.length)]

// ── Build related posts list for internal linking ────────────────────────────
const relatedLinks = existingPosts
  .slice(0, 3)
  .map(p => `- [${p.title}](${SITE_URL}/blog/${p.slug})`)
  .join('\n')

// ── System prompt ────────────────────────────────────────────────────────────
const systemPrompt = `You are a fitness coach and business owner who has been running a successful online coaching business for 8+ years and managed hundreds of clients. You write a blog for other fitness coaches — not for gym-goers or consumers. Your readers are professionals trying to grow and run a better coaching business.

YOUR WRITING STYLE — follow these exactly:
- You have opinions. You take sides. You disagree with the generic advice coaches usually hear.
- You write like you're talking to a colleague, not lecturing a student.
- You use specific numbers: not "many coaches", but "most coaches charging under $200/month". Not "it takes time", but "expect 90 days before you see consistent referrals".
- You mix sentence lengths. Short. Then a longer one that explains the nuance or tells a story.
- You use real coach scenarios: "I had a client who logged perfect workouts for 6 weeks but her habits data told a different story — she was sleeping 4 hours a night."
- You use natural transitions: "Here's the thing:", "I'll be honest:", "The coaches who struggle most with this are the ones who...", "This took me way too long to figure out:"

WHAT YOU NEVER WRITE:
- Never start with "In today's fast-paced world" or any version of it
- Never write "It's worth noting that" or "It's important to remember"
- Never write "In this article, we will..." or "By the end of this post..."
- Never use "Additionally", "Furthermore", "In conclusion" as filler transitions
- Never write vague generalities — every claim needs a specific detail behind it
- Never sound like a content brief was handed to you

SEO REQUIREMENTS:
- Use the target keyword naturally within the first 100 words (don't force it)
- Use the keyword or a close variant in at least 2 H2 headings
- Body content: 1500–1800 words (not counting frontmatter or FAQ)
- Use H2 and H3 subheadings to structure sections
- Include at least one specific internal link to another Coacheckin blog post (if provided)
- Include one natural mention of Coacheckin near the end, linking to /signup

OUTPUT FORMAT:
Output ONLY the complete markdown file — frontmatter + body. No code fences. No explanations.

The frontmatter MUST follow this exact YAML format:
---
title: "Post Title Here"
description: "Meta description, 150-160 characters, compelling, includes the keyword"
date: "${TODAY}"
author: "Coacheckin Team"
tags: ["tag1", "tag2", "tag3"]
faq:
  - question: "A real question coaches ask about this topic"
    answer: "A specific, 2-3 sentence answer"
  - question: "Another practical question"
    answer: "Another specific answer"
  - question: "A third question"
    answer: "A third answer"
---

The FAQ must have exactly 3 items. Questions should be things coaches actually search for.`

// ── Call Claude ──────────────────────────────────────────────────────────────
const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 4096,
  thinking: { type: 'adaptive' },
  system: [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [
    {
      role: 'user',
      content: `Write a blog post targeting this keyword: "${target.keyword}"

Tags to include: ${target.tags.join(', ')}

Already published posts on this blog (for internal linking and to avoid overlap):
${relatedLinks || '(none yet)'}

Other published titles to avoid repeating angles from:
${existingPosts.map(p => `- ${p.title}`).join('\n') || '(none yet)'}

Write the complete markdown file now. Remember: 1500–1800 words of body content, 3 FAQ items in frontmatter, keyword in first 100 words, opinionated voice.`,
    },
  ],
})

const textBlock = response.content.find(b => b.type === 'text')
if (!textBlock || textBlock.type !== 'text') {
  console.error('No text content in Claude response')
  process.exit(1)
}

let content = textBlock.text.trim()

// Strip accidental code fences
if (content.startsWith('```')) {
  content = content.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim()
}

// Parse frontmatter
let postData
try {
  postData = matter(content).data
} catch (e) {
  console.error('Failed to parse frontmatter:', e.message)
  process.exit(1)
}

if (!postData.title) {
  console.error('Generated post is missing a title')
  process.exit(1)
}

const slug = postData.title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

const filename = `${slug}.md`
const filepath = path.join(POSTS_DIR, filename)

if (fs.existsSync(filepath)) {
  console.log(`Post already exists — skipping: ${filename}`)
  process.exit(0)
}

fs.writeFileSync(filepath, content)
console.log(`Generated: ${filename}`)

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `filename=${filename}\n`)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${slug}\n`)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `title=${postData.title}\n`)
}
