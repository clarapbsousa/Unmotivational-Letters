# Unmotivational Letters

AI-powered motivation letter generator by Clara Sousa.

## Features

- **Dark Theme UI** — Sleek, minimal interface matching your exact design specs
- **Personal Details** — Name, address, phone, email auto-populated in PDF header
- **Company Name Input** — Used for PDF filename: `<Company>_ClaraSousa_MotivationalLetter.pdf`
- **Job Description** — Paste full job description with character counter
- **CV Upload** — Drag & drop or paste text; stored encrypted in localStorage so you don't re-upload every time
- **Additional Context** — Optional field for extra information
- **Writing Style** — Formal, Balanced, Creative
- **Tone** — Enthusiastic, Confident, Humble, Assertive
- **Model Selection** — Dynamically fetches available models from your OpenAI-compatible API with cost display
- **API Settings** — Pre-configured with `https://api.openai.com/v1`; supports custom endpoints and keys, encrypted in localStorage
- **Regenerate with Variation** — After first generation, add instructions like "make it more technical" and regenerate
- **A4-Constrained Output** — Prompt engineered to fit on one A4 page (~3000 chars max)
- **PDF Export** — Clean white professional layout with your personal details header
- **Copy to Clipboard** — Quick copy of generated text

## Tech Stack

- Next.js 13 + TypeScript + Tailwind CSS
- Client-side PDF generation via `html2pdf.js`
- Encrypted localStorage via `crypto-js`
- `lucide-react` icons

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```

3. **Build for static export:**
   ```bash
   npm run build
   ```
   The static site will be output to the `dist/` folder.

## Usage

1. Enter your personal details (used in the PDF header)
2. Enter the **Company Name** (for the PDF filename)
3. Paste the **Job Description**
4. Upload your CV or paste the text (stored encrypted for next time)
5. Optionally add additional context
6. Select writing **Style** and **Tone**
7. Configure your OpenAI-compatible **API endpoint** and **key** (toggle API Settings)
8. Select a **Model** from the dropdown (fetched dynamically from your API)
9. Click **Generate Cover Letter**
10. Review, copy, or download as PDF
11. Click **Regenerate** to add variation instructions and get a different version

## Security

- Your API key and CV text are encrypted using AES before being stored in `localStorage`
- All API calls are made client-side directly to your configured endpoint
- No data is sent to any third-party servers

## License

MIT
