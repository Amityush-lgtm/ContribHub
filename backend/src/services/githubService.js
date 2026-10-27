/**
 * GitHub Integration Service
 * Fetches public pull requests, repository metadata, and syncs PR statuses.
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Common request headers for GitHub REST API
 */
const getHeaders = () => {
  const headers = {
    'User-Agent': 'ContribHub-Mentorship-App',
    'Accept': 'application/vnd.github.v3+json'
  };

  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Extracts { owner, repo, pullNumber } from a GitHub Pull Request URL
 * e.g., https://github.com/facebook/react/pull/24680
 */
export const parseGitHubPrUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: parseInt(match[3], 10)
  };
};

/**
 * Infers the contribution type from PR title, body, and labels
 */
export const inferContributionType = (title = '', body = '', labels = []) => {
  const labelNames = Array.isArray(labels)
    ? labels.map((l) => (typeof l === 'string' ? l : l.name || '')).join(' ')
    : '';
  const text = `${title} ${labelNames} ${body.slice(0, 300)}`.toLowerCase();

  if (/\b(fix|bug|hotfix|patch|resolve|closes|closed|repair)\b/i.test(text)) {
    return 'bug_fix';
  }
  if (/\b(feat|feature|add|implement|support|new|create)\b/i.test(text)) {
    return 'feature';
  }
  if (/\b(doc|docs|documentation|readme|guide|tutorial|typo)\b/i.test(text)) {
    return 'documentation';
  }
  if (/\b(test|tests|spec|specs|coverage|e2e|unit|jest)\b/i.test(text)) {
    return 'testing';
  }
  if (/\b(refactor|clean|cleanup|perf|performance|optimize|style|chore)\b/i.test(text)) {
    return 'refactoring';
  }
  if (/\b(research|rfc|proposal|investigate|poc|spike)\b/i.test(text)) {
    return 'research';
  }
  return 'other';
};

/**
 * Infers technologies based on repo language and keywords
 */
export const inferTechnologies = (title = '', body = '', repoLang = '') => {
  const techSet = new Set();
  if (repoLang) techSet.add(repoLang);

  const keywords = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
    'Node.js', 'Express', 'Python', 'Django', 'Flask', 'FastAPI',
    'Go', 'Golang', 'Rust', 'Java', 'Spring', 'C++', 'C#', '.NET',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'HTML', 'CSS', 'Tailwind',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
    'GraphQL', 'REST', 'Jest', 'Git'
  ];

  const fullText = ` ${title} ${body} `.toLowerCase();
  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const pattern = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'i');
      if (pattern.test(fullText)) {
        techSet.add(kw);
      }
    } catch (_) {
      if (fullText.includes(kw.toLowerCase())) {
        techSet.add(kw);
      }
    }
  }

  return Array.from(techSet).slice(0, 6);
};

/**
 * Fetches recent public pull requests authored by a GitHub user
 */
export const fetchUserPullRequests = async (username, limit = 25) => {
  if (!username || !username.trim()) {
    throw new Error('A GitHub username is required for syncing.');
  }

  const cleanUsername = username.trim().replace(/^@/, '');
  const query = encodeURIComponent(`type:pr author:${cleanUsername}`);
  const url = `${GITHUB_API_BASE}/search/issues?q=${query}&sort=updated&order=desc&per_page=${limit}`;

  const response = await fetch(url, { headers: getHeaders() });

  if (response.status === 403 || response.status === 429) {
    const resetTime = response.headers.get('x-ratelimit-reset');
    const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000).toLocaleTimeString() : 'soon';
    throw new Error(`GitHub API rate limit exceeded. Please try again after ${resetDate} or configure a GITHUB_TOKEN.`);
  }

  if (response.status === 422) {
    throw new Error(`GitHub user "${cleanUsername}" was not found or has no public activity.`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch from GitHub API (${response.status} ${response.statusText}).`);
  }

  const data = await response.json();
  return data.items || [];
};

/**
 * Fetches single pull request details (to check exact merge status)
 */
export const fetchPullRequestDetails = async (owner, repo, pullNumber) => {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`;
  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    return null;
  }

  return response.json();
};
