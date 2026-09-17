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
type MoneyMatch={amount:number;currency:"EUR"|"USD"|"GBP"};
function parseNumber(raw:string):number{
  const value=raw.replace(/\s/g,"");
  if (/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(value)) return Number(value.replace(/,/g,""));
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(value)) return Number(value.replace(/\./g,"").replace(",","."));
  if (/^\d+[.,]\d{1,2}$/.test(value)) return Number(value.replace(",","."));
  return Number(value.replace(/[,.]/g,""));
}
function findMoney(text:string):MoneyMatch|null{
  const patterns:Array<{currency:MoneyMatch["currency"];re:RegExp}>=[
    {currency:"EUR",re:/(?:€|EUR)\s*(\d[\d\s.,]*)|(\d[\d\s.,]*)\s*(?:€|EUR)\b/i},
    {currency:"USD",re:/(?:\$|USD)\s*(\d[\d\s.,]*)|(\d[\d\s.,]*)\s*(?:USD)\b/i},
    {currency:"GBP",re:/(?:£|GBP)\s*(\d[\d\s.,]*)|(\d[\d\s.,]*)\s*(?:GBP)\b/i},
  ];
  const matches=patterns.flatMap(({currency,re})=>{const match=text.match(re);if(!match||match.index===undefined)return[];const amount=parseNumber((match[1]??match[2]).trim());return Number.isFinite(amount)?[{amount,currency,index:match.index}]:[]});
  matches.sort((a,b)=>a.index-b.index);
  return matches[0]?{amount:matches[0].amount,currency:matches[0].currency}:null;
}
export function assessDailyIncome(candidate:DailyIncomeCandidate):DailyIncomeAssessment{
  const text=`${candidate.title}\n${candidate.body}`;
  const money=findMoney(text);
  const rewardAmount=money?.amount??null;
  const currency=money?.currency??"UNKNOWN";
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
