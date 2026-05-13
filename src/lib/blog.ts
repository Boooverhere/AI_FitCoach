import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

const POSTS_DIR = path.join(process.cwd(), 'src/content/blog')

export interface FaqItem {
  question: string
  answer: string
}

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  readingTime: number
  faq: FaqItem[]
  coverImage?: string
}

export interface Post extends PostMeta {
  html: string
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

export function getAllPostMetas(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))
  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
      const { data, content } = matter(raw)
      return {
        slug,
        title: data.title as string,
        description: data.description as string,
        date: data.date as string,
        author: data.author as string,
        tags: (data.tags as string[]) ?? [],
        readingTime: readingTime(content),
        faq: (data.faq as FaqItem[]) ?? [],
        coverImage: (data.coverImage as string) ?? undefined,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPost(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const html = await marked(content)
  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    author: data.author as string,
    tags: (data.tags as string[]) ?? [],
    readingTime: readingTime(content),
    faq: (data.faq as FaqItem[]) ?? [],
    coverImage: (data.coverImage as string) ?? undefined,
    html,
  }
}
