// import { KEY_ENCODING } from './CONSTANTS.js'
import type { Msg } from './types.js'
import { fromString, type SupportedEncodings } from 'uint8arrays'

enum CharSize {
    B8 = 8,
    B16 = 16,
}

export const normalizeToBuf = function normalizeToBuf (
    msg:Msg,
    strConv:(str:string) => ArrayBuffer
):ArrayBuffer {
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

export function base64ToArrBuf (
    encoding:SupportedEncodings,
    string:string
):ArrayBuffer {
    return fromString(string, encoding).buffer
}

export function normalizeBase64ToBuf (
    msg:Msg,
    encoding:SupportedEncodings
):ArrayBuffer {
    return normalizeToBuf(msg, base64ToArrBuf.bind(null, encoding))
}

export const normalizeUtf16ToBuf = (msg:Msg):ArrayBuffer => {
    return normalizeToBuf(msg, (str) => strToArrBuf(str, CharSize.B16))
}

function strToArrBuf (str:string, charSize:CharSize):ArrayBuffer {
    const view =
      charSize === 8 ? new Uint8Array(str.length) : new Uint16Array(str.length)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        view[i] = str.charCodeAt(i)
    }
    return view.buffer
}
