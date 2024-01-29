import { test } from '@nichoth/tapzero'
import { example } from '../src/index.js'

test('example', async t => {
    t.ok('ok', 'should be an example')
    example()
})
