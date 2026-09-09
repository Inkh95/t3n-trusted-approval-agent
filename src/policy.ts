import type{AgentAction,PolicyDecision}from"./types.ts";
const rules:Record<string,PolicyDecision>={
 "research.read":{decision:"allow",risk:"low",reason:"Read-only research is within the agent mandate.",rule:"research.read"},
 "task.draft":{decision:"allow",risk:"low",reason:"Drafting does not transmit data or bind the user.",rule:"task.draft"},
 "application.submit":{decision:"approval_required",risk:"high",reason:"Submitting represents the user to a third party.",rule:"application.submit"},
 "message.send":{decision:"approval_required",risk:"high",reason:"External communication requires human approval.",rule:"message.send"},
 "account.create":{decision:"approval_required",risk:"high",reason:"Persistent account creation requires human approval.",rule:"account.create"},
 "payment.send":{decision:"approval_required",risk:"critical",reason:"Payments up to EUR 50 require explicit approval.",rule:"payment.send"},
 "credential.share":{decision:"deny",risk:"critical",reason:"Raw credentials must never leave the trusted boundary.",rule:"credential.share"},
 "captcha.solve":{decision:"deny",risk:"critical",reason:"Anti-bot circumvention is forbidden.",rule:"captcha.solve"}};
export class PolicyEngine{evaluate(a:AgentAction):PolicyDecision{if(a.type==="payment.send"&&(a.amount??0)>50)return{decision:"deny",risk:"critical",reason:"Amount exceeds the configured 50 EUR limit.",rule:a.type};return rules[a.type]??{decision:"approval_required",risk:"high",reason:"Unknown actions fail closed and require review.",rule:"default-deny-by-review"}}}
