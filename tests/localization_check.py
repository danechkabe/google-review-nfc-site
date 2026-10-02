"""Static contract for the bilingual landing-page controls and copy."""
from pathlib import Path

html = Path("index.html").read_text(encoding="utf-8")
script = Path("script.js").read_text(encoding="utf-8")
styles = Path("styles.css").read_text(encoding="utf-8")

required_html = (
    'class="language-switcher"',
    'data-language="en"',
    'data-language="pt"',
    '🇬🇧',
    '🇵🇹',
    'data-i18n="hero-line-one"',
    'data-i18n="contact-copy"',
)
required_script = (
    'const translations',
    'pt: {',
    'localStorage',
    'setLanguage',
    'document.documentElement.lang',
    'copy-phone',
)
required_styles = (
    '.language-switcher',
    '.language-option',
    '.language-option[aria-pressed="true"]',
)

for snippet in required_html:
    assert snippet in html, f"Missing localized HTML contract: {snippet}"
for snippet in required_script:
    assert snippet in script, f"Missing localization behavior: {snippet}"
for snippet in required_styles:
    assert snippet in styles, f"Missing language-switcher style: {snippet}"

# Copy quality regressions from the original English wording.
assert "No searching, no awkward prompts, no printed QR code everywhere." not in html
assert "No searching, no awkward prompts, and no printed QR codes everywhere." in html
assert "Make a great" in html
assert "Faça com que uma ótima" in script

print("Localization contract: PASS")
