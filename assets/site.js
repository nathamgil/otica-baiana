/* Site da Ótica Baiana: vitrine, reserva, exame e receita. Tudo que o cliente envia
   também fica salvo neste navegador para aparecer no painel da demo (admin.html). */
(function () {
  const O = window.OTICA;
  const $ = (s) => document.querySelector(s);
  const zap = (txt) => 'https://wa.me/' + O.whatsapp + '?text=' + encodeURIComponent(txt);
  const guarda = (chave, item) => {
    try { const l = JSON.parse(localStorage.getItem(chave) || '[]'); l.unshift(item); localStorage.setItem(chave, JSON.stringify(l.slice(0, 50))); } catch (e) {}
  };
  const agora = () => new Date().toISOString();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  $('#zap-fixo').href = zap('Olá! Vim pelo site da Ótica Baiana.');

  // ---------- vitrine ----------
  let cat = 'todos', estilo = 'todos';
  const nomeCat = (id) => (O.categorias.find((c) => c.id === id) || {}).nome || id;
  function chips() {
    const cats = [{ id: 'todos', nome: 'Todos' }, ...O.categorias];
    $('#f-cat').innerHTML = cats.map((c) => `<button class="chip ${c.id === cat ? 'on' : ''}" data-cat="${c.id}">${c.nome}</button>`).join('');
    const estilos = ['todos', ...new Set(O.produtos.filter((p) => cat === 'todos' || p.cat === cat).map((p) => p.estilo))];
    $('#f-estilo').innerHTML = estilos.map((e) => `<button class="chip ${e === estilo ? 'on' : ''}" data-estilo="${e}">${e === 'todos' ? 'Todos os estilos' : e}</button>`).join('');
  }
  function grade() {
    const lista = O.produtos.filter((p) => (cat === 'todos' || p.cat === cat) && (estilo === 'todos' || p.estilo === estilo));
    $('#grade').innerHTML = lista.map((p) => `
      <article class="card">
        <div class="img"><img src="${p.foto}" alt="${esc(p.nome)}" loading="lazy"><span class="cat">${nomeCat(p.cat)}</span></div>
        <div class="corpo">
          <h3>${esc(p.nome)}</h3>
          <div class="meta">Estilo ${esc(p.estilo)}</div>
          <div class="preco">Sob consulta</div>
          <button class="btn mini" data-reserva="${p.id}">${p.cat === 'lentes' ? 'Pedir orçamento' : 'Reservar para provar'}</button>
        </div>
      </article>`).join('') || '<p class="vazio">Nenhum modelo neste filtro.</p>';
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat],[data-estilo],[data-reserva]');
    if (!b) return;
    if (b.dataset.cat) { cat = b.dataset.cat; estilo = 'todos'; chips(); grade(); }
    if (b.dataset.estilo) { estilo = b.dataset.estilo; chips(); grade(); }
    if (b.dataset.reserva) {
      const p = O.produtos.find((x) => x.id === b.dataset.reserva);
      guarda('ob_pedidos', { id: 'R' + Date.now().toString().slice(-5), quando: agora(), produto: p.nome, cat: nomeCat(p.cat), cliente: 'Cliente do site', tel: '-', status: 'Novo' });
      window.open(zap(`Olá! Vi no site da Ótica Baiana e quero reservar para provar: ${p.nome} (${nomeCat(p.cat)}). Está disponível?`), '_blank');
    }
  });
  chips(); grade();

  // ---------- exame ----------
  const HORAS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  let hora = '';
  $('#horas').innerHTML = HORAS.map((h) => `<button type="button" class="hora" data-h="${h}">${h}</button>`).join('');
  $('#horas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-h]'); if (!b) return;
    hora = b.dataset.h;
    document.querySelectorAll('.hora').forEach((x) => x.classList.toggle('on', x === b));
  });
  const hoje = new Date(); hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  $('#ex-data').min = hoje.toISOString().slice(0, 10);
  $('#form-exame').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!hora) { alert('Escolha um horário.'); return; }
    const d = { nome: $('#ex-nome').value.trim(), tel: $('#ex-tel').value.trim(), data: $('#ex-data').value, hora, obs: $('#ex-obs').value.trim() };
    guarda('ob_exames', { ...d, quando: agora(), status: 'Aguardando confirmação' });
    const dataBR = d.data.split('-').reverse().join('/');
    window.open(zap(`Olá! Quero agendar exame de vista.\nNome: ${d.nome}\nDia: ${dataBR} às ${d.hora}${d.obs ? '\nObs.: ' + d.obs : ''}`), '_blank');
    $('#ex-ok').hidden = false; e.target.reset(); hora = ''; document.querySelectorAll('.hora').forEach((x) => x.classList.remove('on'));
  });

  // ---------- receita ----------
  let miniatura = '';
  $('#rc-foto').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const img = new Image();
    img.onload = () => { // miniatura pequena, só para o painel da demo
      const c = document.createElement('canvas'); const k = Math.min(1, 480 / img.width);
      c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      miniatura = c.toDataURL('image/jpeg', 0.7);
      $('#rc-prev').src = miniatura; $('#rc-prev').hidden = false;
    };
    img.src = URL.createObjectURL(f);
  });
  $('#form-receita').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!miniatura) { alert('Escolha a foto da receita.'); return; }
    const d = { nome: $('#rc-nome').value.trim(), tel: $('#rc-tel').value.trim(), tipo: $('#rc-tipo').value };
    guarda('ob_receitas', { ...d, foto: miniatura, quando: agora(), status: 'Novo' });
    window.open(zap(`Olá! Enviei minha receita pelo site e quero orçamento de: ${d.tipo}.\nNome: ${d.nome}\n(vou anexar a foto aqui)`), '_blank');
    $('#rc-ok').hidden = false;
  });

  // ---------- unidades ----------
  $('#unidades').innerHTML = O.unidades.map((u) => `
    <div class="unidade">
      <img src="fotos/07.jpg" alt="Loja ${esc(u.nome)}">
      <div class="info">
        <h3 style="font-size:32px">${esc(u.nome)}</h3>
        <dl><dt>Endereço</dt><dd>${esc(u.endereco)}<br>${esc(u.bairro)}</dd>
            <dt>Horário</dt><dd>${esc(u.horario)}</dd>
            <dt>WhatsApp</dt><dd>${esc(O.whatsappTexto)}</dd></dl>
        <div style="display:flex;flex-wrap:wrap;gap:10px">
          <a class="btn esc" href="${u.mapa}" target="_blank" rel="noopener">Como chegar</a>
          <a class="btn zap" href="${zap('Olá! Quero falar com a Ótica Baiana.')}" target="_blank" rel="noopener">Chamar no WhatsApp</a>
        </div>
      </div>
    </div>`).join('');
})();
