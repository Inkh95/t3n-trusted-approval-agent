import { createHash } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { canonical } from "./crypto.ts";
import type { AuditEvent } from "./types.ts";
export class AuditLog {
 private events: AuditEvent[]=[]; private file?:string;
 constructor(file?:string){this.file=file}
 async load(){if(!this.file)return;try{const c=await readFile(this.file,"utf8");this.events=c.trim()?c.trim().split("\n").map(JSON.parse):[];if(!this.verify())throw Error("Audit log integrity check failed")}catch(e:any){if(e?.code!=="ENOENT")throw e}}
 async append(e:Omit<AuditEvent,"sequence"|"timestamp"|"previousHash"|"hash">){const previousHash=this.events.at(-1)?.hash??"GENESIS";const u={sequence:this.events.length+1,timestamp:new Date().toISOString(),...e,previousHash};const x={...u,hash:createHash("sha256").update(canonical(u)).digest("hex")};this.events.push(x);if(this.file){await mkdir(dirname(this.file),{recursive:true});await appendFile(this.file,JSON.stringify(x)+"\n",{mode:0o600})}return x}
 list(){return[...this.events]}
 verify(){return this.events.every((e,i)=>{const{hash,...u}=e;return e.previousHash===(i?this.events[i-1].hash:"GENESIS")&&hash===createHash("sha256").update(canonical(u)).digest("hex")})}
}
