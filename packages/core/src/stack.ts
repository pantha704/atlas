// Stack extraction — pulls tech stack from GitHub repos + merges with declared stack.
// Used by impact reasoning to answer "does this affect YOUR stack?"

export interface GithubRepo {
  language: string | null
  topics: string[]
}

// Fetch a user's public repos from GitHub. Returns language + topics per repo.
// ponytail: one API call, 100 repos. Power users with 100+ repos are rare; paginate later if needed.
export async function fetchGithubRepos(username: string, token?: string): Promise<GithubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=owner`,
    { headers },
  )
  if (!res.ok) return []
  const repos = (await res.json()) as Array<{
    language: string | null
    topics?: string[]
  }>
  return repos.map((r) => ({ language: r.language, topics: r.topics ?? [] }))
}

// Extract stack signals from repos: languages + topics, normalized lowercase.
export function extractStackFromRepos(repos: GithubRepo[]): string[] {
  const stack = new Set<string>()
  for (const repo of repos) {
    if (repo.language) stack.add(repo.language.toLowerCase())
    for (const topic of repo.topics) stack.add(topic.toLowerCase())
  }
  return [...stack]
}

// Merge declared stack with extracted stack. Dedup, lowercase.
export function mergeStack(declared: string[], extracted: string[]): string[] {
  const set = new Set<string>()
  for (const s of [...declared, ...extracted]) set.add(s.toLowerCase().trim())
  return [...set].filter(Boolean)
}

// Full stack extraction: fetch GitHub repos + merge with declared.
export async function extractStack(
  githubUsername: string | null,
  declaredStack: string[],
  token?: string,
): Promise<string[]> {
  if (!githubUsername) return dedupeLower(declaredStack)
  const repos = await fetchGithubRepos(githubUsername, token)
  const extracted = extractStackFromRepos(repos)
  return mergeStack(declaredStack, extracted)
}

function dedupeLower(items: string[]): string[] {
  const set = new Set<string>()
  for (const s of items) {
    const t = s.toLowerCase().trim()
    if (t) set.add(t)
  }
  return [...set]
}
