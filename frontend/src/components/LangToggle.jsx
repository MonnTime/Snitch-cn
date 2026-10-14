/**
 * Snitch — language switcher.
 *
 * EN: Segmented control listing every language from the i18n registry
 *     (EN / FR / 中文). Shared by the toolbar and the settings panel so
 *     adding a language only ever touches `LANGUAGES` in i18n.jsx.
 * FR: Contrôle segmenté listant toutes les langues du registre i18n
 *     (EN / FR / 中文). Partagé par la barre d'outils et les réglages : ajouter
 *     une langue ne touche que `LANGUAGES` dans i18n.jsx.
 */
import { useT } from '../i18n'

export default function LangToggle({ variant = 'toolbar', onChange }) {
  const { lang, languages, setLang } = useT()
  const compact = variant === 'toolbar'

  function pick(code) {
    setLang(code)
    onChange?.(code)
  }

  return (
    <div style={{
      display: 'flex',
      background: compact ? '#0f0f0f' : 'transparent',
      border: compact ? '1px solid #2a2a2a' : 'none',
      borderRadius: compact ? 20 : 0,
      gap: compact ? 0 : 4,
      overflow: 'hidden',
    }}>
      {languages.map(l => {
        const active = lang === l.code
        return (
          <button
            key={l.code}
            onClick={() => pick(l.code)}
            aria-pressed={active}
            title={l.label}
            style={compact ? {
              background: active ? '#3b82f6' : 'transparent',
              border: 'none', cursor: 'pointer',
              color: active ? '#fff' : '#64748b',
              padding: '5px 12px', fontSize: 11, fontWeight: 600,
              transition: 'background 0.15s',
            } : {
              background: active ? '#3b82f6' : '#000000',
              border: '1px solid #2a2a2a', borderRadius: 6,
              color: active ? '#fff' : '#64748b',
              padding: '4px 12px', fontSize: 11, cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
