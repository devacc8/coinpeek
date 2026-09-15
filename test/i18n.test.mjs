import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The i18n contract. Nothing here needs a browser: the catalogues, the markup
 * and the manifest are all plain files, and a key that is missing from one
 * locale renders as an empty string in the browser rather than falling back to
 * English. That is the failure this suite exists to catch.
 */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LOCALES_DIR = join(ROOT, '_locales')

const localeNames = readdirSync(LOCALES_DIR)
  .filter((name) => statSync(join(LOCALES_DIR, name)).isDirectory())
  .sort()

const catalogues = Object.fromEntries(
  localeNames.map((name) => [
    name,
    JSON.parse(readFileSync(join(LOCALES_DIR, name, 'messages.json'), 'utf8')),
  ]),
)

const popupHtml = readFileSync(join(ROOT, 'popup', 'popup.html'), 'utf8')
const sources = ['popup/popup.js', 'utils/i18n.js', 'utils/formatters.js', 'config/constants.js', 'background-simple.js']
  .map((file) => readFileSync(join(ROOT, file), 'utf8'))
  .join('\n')
const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'))

test('the four expected locales are present and English is the default', () => {
  assert.deepEqual(localeNames, ['en', 'es', 'ru', 'zh_CN'])
  assert.equal(manifest.default_locale, 'en')
})

test('every locale carries the same keys, all of them non-empty', () => {
  const baseline = Object.keys(catalogues.en).sort()
  for (const name of localeNames) {
    assert.deepEqual(
      Object.keys(catalogues[name]).sort(),
      baseline,
      `${name} keys diverge from en`,
    )
    for (const [key, entry] of Object.entries(catalogues[name])) {
      assert.equal(typeof entry.message, 'string', `${name}/${key} is not a message`)
      assert.notEqual(entry.message.trim(), '', `${name}/${key} is empty`)
    }
  }
})

test('every key referenced by markup, code and manifest exists in every locale', () => {
  const fromHtml = [...popupHtml.matchAll(/data-i18n(?:-title|-aria)?="([^"]+)"/g)].map((m) => m[1])
  const fromCode = [...sources.matchAll(/I18N\.t\('([^']+)'/g)].map((m) => m[1])
  const fromCurrencyKeys = [...sources.matchAll(/messageKey:\s*'([^']+)'/g)].map((m) => m[1])
  const fromManifest = [...JSON.stringify(manifest).matchAll(/__MSG_([A-Za-z0-9_]+)__/g)].map((m) => m[1])

  const referenced = [...new Set([...fromHtml, ...fromCode, ...fromCurrencyKeys, ...fromManifest])]
  assert.ok(referenced.length >= 30, `only ${referenced.length} keys referenced`)

  for (const name of localeNames) {
    const missing = referenced.filter((key) => !(key in catalogues[name]))
    assert.deepEqual(missing, [], `${name} is missing ${missing.join(', ')}`)
  }
})

test('no catalogue key is dead weight', () => {
  const fromHtml = [...popupHtml.matchAll(/data-i18n(?:-title|-aria)?="([^"]+)"/g)].map((m) => m[1])
  const fromCode = [...sources.matchAll(/I18N\.t\('([^']+)'/g)].map((m) => m[1])
  const fromCurrencyKeys = [...sources.matchAll(/messageKey:\s*'([^']+)'/g)].map((m) => m[1])
  const fromManifest = [...JSON.stringify(manifest).matchAll(/__MSG_([A-Za-z0-9_]+)__/g)].map((m) => m[1])
  const referenced = new Set([...fromHtml, ...fromCode, ...fromCurrencyKeys, ...fromManifest])

  const unused = Object.keys(catalogues.en).filter((key) => !referenced.has(key))
  assert.deepEqual(unused, [], `unused catalogue keys: ${unused.join(', ')}`)
})

test('placeholders are declared and referenced in the message', () => {
  for (const name of localeNames) {
    for (const [key, entry] of Object.entries(catalogues[name])) {
      for (const [placeholder, definition] of Object.entries(entry.placeholders ?? {})) {
        assert.match(
          definition.content,
          /^\$\d+$/,
          `${name}/${key} placeholder ${placeholder} must map to $1, $2 and so on`,
        )
        assert.ok(
          entry.message.toLowerCase().includes(`$${placeholder}$`.toLowerCase()),
          `${name}/${key} declares ${placeholder} but never uses it`,
        )
      }
    }
  }
})
