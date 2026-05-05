import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export async function generatePostSummary(
  title: string,
  body: string
): Promise<string> {
  const plainBody = body.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

  const prompt = `You are a professional blog editor. Write a concise, engaging summary of the following blog post in approximately 200 words. 
  
The summary should:
- Capture the key points and value for the reader
- Be written in third person
- Start with an engaging hook
- Be suitable to display as a preview on a blog listing page
- NOT include phrases like "This article..." or "This blog post..."

Blog post title: "${title}"

Blog post content:
${plainBody.slice(0, 3000)}

Write only the summary, no additional commentary.`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text().trim()
}

export async function suggestTags(
  title: string,
  body: string
): Promise<string[]> {
  const plainBody = body.replace(/<[^>]+>/g, '').trim()

  const prompt = `Based on this blog post, suggest 3-5 relevant tags/keywords.
Return ONLY a JSON array of lowercase strings, no explanation.
Example: ["technology", "web development", "nextjs"]

Title: "${title}"
Content: ${plainBody.slice(0, 1000)}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

export async function suggestTitles(
  currentTitle: string,
  body: string
): Promise<string[]> {
  const plainBody = body.replace(/<[^>]+>/g, '').trim()

  const prompt = `Suggest 3 improved, SEO-friendly and engaging blog post titles as alternatives to the current title.
Return ONLY a JSON array of strings, no explanation.
Example: ["Better Title One", "Better Title Two", "Better Title Three"]

Current title: "${currentTitle}"
Content preview: ${plainBody.slice(0, 500)}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}
