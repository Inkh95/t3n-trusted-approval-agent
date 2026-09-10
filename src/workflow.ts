import type {ApprovalGateway} from "./gateway.ts";
import {prepareTaskAction,type TaskOpportunity} from "./task-hunter.ts";

export type WorkflowStatus="REVIEW_REQUIRED"|"CLAIMED";

export async function runTrustedTaskWorkflow(task:TaskOpportunity,gateway:ApprovalGateway,agentDid="did:t3n:strands-task-hunter"){
  const intake=prepareTaskAction(task,agentDid);
  if(!intake.autoApproved)return{status:"REVIEW_REQUIRED" as WorkflowStatus,intake};
  const requested=await gateway.request(intake.action);
  const receipt=await gateway.execute(requested.action.id);
  return{status:"CLAIMED" as WorkflowStatus,intake,policy:requested.policy,receipt};
}
