export type Decision="allow"|"approval_required"|"deny";
export interface AgentAction{id:string;agentDid:string;type:string;target:string;summary:string;payload:Record<string,unknown>;amount?:number;currency?:string;createdAt:string}
export interface PolicyDecision{decision:Decision;risk:"low"|"high"|"critical";reason:string;rule:string}
export interface ApprovalRecord{actionId:string;actionDigest:string;approverDid:string;issuedAt:string;expiresAt:string;nonce:string}
export interface AuditEvent{sequence:number;timestamp:string;event:string;actionId?:string;actorDid:string;detail:Record<string,unknown>;previousHash:string;hash:string}
