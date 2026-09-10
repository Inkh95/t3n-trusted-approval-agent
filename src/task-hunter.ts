import type {AgentAction} from "./types.ts";

export type AiPolicy="allowed"|"limited"|"forbidden";
export type Eligibility="eligible"|"unknown"|"blocked";

export interface TaskOpportunity{
  id:string;
  title:string;
  platform:string;
  url:string;
  reward:{amount:number;currency:string};
  payoutMethod:"paypal"|"sepa"|"crypto"|"other"|"unverified";
  eligibility:Eligibility;
  aiPolicy:AiPolicy;
  evidence:string[];
}

export interface TaskIntakeResult{
  classification:"AI ALLOWED"|"AI LIMITED"|"AI FORBIDDEN";
  ready:boolean;
  autoApproved:boolean;
  payoutRoute:"revolut_sepa"|"paypal"|"manual";
  blockers:string[];
  action:Omit<AgentAction,"id"|"createdAt">;
}

export function prepareTaskAction(task:TaskOpportunity,agentDid="did:t3n:task-hunter"):TaskIntakeResult{
  const blockers:string[]=[];
  if(task.eligibility==="blocked")blockers.push("Task is not available in Bulgaria");
  if(task.eligibility==="unknown")blockers.push("Country eligibility is not verified");
  if(task.payoutMethod==="unverified")blockers.push("Payout method is not verified");
  if(!Number.isFinite(task.reward.amount)||task.reward.amount<=0)blockers.push("Reward must be a confirmed positive amount");
  if(task.aiPolicy==="forbidden")blockers.push("Platform forbids AI assistance");
  if(!task.url.startsWith("https://"))blockers.push("Task URL must use HTTPS");
  const classification=task.aiPolicy==="allowed"?"AI ALLOWED":task.aiPolicy==="limited"?"AI LIMITED":"AI FORBIDDEN";
  const payoutRoute=task.payoutMethod==="sepa"?"revolut_sepa":task.payoutMethod==="paypal"?"paypal":"manual";
  const autoApproved=blockers.length===0&&task.aiPolicy==="allowed"&&task.reward.amount>0&&(task.payoutMethod==="sepa"||task.payoutMethod==="paypal");
  return{
    classification,
    ready:blockers.length===0,
    autoApproved,
    payoutRoute,
    blockers,
    action:{
      agentDid,
      type:task.aiPolicy==="forbidden"?"task.ai_forbidden":"application.submit",
      target:task.url,
      summary:`Apply for ${task.title} on ${task.platform}`,
      amount:task.reward.amount,
      currency:task.reward.currency,
      payload:{taskId:task.id,platform:task.platform,payoutMethod:task.payoutMethod,payoutRoute,aiPolicy:task.aiPolicy,standingApproval:autoApproved,evidence:task.evidence}
    }
  };
}
