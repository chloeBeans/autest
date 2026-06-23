/**
 * Read an uploaded BRS file into a viewable form + extractable text.
 * Returns { name, kind: 'pdf'|'html'|'markdown'|'text', data, text }.
 *
 * - PDF  : data = base64 data URL for an <iframe>. (Text auto-extract from PDF
 *          needs the backend; paste-to-extract is offered in the UI instead.)
 * - DOCX : converted to HTML via mammoth for viewing, plus raw text.
 * - MD   : raw markdown (rendered with marked in the viewer).
 * - TXT  : plain text.
 */
export async function readBrsFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    const data = await fileToDataUrl(file);
    return { name: file.name, kind: 'pdf', data, text: '' };
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const mod = await import('mammoth/mammoth.browser.js');
    const mammoth = mod.default || mod;
    const html = await mammoth.convertToHtml({ arrayBuffer });
    const raw = await mammoth.extractRawText({ arrayBuffer });
    return { name: file.name, kind: 'html', data: html.value, text: raw.value };
  }

  const text = await file.text();
  const kind = ext === 'md' || ext === 'markdown' ? 'markdown' : 'text';
  return { name: file.name, kind, data: text, text };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const REQ_PATTERNS = [
  /^\s*(?:[-*•]|\d+[.)]|\d+(?:\.\d+)+)\s+/, // bullets / numbered / 1.2.3
  /\b(shall|must|should|is required to|the system will)\b/i,
  /\b(REQ|FR|NFR|BR|US)[-\s]?\d+/i, // requirement IDs
];

/**
 * Auto-extract candidate requirement lines from BRS text.
 * Pragmatic heuristic — picks lines that look like requirements.
 */
export function extractRequirements(text = '') {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const out = [];
  for (const line of lines) {
    if (line.length < 8 || line.length > 400) continue;
    if (REQ_PATTERNS.some(re => re.test(line))) {
      out.push(line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim());
    }
  }
  // Dedupe while preserving order.
  return [...new Set(out)];
}
