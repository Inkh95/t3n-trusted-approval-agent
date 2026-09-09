export interface IdentityProvider { connect(): Promise<{did:string;mode:"mock"|"t3n"}> }
export class MockIdentityProvider implements IdentityProvider { async connect(){return{did:"did:t3n:demo-approval-agent",mode:"mock" as const}} }
export class T3nIdentityProvider implements IdentityProvider {
 private key?:string;
 constructor(key=process.env.T3N_API_KEY){this.key=key}
 async connect(){
  if(!this.key)throw Error("T3N_API_KEY is required when T3N_MODE=t3n");
  const sdk=await import("@terminal3/t3n-sdk"); sdk.setEnvironment("sandbox");
  const address=sdk.eth_get_address(this.key);
  const client=new sdk.T3nClient({trustAnchor:await sdk.fetchTrustedManifest("sandbox"),wasmComponent:await sdk.loadWasmComponent(),handlers:{EthSign:sdk.metamask_sign(address,undefined,this.key)}});
  await client.handshake(); const identity=await client.authenticate(sdk.createEthAuthInput(address));
  return{did:identity.value,mode:"t3n" as const};
 }
}
export const identityProvider=():IdentityProvider=>process.env.T3N_MODE==="t3n"?new T3nIdentityProvider():new MockIdentityProvider();
