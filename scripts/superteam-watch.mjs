const baseUrl = "https://superteam.fun";
const apiKey = process.env.SUPERTEAM_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

if (!apiKey) throw new Error("SUPERTEAM_API_KEY is required");

const headers = {Authorization: `Bearer ${apiKey}`};
const now = Date.now();

async function getJson(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function futureDeadline(listing) {
  const deadline = Date.parse(listing.deadline ?? "");
  return Number.isFinite(deadline) && deadline > now;
}

function amountFrom(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function rewardFrom(detail) {
  const candidates = [
    detail.rewardAmount,
    detail.reward,
    detail.compensation,
    detail.totalReward,
    detail.rewards?.[0]?.amount,
    detail.rewards?.[0]?.value,
  ];
  return candidates.map(amountFrom).find((value) => value && value > 0) ?? null;
}

async function existingIssue(slug) {
  if (!githubToken || !repository) return false;
  const query = encodeURIComponent(`repo:${repository} is:issue \"Superteam slug: ${slug}\"`);
  const result = await getJson(`https://api.github.com/search/issues?q=${query}`, {
    headers: {Authorization: `Bearer ${githubToken}`, Accept: "application/vnd.github+json"},
  });
  return result.total_count > 0;
}

async function createReviewIssue(listing, detail, reward) {
  if (!githubToken || !repository || await existingIssue(listing.slug)) return;
  const title = `[TASK HUNTER][REVIEW] ${listing.title} — ${reward ?? "reward unverified"}`;
  const body = [
    "Status: FOUND",
    "Platform: Superteam Earn",
    `Task URL: ${baseUrl}/earn/listing/${listing.slug}`,
    `Reward: ${reward ?? "UNVERIFIED"}`,
    "Payout method: crypto wallet",
    "Payout speed: UNVERIFIED",
    "Bulgaria eligibility: UNKNOWN",
    `AI policy: ${listing.agentAccess === "AGENT_ONLY" ? "AI ALLOWED (AGENT ONLY)" : "AI ALLOWED"}`,
    `Deadline: ${listing.deadline}`,
    "Recommendation: MANUAL REVIEW — crypto payout and eligibility require confirmation",
    `Superteam slug: ${listing.slug}`,
    `Evidence: official authenticated Superteam Agent API; listing id ${listing.id}`,
    detail.description ? `Description: ${String(detail.description).slice(0, 1500)}` : null,
  ].filter(Boolean).join("\n");
  await getJson(`https://api.github.com/repos/${repository}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({title, body}),
  });
}

const listings = await getJson(`${baseUrl}/api/agents/listings/live?take=100`, {headers});
const active = (Array.isArray(listings) ? listings : listings.data ?? listings.listings ?? [])
  .filter((listing) => ["AGENT_ALLOWED", "AGENT_ONLY"].includes(listing.agentAccess))
  .filter(futureDeadline);

for (const listing of active) {
  const detail = await getJson(`${baseUrl}/api/agents/listings/details/${encodeURIComponent(listing.slug)}`, {headers});
  await createReviewIssue(listing, detail, rewardFrom(detail));
}

console.log(JSON.stringify({checkedAt: new Date().toISOString(), received: listings.length ?? 0, active: active.length}));
