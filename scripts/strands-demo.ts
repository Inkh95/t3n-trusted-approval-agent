import {AuditLog} from "../src/audit.ts";
import {ApprovalGateway} from "../src/gateway.ts";
import {runTrustedTaskWorkflow} from "../src/workflow.ts";
import {createTrustedTaskHunterAgent} from "../src/strands-agent.ts";

const audit=new AuditLog();
const gateway=new ApprovalGateway("demo-only-secret",audit);
const safeTask={id:"demo-safe-1",title:"Document an open-source API",platform:"Demo Bounty Board",url:"https://example.com/tasks/1",reward:{amount:50,currency:"EUR"},payoutMethod:"sepa" as const,eligibility:"eligible" as const,aiPolicy:"allowed" as const,evidence:["Official terms confirm EUR 50 reward, Bulgaria eligibility, AI use and SEPA payout"],rewardConfirmed:true,upfrontCost:0,requiresKyc:false,requiresCaptcha:false,legalTermsClear:true};
const unsafeTask={...safeTask,id:"demo-risk-1",title:"Unverified crypto listing",payoutMethod:"crypto" as const,rewardConfirmed:false,requiresKyc:true};

console.log("SAFE TASK",await runTrustedTaskWorkflow(safeTask,gateway));
console.log("RISKY TASK",await runTrustedTaskWorkflow(unsafeTask,gateway));
console.log("AUDIT CHAIN",{valid:audit.verify(),events:audit.list().length});

if(process.env.RUN_STRANDS_MODEL==="1"){
  const agent=createTrustedTaskHunterAgent(gateway);
  console.log(await agent.invoke("Evaluate the supplied demo opportunities and explain why only a fully verified task may start."));
}else console.log("Strands model invocation skipped: set RUN_STRANDS_MODEL=1 with an authorized model provider to run it.");
