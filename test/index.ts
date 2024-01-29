import { test } from '@nichoth/tapzero'
import { decryptMessage, encryptMessage, Message } from '../src/index.js'

let message:Message
let theKey:string
test('Encrypt a message', async t => {
    const [encryptedMsg, { key }] = await encryptMessage({
        content: 'hello world'
    })
    message = encryptedMsg
    theKey = key

    console.log('**encrypted**', encryptedMsg)
    t.ok(key, 'should return a key')
    t.equal(typeof encryptedMsg.content, 'string',
        'should return an encrypted message')
})

test('decrypt the message', async t => {
    const decrypted = await decryptMessage(message, theKey)
    t.equal(decrypted.content, 'hello world',
        'should decrypt to the right text')
})
