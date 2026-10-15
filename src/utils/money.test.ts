import assert from 'node:assert/strict'
import test from 'node:test'
import { formatBRLMoney, formatBRLMoneyDelta } from './money'

test('formata bilhões e trilhões de reais em pt-BR', () => {
  assert.equal(formatBRLMoney(25), 'R$ 25,0 bi')
  assert.equal(formatBRLMoney(1250), 'R$ 1,3 tri')
  assert.equal(formatBRLMoney(0.5), 'R$ 500 mi')
  assert.equal(formatBRLMoney(-12), '−R$ 12,0 bi')
})

test('formata variações monetárias com sinal', () => {
  assert.equal(formatBRLMoneyDelta(8), '+R$ 8,0 bi')
  assert.equal(formatBRLMoneyDelta(-8), '−R$ 8,0 bi')
})
