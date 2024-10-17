export type Message = { content:string }
export type Msg = ArrayBuffer|string|Uint8Array
export enum SymmAlg {
    AES_CTR = 'AES-CTR',
    AES_CBC = 'AES-CBC',
    AES_GCM = 'AES-GCM',
}
