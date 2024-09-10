import { gcm } from '@noble/ciphers/aes'
import libsodium from 'libsodium-wrappers'
// import { randomBytes } from '@noble/ciphers/webcrypto'
import { fromString, toString } from 'uint8arrays'
import { CONTENT_ENCODING, KEY_ENCODING } from './CONSTANTS.js'
import { normalizeBase64ToBuf } from './util.js'
export { type Message } from './types.js'

/**
 * This is crypto implemented in user-land libraries,
 * for the case where someone does not have a browser that
 * is up to date and implements `webcrypto`.
 */

export async function SimpleAES () {
    await libsodium.ready
    const sodium = libsodium
    const msg = fromString('hello, sodium').buffer
    const cipherText = new ArrayBuffer(msg.byteLength + sodium.crypto_secretbox_MACBYTES)
    // const key = new ArrayBuffer(sodium.cryto_secretbox_KEYBYTES)
    const key = await getRandomKey()
    // const nonce = new ArrayBuffer(sodium.crypto_secretbox_NONCEBYTES)
    const nonce = await getRandomNonce()

    const ciphertext = (new ArrayBuffer()).alloc(message.length + sodium.crypto_secretbox_MACBYTES)

    return {

    }
}

async function getRandomNonce ():Promise<ArrayBuffer> {
    await libsodium.ready
    const nonce = new ArrayBuffer(12)
    libsodium.randombytes_buf(nonce)
}

async function getRandomKey ():Promise<ArrayBuffer> {
    await libsodium.ready
    const sodium = libsodium
    const key = new ArrayBuffer(sodium.cryto_secretbox_KEYBYTES)
    sodium.randombytes_buf(key)
    return key
}

/**
 * Take a message object, create a new AES key, and encrypt the message with the
 * key. Return encrypted message and key, in that order.
 *
 * @param {{ content:string }} msg The message to encrypt.
 * @returns {[{ content:string }, { key }]} The encrypted message and key.
 */
export async function encryptMessage (
    msg:{ content:string }
):Promise<[{ content:string }, { key }]> {
    const newKey = randomBytes(32)
    const nonce = randomBytes(12)
    const aes = gcm(newKey, nonce)
    const encryptedContent = await aes.encrypt(fromString(msg.content))
    const encryptedString = toString(
        new Uint8Array([...nonce, ...encryptedContent]),
        CONTENT_ENCODING
    )
    const keyAsString = toString(newKey, KEY_ENCODING)

    return [{ content: encryptedString }, { key: keyAsString }]
}

export async function decryptMessage (
    msg:{ content:string },
    keyString:string
):Promise<{ content:string }> {
    const cipherText = normalizeBase64ToBuf(msg.content, 'base64pad')
    // nonce should be first 12 bytes of cipher text
    const nonce = cipherText.slice(0, 12)
    const cipherBytes = cipherText.slice(12)  // slice -- 12 -> end
    const aes = gcm(
        fromString(keyString, KEY_ENCODING),
        new Uint8Array(nonce)
    )
    const decrypted = aes.decrypt(new Uint8Array(cipherBytes))
    return { content: toString(decrypted) }
}
