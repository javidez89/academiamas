import '../vendor/lucide/lucide.min.js';

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const date = (value) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'America/Bogota' }).format(new Date(value));

export async function mountCertificate(root, certificate, { validationUrl, refresh, notify }) {
  if (!document.querySelector('[data-certificate-style]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/assets/css/certificate-viewer.css';
    style.dataset.certificateStyle = '';
    document.head.append(style);
  }
  const issued = new Date(certificate.issued_at);
  const linkedin = new URL('https://www.linkedin.com/profile/add');
  linkedin.search = new URLSearchParams({ startTask: 'CERTIFICATION_NAME', name: certificate.course_name, organizationName: 'QAvance', issueYear: String(issued.getUTCFullYear()), issueMonth: String(issued.getUTCMonth() + 1), certUrl: validationUrl, certId: certificate.code }).toString();
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(validationUrl)}`;
  root.innerHTML = `
    <header class="credentialHeading">
      <div><p class="credentialStatus">${icon('circle-check')} Certificado válido</p><h1>${escape(certificate.full_name)}</h1><p>${escape(certificate.course_name)}</p></div>
      <a class="credentialSearch" href="/validar-certificado/">${icon('search')} Verificar otro certificado</a>
    </header>
    <div class="credentialLayout">
      <section class="credentialViewer" aria-label="Vista previa del certificado">
        <div class="credentialToolbar">
          <div class="credentialTabs" role="tablist" aria-label="Páginas del certificado">
            <button role="tab" aria-selected="true" data-page="1">${icon('file-badge')} Certificado</button>
            <button role="tab" aria-selected="false" data-page="2" tabindex="-1">${icon('files')} Contenido académico</button>
          </div>
          <div class="credentialTools">
            <button data-tool="previous" aria-label="Página anterior" title="Página anterior">${icon('chevron-left')}</button>
            <output data-page-label aria-live="polite">1 / 2</output>
            <button data-tool="next" aria-label="Página siguiente" title="Página siguiente">${icon('chevron-right')}</button>
            <button data-tool="less" aria-label="Reducir zoom" title="Reducir zoom">${icon('minus')}</button>
            <output data-zoom-label>100%</output>
            <button data-tool="more" aria-label="Aumentar zoom" title="Aumentar zoom">${icon('plus')}</button>
            <button data-tool="expand" aria-label="Pantalla completa" title="Pantalla completa">${icon('maximize')}</button>
          </div>
        </div>
        <div class="credentialCanvasArea"><p data-preview-status role="status">${certificate.preview_url ? 'Cargando certificado...' : certificate.public_pdf ? 'La vista previa no está disponible temporalmente.' : 'El PDF de este certificado es privado. Su titular puede descargarlo desde Mi cuenta.'}</p><canvas hidden aria-label="Página del certificado"></canvas></div>
        <button class="credentialRetry" data-tool="retry" hidden>Reintentar vista previa</button>
      </section>
      <aside class="credentialDetails" aria-label="Detalles del certificado">
        <h2>Detalles del certificado</h2>
        <dl><div><dt>Emitido por</dt><dd>QAvance</dd></div><div><dt>Fecha de emisión</dt><dd>${escape(date(certificate.issued_at))}</dd></div><div><dt>Curso finalizado</dt><dd>${escape(date(certificate.completed_at))}</dd></div><div><dt>Intensidad</dt><dd>${escape(certificate.estimated_hours)} horas</dd></div><div><dt>Modalidad</dt><dd>Virtual · Autoestudio</dd></div><div><dt>Código único</dt><dd class="credentialCode">${escape(certificate.code)}<button data-tool="code" aria-label="Copiar código" title="Copiar código">${icon('copy')}</button></dd></div></dl>
        ${certificate.public_pdf ? `<button class="credentialDownload" data-tool="download">${icon('download')} Descargar PDF</button>` : '<a class="credentialDownload" href="/mi-cuenta/">Ir a Mi cuenta</a>'}
        <section class="credentialSharing" aria-label="Compartir certificado"><h2>Compartir certificado</h2>
          <button data-tool="copy">${icon('link')} Copiar enlace</button>
          <button data-tool="share">${icon('share-2')} Compartir</button>
          <a href="${escape(shareUrl)}" target="_blank" rel="noopener noreferrer">${icon('linkedin')} Publicar en LinkedIn</a>
          <a class="credentialLinkedin" href="${escape(linkedin.href)}" target="_blank" rel="noopener noreferrer">${icon('external-link')} Añadir a mi perfil de LinkedIn</a>
        </section>
        <p class="credentialFeedback" role="status" aria-live="polite"></p>
      </aside>
    </div>
    <p class="credentialDisclaimer">Constancia de formación de QAvance. No equivale a una certificación oficial de ISTQB ni de otra entidad certificadora.</p>`;
  globalThis.lucide.createIcons();
  let pdf = null;
  let task = null;
  let renderTask = null;
  let pageNumber = 1;
  let zoom = 1;
  let generation = 0;
  let disposed = false;
  const canvas = root.querySelector('canvas');
  const area = root.querySelector('.credentialCanvasArea');
  const status = root.querySelector('[data-preview-status]');
  const retry = root.querySelector('[data-tool="retry"]');
  const feedback = (message) => { root.querySelector('.credentialFeedback').textContent = message; };
  const controls = () => {
    root.querySelectorAll('[data-page], .credentialTools button').forEach((button) => { button.disabled = !pdf; });
    root.querySelector('[data-tool="previous"]').disabled = !pdf || pageNumber === 1;
    root.querySelector('[data-tool="next"]').disabled = !pdf || pageNumber === pdf.numPages;
    root.querySelector('[data-tool="less"]').disabled = !pdf || zoom <= 0.75;
    root.querySelector('[data-tool="more"]').disabled = !pdf || zoom >= 2;
    root.querySelectorAll('[data-page]').forEach((button) => {
      const selected = Number(button.dataset.page) === pageNumber;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.disabled = !pdf || Number(button.dataset.page) > pdf.numPages;
    });
    root.querySelector('[data-page-label]').textContent = `${pageNumber} / ${pdf?.numPages || 2}`;
    root.querySelector('[data-zoom-label]').textContent = `${Math.round(zoom * 100)}%`;
  };
  async function paint() {
    if (!pdf || disposed) return;
    const version = ++generation;
    renderTask?.cancel();
    try {
      const page = await pdf.getPage(pageNumber);
      if (version !== generation || disposed) return;
      const base = page.getViewport({ scale: 1 });
      const width = Math.max(200, area.clientWidth - 32) * zoom;
      const viewport = page.getViewport({ scale: width / base.width });
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.hidden = false;
      canvas.setAttribute('aria-label', `Página ${pageNumber} del certificado`);
      renderTask = page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      await renderTask.promise;
      if (version !== generation || disposed) return;
      status.hidden = true;
      retry.hidden = true;
      controls();
    } catch (error) {
      if (error.name === 'RenderingCancelledException' || disposed) return;
      console.warn('Certificate PDF render:', error.message);
      status.textContent = 'No se pudo mostrar el PDF. Puedes reintentar o descargarlo.';
      status.hidden = false;
      retry.hidden = false;
    }
  }
  async function load(url) {
    controls();
    if (!url) { retry.hidden = !certificate.public_pdf; return; }
    status.textContent = 'Cargando certificado...';
    status.hidden = false;
    try {
      const pdfjs = await import('../vendor/pdfjs/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdfjs/pdf.worker.mjs';
      task = pdfjs.getDocument({ url, isEvalSupported: false });
      pdf = await task.promise;
      if (disposed) { await pdf.destroy(); return; }
      controls();
      await paint();
    } catch (error) {
      if (disposed) return;
      console.warn('Certificate PDF preview:', error.message);
      status.textContent = 'No se pudo cargar el PDF. Reintenta para renovar el enlace.';
      retry.hidden = false;
    }
  }
  const copy = async (value, message) => {
    try { await navigator.clipboard.writeText(value); feedback(message); }
    catch { globalThis.prompt('Copia este valor:', value); }
  };
  root.addEventListener('keydown', (event) => {
    if (!event.target.matches('[role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = root.querySelector(`[data-page="${['ArrowLeft', 'Home'].includes(event.key) ? 1 : 2}"]`);
    if (!target.disabled) { target.focus(); target.click(); }
  });
  root.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const action = button.dataset.tool;
    try {
      if (button.dataset.page) { pageNumber = Number(button.dataset.page); controls(); await paint(); }
      if (action === 'previous' || action === 'next') { pageNumber += action === 'next' ? 1 : -1; controls(); await paint(); }
      if (action === 'less' || action === 'more') { zoom = Math.max(0.75, Math.min(2, zoom + (action === 'more' ? 0.25 : -0.25))); controls(); await paint(); }
      if (action === 'expand') {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (area.parentElement.requestFullscreen) await area.parentElement.requestFullscreen();
        else { zoom = zoom === 1 ? 1.5 : 1; await paint(); }
      }
      if (action === 'code') await copy(certificate.code, 'Código copiado.');
      if (action === 'copy') await copy(validationUrl, 'Enlace copiado.');
      if (action === 'share') {
        if (navigator.share) await navigator.share({ title: `${certificate.full_name} · QAvance`, text: certificate.course_name, url: validationUrl });
        else await copy(validationUrl, 'Enlace copiado para compartir.');
      }
      if (action === 'download' || action === 'retry') {
        button.disabled = true;
        feedback('Consultando certificado...');
        const fresh = await refresh();
        if (!fresh.valid) { location.reload(); return; }
        if (!fresh.download_url || !fresh.preview_url) throw new Error('El PDF no está disponible para descarga pública.');
        if (action === 'retry') {
          await task?.destroy(); pdf = null; await load(fresh.preview_url);
        } else {
          const response = await fetch(fresh.download_url);
          if (!response.ok) throw new Error('No se pudo descargar el PDF. Intenta nuevamente.');
          const url = URL.createObjectURL(await response.blob());
          const link = document.createElement('a'); link.href = url; link.download = `Constancia-QAvance-${certificate.code}.pdf`; document.body.append(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
        feedback('');
      }
    } catch (error) {
      if (error.name !== 'AbortError') { feedback(error.message || 'No se pudo completar la acción.'); notify(error.message || 'No se pudo completar la acción.', 'error'); }
    } finally { if (action === 'download' || action === 'retry') button.disabled = false; }
  });
  let resizeTimer;
  const observer = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(paint, 120); });
  observer.observe(area);
  const removal = new MutationObserver(() => {
    if (root.isConnected) return;
    disposed = true; generation++; clearTimeout(resizeTimer); observer.disconnect(); removal.disconnect(); renderTask?.cancel(); task?.destroy();
  });
  removal.observe(root.parentElement, { childList: true });
  controls();
  await load(certificate.preview_url);
}
