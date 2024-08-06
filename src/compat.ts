import { gcm } from '@noble/ciphers/aes'
import { randomBytes } from '@noble/ciphers/webcrypto'
import { fromString, toString } from 'uint8arrays'
import { CONTENT_ENCODING, KEY_ENCODING } from './CONSTANTS.js'
import { normalizeBase64ToBuf } from './util.js'

/**
 * This is crypto implemented in user-land libraries,
 * for the case where someone does not have a browser that
 * is up to date and implements `webcrypto`.
 */

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
    const nonce = randomBytes(16)
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
    const cypherText = normalizeBase64ToBuf(msg.content, 'base64pad')
    // nonce should be first 16 bytes of cypher text
    const nonce = cypherText.slice(0, 16)
    const cypherBytes = cypherText.slice(16)  // slice -- 16 -> end
    const aes = gcm(
        fromString(keyString, KEY_ENCODING),
        new Uint8Array(nonce)
    )
    const decrypted = aes.decrypt(new Uint8Array(cypherBytes))
    return { content: toString(decrypted) }
}
