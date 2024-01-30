# ephemeral crypto
![tests](https://github.com/nichoth/ephemeral-crypto/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@nichoth/ephemeral-crypto?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-brightgreen?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

Cryptography used by [ephemeral.page](https://ephemeral.page/). Works in browsers and node.

## install
```sh
npm i -S @nichoth/ephemeral-crypto
```

## API

### `encryptMessage`
Encrypt the given message object, and return an array of `[ encryptedMessage, { key }]`, where `key` is an AES key, encoded as `base64url`.

```ts
async function encryptMessage (
    msg:{ content:string }
):Promise<[{ content:string }, { key }]>
```

#### encrypt example

```ts
import { encryptMessage } from '@nichoth/ephemeral-crypto'

const [encryptedMsg, { key }] = await encryptMessage({
    content: 'hello world'
})

console.log(encryptedMessage)
// =>  { content: '5eAcA6+jnBfbuCx8L...' }
```

### `decryptMessage`
Decrypt the given message with the given key. Suitable for decrypting a message that was encrypted by this library.

```ts
async function decryptMessage (
    msg:{ content:string },
    keyString:string
):Promise<{ content:string }>
```

#### decrypt example

```js
import { test } from '@nichoth/tapzero'
import { decryptMessage } from '@nichoth/ephemeral-crypto'

test('decrypt the message', async t => {
    const decrypted = await decryptMessage(message, key)
    t.equal(decrypted.content, 'hello world',
        'should decrypt to the right text')
})
```