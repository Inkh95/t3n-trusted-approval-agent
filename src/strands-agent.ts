import {Agent,tool} from "@strands-agents/sdk";
import {z} from "zod";
import type {ApprovalGateway} from "./gateway.ts";
import {prepareTaskAction,type TaskOpportunity} from "./task-hunter.ts";
import {runTrustedTaskWorkflow} from "./workflow.ts";

const taskSchema=z.object({
  id:z.string(),title:z.string(),platform:z.string(),url:z.string().url(),
  reward:z.object({amount:z.number().positive(),currency:z.string()}),
  payoutMethod:z.enum(["paypal","sepa","crypto","other","unverified"]),
  eligibility:z.enum(["eligible","unknown","blocked"]),
  aiPolicy:z.enum(["allowed","limited","forbidden"]),
  evidence:z.array(z.string()).min(1),rewardConfirmed:z.boolean(),
  upfrontCost:z.number().min(0),requiresKyc:z.boolean(),requiresCaptcha:z.boolean(),legalTermsClear:z.boolean()
});

export function createTrustedTaskHunterAgent(gateway:ApprovalGateway,agentDid="did:t3n:strands-task-hunter"){
  const evaluate=tool({name:"evaluate_paid_task",description:"Evaluate a paid task against the zero-cost trusted approval policy. Never infer missing evidence.",inputSchema:taskSchema,callback:(task)=>prepareTaskAction(task as TaskOpportunity,agentDid)});
  const start=tool({name:"start_eligible_task",description:"Start a task only when every standing approval control is explicitly satisfied. Returns REVIEW_REQUIRED otherwise.",inputSchema:taskSchema,callback:(task)=>runTrustedTaskWorkflow(task as TaskOpportunity,gateway,agentDid)});
  return new Agent({
    systemPrompt:"You are T3N Trusted Approval Agent. Use evaluate_paid_task before start_eligible_task. Never claim a task when evidence is missing. Never solve CAPTCHAs, handle credentials, perform KYC, send money, or hide AI use. Explain every blocker and fail closed.",
    tools:[evaluate,start]
  });
}
