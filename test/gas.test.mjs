import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createContext, runInContext } from 'node:vm'

/**
 * The Bitcoin fee path, and the two bugs that hid each other on a quiet
 * mempool. The parser rounded every reading to a whole satoshi, so 0.1 became
 * 0, and the relay floor still said 1 sat/vB. Bitcoin Core 30.0 lowered that
 * floor to 0.1 sat/vB in October 2025, which makes a 0.1 reading both real and
 * relayable, so it has to survive the parser and the floor check.
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadService(fetchImpl) {
  const context = createContext({
    importScripts: () => {},
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    fetch: async () => { throw new Error('the network is stubbed out in this test') },
    chrome: {
      alarms: { get: async () => ({}), create: () => {}, onAlarm: { addListener: () => {} } },
      i18n: { getMessage: (key) => key, getUILanguage: () => 'en' },
      runtime: {
        onMessage: { addListener: () => {} },
        onInstalled: { addListener: () => {} },
        onStartup: { addListener: () => {} },
        getURL: (path) => path,
      },
      storage: {
        local: { get: async () => ({}), set: async () => {} },
        onChanged: { addListener: () => {} },
      },
      action: { setBadgeText: () => {}, setBadgeBackgroundColor: () => {} },
    },
  })

  for (const file of ['config/constants.js', 'utils/i18n.js', 'utils/formatters.js', 'background-simple.js']) {
    runInContext(readFileSync(join(ROOT, file), 'utf8'), context, { filename: file })
  }

  const service = runInContext('apiService', context)
  service.fetchWithTimeout = fetchImpl
  return { service, context }
}

test('the relay floor matches the Bitcoin Core 30.0 default', () => {
  const { context } = loadService(async () => ({}))
  assert.equal(runInContext('CONFIG.MIN_RELAY_FEE_SAT_VB', context), 0.1)
})

test('a quiet mempool reading of 0.1 sat/vB survives the parser and the floor check', async () => {
  const { service } = loadService(async () => ({ hourFee: 0.1, halfHourFee: 0.2, fastestFee: 0.5 }))
  const gas = await service.fetchBitcoinGas()
  // Field by field: the values come from another VM realm, so their prototypes
  // differ from this realm's and a strict deep comparison would refuse them.
  assert.equal(gas.low, 0.1)
  assert.equal(gas.standard, 0.2)
  assert.equal(gas.fast, 0.5)
})

test('a zero reading is skipped and the next source answers', async () => {
  let calls = 0
  const { service } = loadService(async (url) => {
    calls += 1
    if (url.includes('mempool.space')) return { hourFee: 0, halfHourFee: 0, fastestFee: 0 }
    return { regular: 0.1, priority: 0.2 }
  })
  const gas = await service.fetchBitcoinGas()
  assert.equal(calls, 2, 'the silent source must be skipped rather than accepted')
  assert.equal(gas.low, 0.1)
  assert.equal(gas.standard, 0.2)
  assert.equal(gas.fast, 0.3)
})

test('the built-in fallback is returned only when every source fails', async () => {
  const { service } = loadService(async () => { throw new Error('down') })
  const gas = await service.fetchBitcoinGas()
  assert.equal(gas.low, 1)
  assert.equal(gas.standard, 2)
  assert.equal(gas.fast, 3)
})
