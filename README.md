# simple AES
![tests](https://github.com/bicycle-codes/simple-aes/actions/workflows/nodejs.yml/badge.svg)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![types](https://img.shields.io/npm/types/@bicycle-codes/simple-aes?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-brightgreen?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)


Cryptography used by [vanishing.page](https://vanishing.page/). Works in browsers and node.

This is generally useful as a dead simple way of working with symmetric keys in a browser or node.

Thanks to [Fission](https://github.com/fission-codes/), the original author for much of this code.

## install
```sh
npm i -S @bicycle-codes/simple-aes
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
import { encryptMessage } from '@bicycle-codes/simple-aes'

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
import { test } from '@bicycle-codes/tapzero'
import { decryptMessage } from '@bicycle-codes/simple-aes'

test('decrypt the message', async t => {
    const decrypted = await decryptMessage(message, key)
    t.equal(decrypted.content, 'hello world',
        'should decrypt to the right text')
})
```
