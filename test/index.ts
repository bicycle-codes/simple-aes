import { test } from '@bicycle-codes/tapzero'
import {
    decryptMessage,
    encryptMessage,
    type Message
} from '../src/index.js'
import {
    encryptMessage as encryptOld,
    decryptMessage as decryptOld
} from '../src/compat.js'

let message:Message
let theKey:string
test('Encrypt a message', async t => {
    const [encryptedMsg, { key }] = await encryptMessage({
        content: 'hello world'
    })
    message = encryptedMsg
    theKey = key

    t.ok(key, 'should return a key')
    t.equal(typeof encryptedMsg.content, 'string',
        'should return an encrypted message')
})

test('decrypt the message', async t => {
    const decrypted = await decryptMessage(message, theKey)
    t.equal(decrypted.content, 'hello world',
        'should decrypt to the right text')
})

let encrypted:[{ content:string }, { key }]
test('older browsers', async t => {
    t.plan(2)
    encrypted = await encryptOld({
        content: 'hello again'
    })
    t.equal(typeof encrypted[0].content, 'string', 'should encrypt a message')
    t.equal(typeof encrypted[1].key, 'string',
        'should return the key as second element')
})

test('older browsers decrypt', async t => {
    const decrypted = await decryptOld(encrypted[0], encrypted[1].key)
    t.equal(decrypted.content, 'hello again',
        'should decrypt using the `old` module')
})

test('new style can decrypt a message from old style', async t => {
    const dec = await decryptMessage(encrypted[0], encrypted[1].key)
    t.equal(dec.content, 'hello again',
        'the new module can decrypt something encoded with old module')
})

test('old module can decrypt from new module', async t => {
    const dec = await decryptOld(message, theKey)
    t.equal(dec.content, 'hello world',
        'old module should decrypt a message created by new module')
})
