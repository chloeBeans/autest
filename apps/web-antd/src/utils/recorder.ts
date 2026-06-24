import { slugify } from './format';

/**
 * Build the official Playwright recorder command. Running this opens a real
 * browser and writes every click/type into a spec file automatically — the
 * robust way to "record whatever the tester does".
 */
export function buildCodegenCommand({
  baseUrl,
  name = 'recorded',
  subPath = 'tests',
}: {
  baseUrl?: string;
  name?: string;
  subPath?: string;
}): string {
  const file = `${subPath}/${slugify(name)}.spec.js`;
  const url = baseUrl || 'http://localhost:5173';
  return `npx playwright codegen ${url} -o ${file}`;
}

/**
 * Source of a tiny in-page recorder. The tester pastes this into the running
 * app (console or bookmarklet); it captures clicks/inputs, builds Playwright
 * steps live, and copies them to the clipboard — a no-terminal fallback.
 *
 * Kept as a plain string so it can be injected verbatim; it does not run inside
 * this portal.
 */
export const RECORDER_SOURCE = `(function () {
  if (window.__autestRecorder) { window.__autestRecorder.stop(); return; }

  var steps = [];

  function sel(el) {
    if (!el || el === document.body) return 'body';
    if (el.getAttribute && el.getAttribute('data-testid'))
      return '[data-testid="' + el.getAttribute('data-testid') + '"]';
    if (el.id) return '#' + el.id;
    var name = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('name'));
    if (name) return '[' + (el.getAttribute('aria-label') ? 'aria-label' : 'name') + '="' + name + '"]';
    var path = [], node = el, depth = 0;
    while (node && node.nodeType === 1 && node !== document.body && depth < 4) {
      var part = node.tagName.toLowerCase();
      if (node.className && typeof node.className === 'string') {
        var cls = node.className.trim().split(/\\s+/)[0];
        if (cls) part += '.' + cls;
      }
      var parent = node.parentNode;
      if (parent) {
        var sibs = Array.prototype.filter.call(parent.children, function (c) {
          return c.tagName === node.tagName;
        });
        if (sibs.length > 1) part += ':nth-of-type(' + (sibs.indexOf(node) + 1) + ')';
      }
      path.unshift(part);
      node = node.parentNode;
      depth++;
    }
    return path.join(' > ');
  }

  function onClick(e) {
    var el = e.target;
    var text = (el.innerText || '').trim().split('\\n')[0];
    if (text && text.length < 40 && /^(button|a)$/i.test(el.tagName)) {
      steps.push("  await page.getByText('" + text.replace(/'/g, "\\\\'") + "').click();");
    } else {
      steps.push("  await page.locator('" + sel(el) + "').click();");
    }
    update();
  }

  function onChange(e) {
    var el = e.target;
    if (!/^(input|textarea|select)$/i.test(el.tagName)) return;
    steps.push("  await page.locator('" + sel(el) + "').fill('" + String(el.value).replace(/'/g, "\\\\'") + "');");
    update();
  }

  function build() {
    return "import { test, expect } from '@playwright/test';\\n\\n" +
      "test('recorded flow', async ({ page }) => {\\n" +
      "  await page.goto('" + location.href + "');\\n" +
      steps.join('\\n') + "\\n});\\n";
  }

  var panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;z-index:2147483647;bottom:16px;right:16px;background:#0d1117;color:#fff;font:13px sans-serif;padding:12px 14px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.4)';
  function update() { count.textContent = steps.length + ' steps'; }
  var count = document.createElement('div'); count.style.marginBottom = '8px';
  var copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy test'; copyBtn.style.cssText = 'margin-right:6px;cursor:pointer';
  copyBtn.onclick = function () { navigator.clipboard.writeText(build()); copyBtn.textContent = 'Copied!'; };
  var stopBtn = document.createElement('button');
  stopBtn.textContent = 'Stop'; stopBtn.style.cursor = 'pointer';
  stopBtn.onclick = function () { window.__autestRecorder.stop(); };
  panel.appendChild(count); panel.appendChild(copyBtn); panel.appendChild(stopBtn);
  document.body.appendChild(panel);
  update();

  document.addEventListener('click', onClick, true);
  document.addEventListener('change', onChange, true);

  window.__autestRecorder = {
    stop: function () {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('change', onChange, true);
      panel.remove();
      window.__autestRecorder = null;
    },
  };
})();`;

export function buildBookmarklet(): string {
  return 'javascript:' + encodeURIComponent(RECORDER_SOURCE);
}
