import test from 'ava'
import rhh from '../src'
import { axiosHelper } from '../src/requests'

test('foo', t => {
  t.pass()
})

test('bar', async t => {
  const bar = Promise.resolve('bar')

  t.is(await bar, 'bar')
})

test('rhh-test', async t => {
  rhh.backURL = 'http://localhost:5002'

  const res = await axiosHelper({ route: '/ping/' })

  console.log(res)

  t.pass()
})
