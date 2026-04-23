import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = 'src/content/blog'
const TODAY = new Date().toISOString().split('T')[0]

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
]

// Read existing posts
const existingFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))
const coveredTags = new Set()
const existingTitles = []

for (const file of existingFiles) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
  const { data } = matter(raw)
  for (const tag of (data.tags ?? [])) coveredTags.add(tag)
  if (data.title) existingTitles.push(data.title)
}

// Pick the first keyword whose tags haven't been covered yet; fall back to random
const target =
  KEYWORD_TARGETS.find(t => !t.tags.some(tag => coveredTags.has(tag))) ??
  KEYWORD_TARGETS[Math.floor(Math.random() * KEYWORD_TARGETS.length)]

// ── Claude ────────────────────────────────────────────────────────────────────
const client = new Anthropic()

const systemPrompt = `You are a senior content writer for Coacheckin (coacheckin.com), an AI-powered platform built for online personal trainers and fitness coaches.

About Coacheckin:
- All-in-one platform: workout program builder, weekly client check-ins, habit tracking, progress photo tracking, messaging, AI daily digests
- Target audience: online personal trainers, fitness coaches, health coaches who manage multiple clients remotely
- Tone: professional, practical, direct — not salesy or generic

Writing standards:
- 700–1000 words of body content
- Use H2 and H3 subheadings to break up sections
- Be specific and actionable — readers should walk away with something they can use today
- End with a natural, non-pushy CTA to try Coacheckin (link to /signup)
- Write like an experienced coach, not a content farm

Output ONLY the complete markdown file including frontmatter. No explanations, no code fences, no extra commentary.

Use this exact frontmatter format:
---
title: "Your Title Here"
description: "Meta description 150-160 chars"
date: "${TODAY}"
author: "Coacheckin Team"
tags: ["tag1", "tag2", "tag3"]
---`

const response = await client.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 2048,
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

Already published (avoid overlap in topic or angle):
${existingTitles.map(t => `- ${t}`).join('\n')}

Use these tags: ${target.tags.join(', ')}

Write the complete markdown file now.`,
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

// Parse frontmatter to derive the slug
let postData
try {
  postData = matter(content).data
} catch (e) {
  console.error('Failed to parse frontmatter:', e.message)
  process.exit(1)
}

if (!postData.title) {
  console.error('Generated post is missing a title in frontmatter')
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

// Expose outputs to GitHub Actions
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `filename=${filename}\n`)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${slug}\n`)
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `title=${postData.title}\n`)
}
