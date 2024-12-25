# simple AES
![tests](https://github.com/bicycle-codes/simple-aes/actions/workflows/nodejs.yml/badge.svg)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![types](https://img.shields.io/npm/types/@bicycle-codes/simple-aes?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-brightgreen?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)


Cryptography used by [vanishing.page](https://vanishing.page/). Works in browsers and node.

This is generally useful as a dead simple way of working with symmetric keys in a browser or node.

Thanks to [Fission](https://github.com/fission-codes/), the original author for much of this code.

<!-- toc -->

- [install](#install)
- [use](#use)
  * [bundler](#bundler)
  * [pre-bundled](#pre-bundled)
- [API](#api)
  * [`@bicycle-codes/simple-aes`](#bicycle-codessimple-aes)
  * [`@bicycle-codes/simple-aes/compat`](#bicycle-codessimple-aescompat)
  * [`encryptMessage`](#encryptmessage)
  * [`decryptMessage`](#decryptmessage)

<!-- tocstop -->

## install
```sh
npm i -S @bicycle-codes/simple-aes
```

## use

### bundler
Just import

```js
import {
    decryptMessage,
    encryptMessage,
    type Message
} from '@bicycle-codes/simple-aes'
// } from '@bicycle-codes/simple-aes/compat'  // for older browsers
```

### pre-bundled
This exposes pre-bundled & minified JS files.

#### copy

```sh
cp ./node_modules/@bicycle-codes/simple-aes/dist/compat.min.js ./public
cp ./node_modules/@bicycle-codes/simple-aes/dist/index.min.js ./public/simple-aes.min.js
```

#### link

```html
<body>
    <!-- ... -->

    <script type="module" src="./compat.min.js"></script>
    <!-- or webcrypto version -->
    <script type="module" src="./simple-aes.min.js"></script>
</body>
```

## API

### `@bicycle-codes/simple-aes`

Use the `webcrypto` API.

```js
import {
    decryptMessage,
    encryptMessage,
    type Message
} from '@bicycle-codes/simple-aes'
```

### `@bicycle-codes/simple-aes/compat`

Use a user-land module, [@noble/ciphers](https://github.com/paulmillr/noble-ciphers). This will work in browsers of all ages.

```js
import {
    encryptMessage,
    decryptMessage
} from '@bicycle-codes/simple-aes/compat'
```

### `encryptMessage`
Generate a new AES key and encrypt the given message object.
Return an array of `[ encryptedMessage, { key }]`,
where `key` is a new AES key, encoded as `base64url`.

Can pass in a size for the key. By default it uses 256 bits.

```ts
async function encryptMessage (
    msg:{ content:string },
    opts:{ length:SymmKeyLength } = { length: DEFAULT_SYMM_LEN }
):Promise<[{ content:string }, { key:string }]>
```

#### encrypt example
```ts
import { SymmKeyLength, encryptMessage } from '@bicycle-codes/simple-aes'

const [encryptedMsg, { key }] = await encryptMessage({
    content: 'hello world'
})

// or pass in a key size
await encryptMessage({
    content: 'hello'
}, {
    length: SymmKeyLength.B128
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
