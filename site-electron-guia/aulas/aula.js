function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatInline(text) {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return output;
}

function highlightSourceCode(rawCode, language) {
  const lang = (language || 'plaintext').toLowerCase();

  if (lang === 'html' || lang === 'xml') {
    let html = escapeHtml(rawCode);
    html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-comment">$1</span>');
    html = html.replace(/(&lt;\/?)([a-zA-Z0-9-]+)/g, '$1<span class="tok-keyword">$2</span>');
    html = html.replace(/([a-zA-Z-:]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="tok-attr">$1</span><span class="tok-operator">$2</span><span class="tok-string">$3</span>');
    return html;
  }

  let code = rawCode;
  const placeholders = [];

  const stash = (regex, className) => {
    code = code.replace(regex, (match) => {
      const idx = placeholders.push({ match, className }) - 1;
      return `@@TOK_${idx}@@`;
    });
  };

  if (['javascript', 'js', 'typescript', 'ts', 'json'].includes(lang)) {
    stash(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, 'tok-comment');
    stash(/`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'/g, 'tok-string');
  } else if (['css', 'scss'].includes(lang)) {
    stash(/\/\*[\s\S]*?\*\//g, 'tok-comment');
    stash(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'/g, 'tok-string');
  } else if (['bash', 'sh', 'shell'].includes(lang)) {
    stash(/#[^\n]*/g, 'tok-comment');
    stash(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'/g, 'tok-string');
  } else {
    return escapeHtml(rawCode);
  }

  let html = escapeHtml(code);

  if (['javascript', 'js', 'typescript', 'ts', 'json'].includes(lang)) {
    html = html.replace(/\b(const|let|var|function|return|if|else|switch|case|break|for|while|do|try|catch|finally|throw|new|class|extends|import|from|export|default|await|async|null|undefined|true|false)\b/g, '<span class="tok-keyword">$1</span>');
    html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-number">$1</span>');
    html = html.replace(/\b([a-zA-Z_$][\w$]*)(?=\()/g, '<span class="tok-function">$1</span>');
    html = html.replace(/([=+\-*/%<>!&|^~?:]+)/g, '<span class="tok-operator">$1</span>');
  }

  if (['css', 'scss'].includes(lang)) {
    html = html.replace(/([.#]?[a-zA-Z_-][a-zA-Z0-9_-]*)(\s*\{)/g, '<span class="tok-keyword">$1</span>$2');
    html = html.replace(/\b([a-z-]+)(\s*:)/g, '<span class="tok-attr">$1</span>$2');
    html = html.replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\b/g, '<span class="tok-number">$1</span>');
  }

  if (['bash', 'sh', 'shell'].includes(lang)) {
    html = html.replace(/\b(npm|node|cd|mkdir|rm|cp|mv|ls|cat|echo|python3|git|curl|wget)\b/g, '<span class="tok-keyword">$1</span>');
    html = html.replace(/\$[A-Za-z_][A-Za-z0-9_]*/g, '<span class="tok-number">$&</span>');
  }

  html = html.replace(/@@TOK_(\d+)@@/g, (_, index) => {
    const token = placeholders[Number(index)];
    return `<span class="${token.className}">${escapeHtml(token.match)}</span>`;
  });

  return html;
}

function enhanceCodeBlocks() {
  const blocks = document.querySelectorAll('pre > code');

  blocks.forEach((block) => {
    const className = block.className || '';
    const langMatch = className.match(/language-([\w-]+)/i);
    const language = langMatch ? langMatch[1].toLowerCase() : 'plaintext';
    const rawCode = block.textContent || '';

    block.innerHTML = highlightSourceCode(rawCode, language);

    const pre = block.parentElement;
    if (pre) {
      pre.setAttribute('data-language', language);
      pre.classList.add('code-editor');
    }
  });
}

function parseTable(lines, startIndex) {
  const headerLine = lines[startIndex];
  const separatorLine = lines[startIndex + 1] || '';
  if (!headerLine.includes('|') || !/^\s*\|?\s*[-:|\s]+\|?\s*$/.test(separatorLine)) return null;

  const parseRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => formatInline(cell.trim()));
  const headers = parseRow(headerLine);
  const rows = [];
  let i = startIndex + 2;

  while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
    rows.push(parseRow(lines[i]));
    i += 1;
  }

  let html = '<table><thead><tr>';
  for (const header of headers) html += `<th>${header}</th>`;
  html += '</tr></thead><tbody>';
  for (const row of rows) {
    html += '<tr>';
    for (const cell of row) html += `<td>${cell}</td>`;
    html += '</tr>';
  }
  html += '</tbody></table>';
  return { html, nextIndex: i - 1 };
}

function markdownToHtml(markdown) {
  const codeBlocks = [];
  const mdWithoutCode = markdown.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const html = `<pre><code class="language-${escapeHtml(lang || 'plaintext')}">${escapeHtml(code)}</code></pre>`;
    codeBlocks.push(html);
    return `@@CODEBLOCK_${codeBlocks.length - 1}@@`;
  });

  const lines = mdWithoutCode.replace(/\r/g, '').split('\n');
  const usedIds = new Map();
  const html = [];
  let paragraph = [];
  let inUl = false;
  let inOl = false;

  const closeParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${formatInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeLists = () => {
    if (inUl) { html.push('</ul>'); inUl = false; }
    if (inOl) { html.push('</ol>'); inOl = false; }
  };
  const uniqueId = (base) => {
    const safe = base || 'secao';
    const count = usedIds.get(safe) || 0;
    usedIds.set(safe, count + 1);
    return count === 0 ? safe : `${safe}-${count + 1}`;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^@@CODEBLOCK_(\d+)@@$/.test(trimmed)) {
      closeParagraph();
      closeLists();
      const index = Number(trimmed.match(/^@@CODEBLOCK_(\d+)@@$/)[1]);
      html.push(codeBlocks[index]);
      continue;
    }

    const tableResult = parseTable(lines, i);
    if (tableResult) {
      closeParagraph();
      closeLists();
      html.push(tableResult.html);
      i = tableResult.nextIndex;
      continue;
    }

    if (trimmed === '') { closeParagraph(); closeLists(); continue; }
    if (/^---+$/.test(trimmed)) { closeParagraph(); closeLists(); html.push('<hr>'); continue; }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      closeParagraph();
      closeLists();
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      const id = uniqueId(slugify(title));
      html.push(`<h${level} id="${id}">${formatInline(title)}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith('>')) {
      closeParagraph();
      closeLists();
      html.push(`<blockquote>${formatInline(trimmed.replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }

    const unorderedItem = /^[-*]\s+(.*)$/.exec(trimmed);
    if (unorderedItem) {
      closeParagraph();
      if (inOl) { html.push('</ol>'); inOl = false; }
      if (!inUl) { html.push('<ul>'); inUl = true; }
      html.push(`<li>${formatInline(unorderedItem[1])}</li>`);
      continue;
    }

    const orderedItem = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (orderedItem) {
      closeParagraph();
      if (inUl) { html.push('</ul>'); inUl = false; }
      if (!inOl) { html.push('<ol>'); inOl = true; }
      html.push(`<li>${formatInline(orderedItem[1])}</li>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  closeParagraph();
  closeLists();
  return html.join('\n');
}

function buildLessonsSidebar() {
  const list = document.getElementById('lessonList');
  const current = window.LESSON_META?.slug;
  const lessons = window.ALL_LESSONS || [];

  list.innerHTML = '';
  lessons.forEach((lesson) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `${lesson.slug}.html`;
    a.textContent = lesson.titulo;
    if (lesson.slug === current) a.classList.add('active');
    li.appendChild(a);
    list.appendChild(li);
  });
}

function setupSearch() {
  const input = document.getElementById('searchInput');
  const links = () => document.querySelectorAll('#lessonList a');

  input.addEventListener('input', () => {
    const term = input.value.toLowerCase().trim();
    links().forEach((link) => {
      const visible = link.textContent.toLowerCase().includes(term);
      link.parentElement.style.display = visible ? '' : 'none';
    });
  });
}

function setupPrevNext() {
  const lessons = window.ALL_LESSONS || [];
  const currentSlug = window.LESSON_META?.slug;
  const index = lessons.findIndex((l) => l.slug === currentSlug);

  const prevLink = document.getElementById('prevLink');
  const nextLink = document.getElementById('nextLink');

  if (index > 0) {
    prevLink.href = `${lessons[index - 1].slug}.html`;
    prevLink.textContent = `← ${lessons[index - 1].titulo}`;
  } else {
    prevLink.style.display = 'none';
  }

  if (index >= 0 && index < lessons.length - 1) {
    nextLink.href = `${lessons[index + 1].slug}.html`;
    nextLink.textContent = `${lessons[index + 1].titulo} →`;
  } else {
    nextLink.style.display = 'none';
  }
}

async function initLesson() {
  buildLessonsSidebar();
  setupSearch();
  setupPrevNext();

  const article = document.getElementById('article');
  const slug = window.LESSON_META?.slug;

  try {
    const response = await fetch(`conteudo/${slug}.md`);
    if (!response.ok) throw new Error(`Falha ao carregar ${slug}.md`);
    const markdown = await response.text();
    article.innerHTML = markdownToHtml(markdown);
    enhanceCodeBlocks();
  } catch (error) {
    article.innerHTML = `<p>Erro ao carregar a aula: ${escapeHtml(error.message)}</p>`;
  }
}

initLesson();
