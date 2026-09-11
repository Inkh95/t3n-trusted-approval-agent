export type DailyIncomeCandidate = { title:string; body:string; url:string; labels:string[] };
export type IncomePlatform="Algora"|"Polar"|"Fiverr"|"Contra"|"GitHub";
export type DailyIncomeAssessment = { rewardAmount:number|null; currency:"EUR"|"USD"|"GBP"|"UNKNOWN"; aiPolicy:"AI ALLOWED"|"AI LIMITED"; payout:"PayPal"|"SEPA"|"Crypto"|"Unverified"; eligibility:"ELIGIBLE"|"UNKNOWN"; route:"GO"|"REVIEW_REQUIRED"; blockers:string[] };
export const incomeSources=[
  {platform:"Algora",discovery:"AUTOMATED",claim:"VERIFIED_ONLY"},
  {platform:"Polar",discovery:"AUTOMATED",claim:"VERIFIED_ONLY"},
  {platform:"Fiverr",discovery:"AUTOMATED",claim:"HUMAN_CONFIRMATION"},
  {platform:"Contra",discovery:"AUTOMATED",claim:"HUMAN_CONFIRMATION"},
] as const;
export function detectIncomePlatform(candidate:Pick<DailyIncomeCandidate,"title"|"body"|"url">):IncomePlatform{
  const text=`${candidate.title}\n${candidate.body}\n${candidate.url}`;
  if(/algora(?:\.io)?/i.test(text))return"Algora";
  if(/polar(?:\.sh)?/i.test(text))return"Polar";
  if(/fiverr(?:\.com)?/i.test(text))return"Fiverr";
  if(/contra(?:\.com)?/i.test(text))return"Contra";
  return"GitHub";
}
const moneyPatterns=[/(?:€|EUR\s?)(\d+(?:[.,]\d+)?)/i,/(?:\$|USD\s?)(\d+(?:[.,]\d+)?)/i,/(?:£|GBP\s?)(\d+(?:[.,]\d+)?)/i];
export function assessDailyIncome(candidate:DailyIncomeCandidate):DailyIncomeAssessment{
  const text=`${candidate.title}\n${candidate.body}`;
  const match=moneyPatterns.map(pattern=>text.match(pattern)).find(Boolean);
  const rewardAmount=match?Number(match[1].replace(",",".")):null;
  const currency=/€|EUR/i.test(text)?"EUR":/£|GBP/i.test(text)?"GBP":/\$|USD/i.test(text)?"USD":"UNKNOWN";
  const aiAllowed=/(?:AI|LLM|agent|generative AI)\s+(?:is\s+)?(?:allowed|permitted|welcome)/i.test(text);
  const payout=/PayPal/i.test(text)?"PayPal":/SEPA|bank transfer/i.test(text)?"SEPA":/USDC|USDT|crypto|wallet/i.test(text)?"Crypto":"Unverified";
  const eligibility=/worldwide|global|any country|international applicants/i.test(text)?"ELIGIBLE":"UNKNOWN";
  const blockers:string[]=[];
  if(!rewardAmount||rewardAmount<=0)blockers.push("REWARD_UNVERIFIED");
  if(!aiAllowed)blockers.push("AI_POLICY_UNVERIFIED");
  if(payout==="Unverified")blockers.push("PAYOUT_UNVERIFIED");
  if(eligibility==="UNKNOWN")blockers.push("BULGARIA_ELIGIBILITY_UNVERIFIED");
  return{rewardAmount,currency,aiPolicy:aiAllowed?"AI ALLOWED":"AI LIMITED",payout,eligibility,route:blockers.length===0&&(payout==="PayPal"||payout==="SEPA")?"GO":"REVIEW_REQUIRED",blockers};
}
