import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import { copy } from './src/content/copy.ts'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** FR-084: without JavaScript, the final message is still delivered — generated from the one content file. */
function noscriptMessage(): Plugin {
  const paragraphs = copy.message.paragraphs
    .map((lines) => `<p>${lines.map(escapeHtml).join('<br />')}</p>`)
    .join('')
  const signOff = copy.message.signOff ? `<p class="sign-off">${escapeHtml(copy.message.signOff)}</p>` : ''
  return {
    name: 'noscript-message',
    transformIndexHtml: (html) =>
      html.replace(
        '<!--app-noscript-->',
        `<noscript><main class="noscript-letter">${paragraphs}${signOff}</main></noscript>`,
      ),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), noscriptMessage()],
  build: {
    target: ['es2022', 'safari16'],
    assetsInlineLimit: 0,
  },
})
