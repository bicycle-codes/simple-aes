import { webcrypto } from 'one-webcrypto'
import { fromString, toString } from 'uint8arrays'

export enum SymmAlg {
    AES_CTR = 'AES-CTR',
    AES_CBC = 'AES-CBC',
    AES_GCM = 'AES-GCM',
}

export type Message = { content:string }

const CONTENT_ENCODING = 'base64pad'
const KEY_ENCODING = 'base64url'
const DEFAULT_SYMM_ALG = SymmAlg.AES_GCM

async function exportKey (key:CryptoKey):Promise<string> {
    const buffer = await webcrypto.subtle.exportKey('raw', key)
    const arr = new Uint8Array(buffer)
    const str = toString(arr, KEY_ENCODING)
    return str
}

enum SymmKeyLength {
    B128 = 128,
    B192 = 192,
    B256 = 256,
}

const DEFAULT_SYMM_LEN = SymmKeyLength.B256

/**
 * Take a message object, create a new AES key, and encrypt the message with the
 * key. Return encrypted message and key, in that order.
 *
 * @param msg The message to encrypt.
 * @returns {[{ content:string }, { key }]} The encrypted message and key.
 */
export async function encryptMessage (
    msg:{ content:string }
):Promise<[{ content:string }, { key }]> {
    const newKey = await createKey()
    const encryptedContent = await aesEncrypt(msg.content, newKey, DEFAULT_SYMM_ALG)
    const encryptedString = toString(encryptedContent, CONTENT_ENCODING)
    const keyAsString = await exportKey(newKey)

    return [{ content: encryptedString }, { key: keyAsString }]
}

export async function aesEncrypt (
    _data:Uint8Array|string,
    cryptoKey:CryptoKey,
    alg:SymmAlg,
    iv?:Uint8Array
):Promise<Uint8Array> {
    // the keystore version prefixes the `iv` into the cipher text
    const data = typeof _data === 'string' ?
        fromString(_data) :
        _data

    const encrypted = (iv ?
        await webcrypto.subtle.encrypt(
            { name: alg, iv },
            cryptoKey,
            data
        ) :
        await encryptBytes(data, cryptoKey, { alg }))

    return new Uint8Array(encrypted)
}

type SymmKeyOpts = {
    alg:SymmAlg
    length:SymmKeyLength
    iv:ArrayBuffer
}

function createKey (opts?:Partial<SymmKeyOpts>):Promise<CryptoKey> {
    return webcrypto.subtle.generateKey(
        {
            name: opts?.alg || DEFAULT_SYMM_ALG,
            length: opts?.length || DEFAULT_SYMM_LEN,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

type Msg = ArrayBuffer | string | Uint8Array
type CipherText = ArrayBuffer
const DEFAULT_CTR_LEN = 64

async function encryptBytes (
    msg:Msg,
    key:CryptoKey|string,
    opts?:Partial<SymmKeyOpts>
):Promise<CipherText> {
    const data = normalizeUtf16ToBuf(msg)
    const importedKey = (typeof key === 'string' ?
        await importKey(key, opts) :
        key)
    const alg = opts?.alg || DEFAULT_SYMM_ALG
    const iv = opts?.iv || randomBuf(16)
    const cipherBuf = await webcrypto.subtle.encrypt(
        {
            name: alg,
            // AES-CTR uses a counter,
            // AES-GCM/AES-CBC use an initialization vector
            iv: alg === SymmAlg.AES_CTR ? undefined : iv,
            counter: alg === SymmAlg.AES_CTR ? new Uint8Array(iv) : undefined,
            length: alg === SymmAlg.AES_CTR ? DEFAULT_CTR_LEN : undefined,
        },
        importedKey,
        data
    )

    return joinBufs(iv, cipherBuf)
}

enum CharSize {
    B8 = 8,
    B16 = 16,
}

function joinBufs (fst:ArrayBuffer, snd:ArrayBuffer):ArrayBuffer {
    const view1 = new Uint8Array(fst)
    const view2 = new Uint8Array(snd)
    const joined = new Uint8Array(view1.length + view2.length)
    joined.set(view1)
    joined.set(view2, view1.length)
    return joined.buffer
}

function strToArrBuf (str:string, charSize:CharSize):ArrayBuffer {
    const view =
      charSize === 8 ? new Uint8Array(str.length) : new Uint16Array(str.length)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        view[i] = str.charCodeAt(i)
    }
    return view.buffer
}

const InvalidMaxValue = new Error('Max must be less than 256 and greater than 0')

function randomBuf (length: number, { max }: { max: number } = { max: 255 }): ArrayBuffer {
    if (max < 1 || max > 255) {
        throw InvalidMaxValue
    }

    const arr = new Uint8Array(length)

    if (max === 255) {
        webcrypto.getRandomValues(arr)
        return arr.buffer
    }

    let index = 0
    const interval = max + 1
    const divisibleMax = Math.floor(256 / interval) * interval
    const tmp = new Uint8Array(1)

    while (index < arr.length) {
        webcrypto.getRandomValues(tmp)
        if (tmp[0] < divisibleMax) {
            arr[index] = tmp[0] % interval
            index++
        }
    }

    return arr.buffer
}

/**
 * Take a `base64url` encoded key, return a CryptoKey.
 * @param base64key Key encoded as a string.
 * @param opts Algorithm, length, IV (don't need to use this)
 * @returns {Promise<CryptoKey>} The CryptoKey
 */
function importKey (
    base64key:string,
    opts?:Partial<SymmKeyOpts>
):Promise<CryptoKey> {
    const buf = base64ToArrBuf(base64key)

    return webcrypto.subtle.importKey(
        'raw',
        buf,
        {
            name: opts?.alg || DEFAULT_SYMM_ALG,
            length: opts?.length || DEFAULT_SYMM_LEN,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

/**
 * Take a message and a `base64url` encoded string as a key.
 * Return the decrypted message object.
 *
 * @param msg The message object
 * @param keyString The `base64url` encoded key
 * @returns {Promise<{ content:string }>} The decrypted message object.
 */
export async function decryptMessage (
    msg:{ content:string },
    keyString:string
):Promise<{ content:string }> {
    const key = await importKey(keyString)
    const msgBuf = fromString(msg.content, CONTENT_ENCODING)
    const decryptedMsg = await aesDecrypt(msgBuf, key, DEFAULT_SYMM_ALG)
    return { content: toString(decryptedMsg) }
}

export async function aesDecrypt (
    encrypted:Uint8Array,
    cryptoKey: CryptoKey,
    alg: SymmAlg,
    iv?: Uint8Array
): Promise<Uint8Array> {
    const decrypted = iv ?
        await webcrypto.subtle.decrypt(
            { name: alg, iv },
            cryptoKey,
            encrypted
        ) : await decryptBytes(encrypted, cryptoKey, { alg })

    return new Uint8Array(decrypted)
}

async function decryptBytes (
    msg:Msg,
    key:CryptoKey,
    opts?:Partial<SymmKeyOpts>
):Promise<ArrayBuffer> {
    const cipherText = normalizeBase64ToBuf(msg)
    const importedKey = typeof key === 'string' ? await importKey(key, opts) : key
    const alg = opts?.alg || DEFAULT_SYMM_ALG
    const iv = cipherText.slice(0, 16)
    const cipherBytes = cipherText.slice(16)
    const msgBuff = await webcrypto.subtle.decrypt({
        name: alg,
        // AES-CTR uses a counter, AES-GCM/AES-CBC use an initialization vector
        iv: alg === SymmAlg.AES_CTR ? undefined : iv,
        counter: alg === SymmAlg.AES_CTR ? new Uint8Array(iv) : undefined,
        length: alg === SymmAlg.AES_CTR ? DEFAULT_CTR_LEN : undefined,
    }, importedKey, cipherBytes)
    return msgBuff
}

const normalizeUtf16ToBuf = (msg:Msg):ArrayBuffer => {
    return normalizeToBuf(msg, (str) => strToArrBuf(str, CharSize.B16))
}

const normalizeToBuf = (msg: Msg, strConv: (str: string) => ArrayBuffer): ArrayBuffer => {
    if (typeof msg === 'string') {
        return strConv(msg)
    } else if (typeof msg === 'object' && msg.byteLength !== undefined) {
        // this is the best runtime check I could find for ArrayBuffer/Uint8Array
        const temp = new Uint8Array(msg)
        return temp.buffer
    } else {
        throw new Error('Improper value. Must be a string, ArrayBuffer, Uint8Array')
    }
}

function base64ToArrBuf (string:string):ArrayBuffer {
    return fromString(string, KEY_ENCODING).buffer
}

function normalizeBase64ToBuf (msg:Msg):ArrayBuffer {
    return normalizeToBuf(msg, base64ToArrBuf)
}
