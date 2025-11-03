import React, { useEffect, useRef, useState } from 'react';

function escapeHtml(str){
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linkify(text){
  const urlRe = /(https?:\/\/[\w\-\.\/%#?=&+~:@,;!()]+)|((?:www)\.[\w\-\.]+\.[a-z]{2,}(?:\/[\w\-\.\/%#?=&+~:@,;!()]*)?)/gi;
  return text.replace(urlRe, (m) => {
    const url = m.startsWith('http') ? m : `https://${m}`;
    return `<a href="${url}" target="_blank" rel="noopener">${m}</a>`;
  });
}

function transformToHtml(text){
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inList = false;
  let listAfterLabel = false;
  let inPre = false;
  let inTable = false;
  let tableHasHeader = false;
  let pendingParagraph = '';

  function closeParagraph(){
    if(pendingParagraph.trim()){
      html += `<p>${linkify(escapeHtml(pendingParagraph.trim()))}</p>`;
      pendingParagraph = '';
    }
  }
  function closeList(){ if(inList){ html += '</ul>'; inList = false; } listAfterLabel = false; }
  function openList(){ if(!inList){ html += '<ul>'; inList = true; } }
  function closePre(){ if(inPre){ html += '</code></pre>'; inPre = false; } }
  function openPre(){ if(!inPre){ html += '<pre><code>'; inPre = true; } }
  function closeTable(){ if(inTable){ html += (tableHasHeader ? '</tbody></table>' : '</table>'); inTable = false; tableHasHeader = false; } }

  const headingRe = /^(\d+(?:\.\d+)*)\.\s+(.+)$/;
  const tableRowRe = /^(.+)\t(.+)$/; // rows separated by tabs

  for(let i=0;i<lines.length;i++){
    const raw = lines[i];
    const line = raw.trim();

    if(line === ''){
      if(listAfterLabel){ closeParagraph(); continue; }
      closeParagraph();
      if(inPre){ html += '\n'; }
      else { closeList(); closeTable(); }
      continue;
    }

    const hMatch = line.match(headingRe);
    if(hMatch){
      closeParagraph(); closeList(); closePre(); closeTable();
      const levelCount = hMatch[1].split('.').length;
      const tag = levelCount === 1 ? 'h2' : (levelCount === 2 ? 'h3' : (levelCount === 3 ? 'h4' : 'h5'));
      html += `<${tag}>${escapeHtml(hMatch[1] + '. ' + hMatch[2])}</${tag}>`;
      continue;
    }

    if(/:$/u.test(line)){
      closeParagraph(); closeList(); closePre(); closeTable();
      const label = line.replace(/:$/,'').trim();
      html += `<p>${linkify(escapeHtml(line))}</p>`;
      listAfterLabel = true;
      if(/^Ejemplo de uso$/i.test(label)){ listAfterLabel = false; openPre(); }
      continue;
    }

    const tMatch = raw.match(tableRowRe);
    if(tMatch){
      closeParagraph(); closeList(); closePre();
      if(!inTable){ inTable = true; tableHasHeader = false; }
      if(!tableHasHeader){
        html += '<table><thead><tr>' + tMatch.slice(1).map(c=>`<th>${escapeHtml(c.trim())}</th>`).join('') + '</tr></thead><tbody>';
        tableHasHeader = true;
      } else {
        html += '<tr>' + tMatch.slice(1).map(c=>`<td>${linkify(escapeHtml(c.trim()))}</td>`).join('') + '</tr>';
      }
      continue;
    }

    if(inPre){ html += escapeHtml(raw) + '\n'; continue; }

    if(/^[-*]\s+/.test(line)){
      closeParagraph(); closeTable(); openList();
      html += `<li>${linkify(escapeHtml(line.replace(/^[-*]\s+/, '')))}</li>`;
      continue;
    }

    if(listAfterLabel){
      if(headingRe.test(line) || /:$/u.test(line) || tableRowRe.test(raw) || /^(git |az |bash |pwsh |curl |wget |npm |yarn |pnpm )/i.test(line)){
        closeList();
        i--; listAfterLabel = false; continue;
      }
      openList();
      html += `<li>${linkify(escapeHtml(line))}</li>`;
      continue;
    }

    if(/^(git |az |bash |pwsh |curl |wget |npm |yarn |pnpm )/i.test(line)){
      closeParagraph(); closeList(); closeTable(); openPre();
      html += escapeHtml(raw) + '\n';
      continue;
    }

    if(pendingParagraph){ pendingParagraph += ' ' + raw.trim(); }
    else { pendingParagraph = raw; }
  }

  closeParagraph(); closeList(); closePre(); closeTable();
  return html;
}

function slugify(text){
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s.-]/g,'')
    .trim().replace(/[\s]+/g,'-');
}

function buildIndex(container, indexRoot){
  const headings = container.querySelectorAll('h2, h3, h4');
  if(!headings.length || !indexRoot) return;
  const seen = new Map();
  const items = [];
  headings.forEach(h => {
    const level = h.tagName === 'H2' ? 2 : (h.tagName === 'H3' ? 3 : 4);
    const text = h.textContent.trim();
    let base = slugify(text);
    let id = base;
    let i = 2;
    while(seen.has(id)){ id = `${base}-${i++}`; }
    seen.set(id, true);
    h.id = id;
    items.push({ level, text, id });
  });

  const accord = document.createElement('div');
  accord.className = 'accordion';
  let currentList = null;
  function scrollToHeading(targetId){
    const el = document.getElementById(targetId);
    if(!el) return;
    const headerH = 68;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  items.forEach(it => {
    if(it.level === 2){
      const item = document.createElement('div');
      item.className = 'accordion-item';
      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.tabIndex = 0;
      header.innerHTML = `<span>${it.text}</span><button class="idx-jump" title="Ir a sección" aria-label="Ir a sección">▾</button>`;
      const id = it.id;
      function toggleOnly(){ item.classList.toggle('open'); }
      header.addEventListener('click', ()=>{ scrollToHeading(id); });
      header.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); scrollToHeading(id);} });
      const jumpBtn = header.querySelector('.idx-jump');
      if(jumpBtn){
        jumpBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleOnly(); });
        jumpBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); e.stopPropagation(); toggleOnly(); } });
      }
      const content = document.createElement('div');
      content.className = 'accordion-content';
      currentList = document.createElement('ul');
      content.appendChild(currentList);
      item.appendChild(header);
      item.appendChild(content);
      accord.appendChild(item);
    } else if(currentList){
      if(it.level === 3 && /^\d+\.\d+\./.test(it.text)){
        const li = document.createElement('li');
        li.innerHTML = `<a class="index-link" href="#${it.id}">${it.text}</a>`;
        currentList.appendChild(li);
      }
    }
  });

  indexRoot.innerHTML = '';
  indexRoot.appendChild(accord);
  const first = accord.querySelector('.accordion-item');
  if(first) first.classList.add('open');
  const linkMap = new Map();
  accord.querySelectorAll('a.index-link').forEach(a => linkMap.set(a.getAttribute('href').slice(1), a));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const a = linkMap.get(entry.target.id);
        if(a){
          accord.querySelectorAll('a.index-link.active').forEach(x => x.classList.remove('active'));
          a.classList.add('active');
        }
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] });
  container.querySelectorAll('h2, h3, h4').forEach(h => observer.observe(h));
}

export default function Az400Content(){
  const contentRef = useRef(null);
  const indexRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function run(){
      try{
        const res = await fetch('/DevSecOps/AZ-400/Theory.txt', { cache: 'no-store' });
        if(!res.ok) throw new Error('no se pudo cargar el contenido');
        const txt = await res.text();
        if(cancelled) return;
        if(contentRef.current){ contentRef.current.innerHTML = transformToHtml(txt); }
        if(contentRef.current && indexRef.current){ buildIndex(contentRef.current, indexRef.current); }
      }catch(e){ setError('Error cargando el contenido.'); }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="layout az-wide">
      <aside className="sidebar">
        <h3>Índice AZ-400</h3>
        <div ref={indexRef} />
      </aside>
      <div className="content-area">
        <section className="card az-card">
          <h2>AZ-400 — Teoría</h2>
          {error ? <p>{error}</p> : <div ref={contentRef} id="az400-content" />}
        </section>
      </div>
    </div>
  );
}

