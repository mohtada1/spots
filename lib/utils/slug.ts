export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s*-\s*/g, '-')     // Replace " - " with single hyphen
    .replace(/\s+/g, '-')         // Replace remaining spaces with hyphens
    .replace(/-+/g, '-')          // Remove duplicate hyphens
    .replace(/^-+|-+$/g, '')      // Remove hyphens from start/end
    .trim()
}

export function parseSlugId(slugId: string): { slug: string; id: string } {
  // UUID format: 8-4-4-4-12 characters (36 total with hyphens)
  // Look for UUID pattern at the end of the string
  const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i
  const match = slugId.match(uuidRegex)
  
  if (!match) {
    throw new Error('Invalid slug-id format: UUID not found')
  }
  
  const id = match[1]
  const slug = slugId.substring(0, slugId.length - id.length - 1) // -1 for the connecting hyphen
  
  return { slug, id }
}

export function createSlugId(name: string, id: string): string {
  const slug = generateSlug(name)
  return `${slug}-${id}`
}
