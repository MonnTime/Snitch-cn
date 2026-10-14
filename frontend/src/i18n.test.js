/**
 * Snitch — i18n consistency tests.
 *
 * EN: Guards the invariant that every language ships the SAME keys with the
 *     same function arities as English. A missing translation therefore fails
 *     CI instead of silently leaking an English string (or a raw key) into the
 *     UI at runtime.
 * FR: Garantit l'invariant que chaque langue fournit les MÊMES clés, avec les
 *     mêmes arités de fonction que l'anglais. Une traduction manquante fait
 *     donc échouer la CI au lieu de laisser fuir une chaîne anglaise (ou une
 *     clé brute) dans l'UI à l'exécution.
 * ZH: 保证每种语言与英文拥有完全相同的键集合与函数参数个数。缺失的翻译会
 *     直接让 CI 失败，而不是在运行时把英文（或原始键名）漏到界面上。
 */
import { describe, it, expect } from 'vitest'
import { DICTS, LANGUAGES, LOCALES, DEFAULT_LANG, regionName, fmtNum } from './i18n'

const BASE = 'en'

describe('i18n dictionaries', () => {
  it('every language exposes the exact same key set as English', () => {
    const baseKeys = Object.keys(DICTS[BASE]).sort()
    for (const { code } of LANGUAGES) {
      const keys = Object.keys(DICTS[code] || {}).sort()
      expect(keys, `key set of "${code}"`).toEqual(baseKeys)
    }
  })

  it('every language has a dictionary and a BCP-47 locale', () => {
    for (const { code } of LANGUAGES) {
      expect(DICTS[code], `dictionary for "${code}"`).toBeTruthy()
      expect(LOCALES[code], `locale for "${code}"`).toBeTruthy()
    }
  })

  it('DEFAULT_LANG resolves to a real dictionary', () => {
    expect(DICTS[DEFAULT_LANG]).toBeTruthy()
  })

  it('function entries keep the same arity across languages', () => {
    const base = DICTS[BASE]
    for (const key of Object.keys(base)) {
      if (typeof base[key] !== 'function') continue
      for (const { code } of LANGUAGES) {
        const val = DICTS[code][key]
        expect(typeof val, `${code}.${key} must be a function`).toBe('function')
        expect(val.length, `${code}.${key} arity`).toBe(base[key].length)
      }
    }
  })

  it('every suspicious-port reason code has a translation', () => {
    // EN: Mirrors SUSPICIOUS_PORT_REASONS in backend/detection/anomaly.py.
    // FR: Reflète SUSPICIOUS_PORT_REASONS dans backend/detection/anomaly.py.
    const codes = ['metasploit_shell', 'hacker_port', 'back_orifice',
                   'irc_botnet', 'socks_proxy', 'tor_relay', 'tor_socks']
    for (const code of codes) {
      for (const { code: lang } of LANGUAGES) {
        expect(DICTS[lang][`reason_${code}`], `${lang}.reason_${code}`).toBeTruthy()
      }
    }
  })

  it('every alert type and detail field has a label', () => {
    const alertTypes = ['NEW_HOST', 'SUSPICIOUS_PROCESS', 'SUSPICIOUS_PORT',
                        'BEACON', 'VOLUME_SPIKE', 'NEW_LAN_DEVICE',
                        'DEVICE_OFFLINE', 'MEDIA_EXFIL', 'PORT_SCAN']
    for (const { code } of LANGUAGES) {
      for (const type of alertTypes) {
        expect(DICTS[code][`alert_${type}`], `${code}.alert_${type}`).toBeTruthy()
        expect(DICTS[code][`alertmsg_${type}`], `${code}.alertmsg_${type}`).toBeTruthy()
      }
    }
  })
})

describe('regionName', () => {
  it('localizes ISO country codes per locale', () => {
    expect(regionName('US', 'zh-CN')).toBe('美国')
    expect(regionName('US', 'en-US')).toBe('United States')
  })

  it('falls back to the backend English name when the code is missing', () => {
    expect(regionName(null, 'zh-CN', 'United States')).toBe('United States')
    expect(regionName('', 'zh-CN', 'France')).toBe('France')
  })
})

describe('fmtNum', () => {
  it('formats numbers with the given locale', () => {
    expect(fmtNum(1234, 'en-US')).toBe('1,234')
    expect(fmtNum(0, 'en-US')).toBe('0')
  })
})
