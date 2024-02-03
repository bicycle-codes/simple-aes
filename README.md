# ephemeral crypto
![tests](https://github.com/nichoth/ephemeral-crypto/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@nichoth/ephemeral-crypto?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-brightgreen?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://nichoth.github.io/badge/polyform-shield.svg)](LICENSE)


Cryptography used by [vanishing.page](https://vanishing.page/). Works in browsers and node.

This is generally useful as a dead simple way of using symmetric keys in a browser or node.

Thanks to [Fission](https://github.com/fission-codes/), the original author for much of this code.

## install
```sh
npm i -S @bicycle-codes/ephemeral-crypto
```

## API

### `encryptMessage`
Encrypt the given message object, and return an array of `[ encryptedMessage, { key }]`, where `key` is a new AES key, encoded as `base64url`.

```ts
async function encryptMessage (
    msg:{ content:string }
):Promise<[{ content:string }, { key }]>
```

#### encrypt example
```ts
import { encryptMessage } from '@bicycle-codes/ephemeral-crypto'

const [encryptedMsg, { key }] = await encryptMessage({
    content: 'hello world'
})

console.log(encryptedMessage)
// =>  { content: '5eAcA6+jnBfbuCx8L...' }
```

### `decryptMessage`
Decrypt the given message with the given key. Suitable for decrypting a message that was encrypted by this library. Key is an AES key, `base64url` encoded.

```ts
async function decryptMessage (
    msg:{ content:string },
    keyString:string  // <-- base64url
):Promise<{ content:string }>
```

#### decrypt example
```js
import { test } from '@nichoth/tapzero'
import { decryptMessage } from '@bicycle-codes/ephemeral-crypto'

test('decrypt the message', async t => {
    const decrypted = await decryptMessage(message, key)
    t.equal(decrypted.content, 'hello world',
        'should decrypt to the right text')
})
```

> [!NOTE]  
> This uses forks of `one-webcrypto` and `uint8arrays`, so that way we own
> the entire dependency graph.
