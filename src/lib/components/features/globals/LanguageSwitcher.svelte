<!--
  @component LanguageSwitcher
  @description Language switcher that integrates with Paraglide i18n
  @keywords language, locale, i18n, switcher, translation, internationalization
  @uses LanguageSwitcher (UI), LanguageContext
-->
<script lang="ts">
  import { LanguageSwitcher as LanguageSwitcherUI } from '$lib/components/ui/language-switcher'
  import { getLanguageContext, type Locale } from '$lib/contexts/language'
  import * as m from '$lib/paraglide/messages.js'

  const languageCtx = getLanguageContext()

  const languages = [
    { code: 'en', label: m.language_english() },
    { code: 'it', label: m.language_italian() }
  ]

  function handleLanguageChange(code: string) {
    languageCtx.changeLocale(code as Locale)
  }
</script>

<LanguageSwitcherUI
  {languages}
  value={languageCtx.locale}
  onChange={handleLanguageChange}
/>
