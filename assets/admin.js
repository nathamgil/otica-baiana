/* Painel da Ótica Baiana (demo). Login fixo da demonstração; dados de exemplo + o que
   foi enviado pelo site neste mesmo navegador. Nada sai do aparelho. */
(function () {
  const O = window.OTICA;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) || padrao; } catch (e) { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const dia = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const br = (iso) => iso ? iso.slice(0, 10).split('-').reverse().join('/') : '-';
  const zap = (tel, txt) => 'https://wa.me/55' + String(tel).replace(/\D/g, '') + '?text=' + encodeURIComponent(txt);

  // ---------- login ----------
  const logado = () => { try { return sessionStorage.getItem('ob_login') === '1'; } catch (e) { return false; } };
  function mostrar() {
    const ok = logado();
    $('#tela-login').hidden = ok; $('#painel').hidden = !ok; $('#sair').hidden = !ok;
    if (ok) render();
  }
  $('#form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = $('#lg-user').value.trim().toLowerCase(), s = $('#lg-senha').value;
    if (u === 'gerente' && s === 'oticabaiana') {
      try { sessionStorage.setItem('ob_login', '1'); } catch (er) {}
      $('#login-erro').hidden = true; mostrar();
    } else { $('#login-erro').hidden = false; }
  });
  $('#sair').addEventListener('click', () => { try { sessionStorage.removeItem('ob_login'); } catch (e) {} mostrar(); });

  // ---------- dados de exemplo (nomes fictícios) ----------
  const EX_PEDIDOS = [
    { id: 'R1042', quando: dia(0), produto: 'Armação oversized', cat: 'Óculos de grau', cliente: 'Mariana S.', tel: '71900000001', status: 'Novo', ex: 1 },
    { id: 'R1041', quando: dia(-1), produto: 'Óculos de sol escuro', cat: 'Óculos de sol', cliente: 'Carlos A.', tel: '71900000002', status: 'Separado na loja', ex: 1 },
    { id: 'R1039', quando: dia(-2), produto: 'Armação gatinho translúcida', cat: 'Óculos de grau', cliente: 'Juliana R.', tel: '71900000003', status: 'Lentes em produção', ex: 1 },
    { id: 'R1035', quando: dia(-5), produto: 'Armação quadrada clássica', cat: 'Óculos de grau', cliente: 'Pedro H.', tel: '71900000004', status: 'Pronto para retirar', ex: 1 },
    { id: 'R1030', quando: dia(-9), produto: 'Lentes de contato', cat: 'Lentes de contato', cliente: 'Ana Paula M.', tel: '71900000005', status: 'Entregue', ex: 1 }
  ];
  const EX_EXAMES = [
    { nome: 'Fernanda L.', tel: '71900000011', data: dia(0), hora: '10:00', obs: 'Primeira consulta', status: 'Confirmado', ex: 1 },
    { nome: 'Roberto C.', tel: '71900000012', data: dia(0), hora: '15:00', obs: 'Usa multifocal', status: 'Confirmado', ex: 1 },
    { nome: 'Lúcia B.', tel: '71900000013', data: dia(1), hora: '11:00', obs: '', status: 'Aguardando confirmação', ex: 1 },
    { nome: 'Thiago N.', tel: '71900000014', data: dia(2), hora: '17:00', obs: 'Quer lente de contato', status: 'Aguardando confirmação', ex: 1 }
  ];
  const EX_CLIENTES = [
    { nome: 'Helena P.', tel: '71900000021', ultima: dia(-350), compra: 'Óculos de grau', ex: 1 },
    { nome: 'Marcos V.', tel: '71900000022', ultima: dia(-340), compra: 'Multifocal', ex: 1 },
    { nome: 'Sandra O.', tel: '71900000023', ultima: dia(-380), compra: 'Óculos de grau', ex: 1 },
    { nome: 'Diego F.', tel: '71900000024', ultima: dia(-300), compra: 'Lentes de contato', ex: 1 },
    { nome: 'Camila T.', tel: '71900000025', ultima: dia(-120), compra: 'Óculos de sol com grau', ex: 1 },
    { nome: 'Rafael G.', tel: '71900000026', ultima: dia(-40), compra: 'Óculos de grau', ex: 1 }
  ];

  const pedidos = () => [...ler('ob_pedidos', []), ...EX_PEDIDOS];
  const exames = () => [...ler('ob_exames', []), ...EX_EXAMES].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  const receitas = () => ler('ob_receitas', []);
  const estoque = () => ler('ob_estoque', Object.fromEntries(O.produtos.map((p) => [p.id, p.estoque])));
  // receita vale ~1 ano: vencendo = 330 a 395 dias desde a última
  const situacao = (c) => {
    const d = Math.round((Date.now() - new Date(c.ultima)) / 864e5);
    if (d >= 365) return { t: 'Vencida', cls: 'erro', d };
    if (d >= 330) return { t: 'Vence em ' + (365 - d) + ' dias', cls: 'alerta', d };
    return { t: 'Em dia', cls: 'ok', d };
  };
  const exTag = (x) => x.ex ? ' <span class="pill ex">exemplo</span>' : ' <span class="pill novo">do site</span>';

  // ---------- abas ----------
  let aba = 'inicio';
  const ABAS = [
    ['inicio', 'Visão geral'], ['pedidos', 'Pedidos e reservas'], ['exames', 'Exames'],
    ['receitas', 'Receitas recebidas'], ['produtos', 'Produtos e estoque'], ['clientes', 'Clientes']
  ];
  function render() {
    const vencendo = EX_CLIENTES.filter((c) => situacao(c).cls !== 'ok').length;
    const qt = { pedidos: pedidos().filter((p) => p.status === 'Novo').length, exames: exames().filter((e) => e.data === dia(0)).length, receitas: receitas().length, clientes: vencendo };
    $('#abas').innerHTML = ABAS.map(([id, n]) => `<button class="aba ${id === aba ? 'on' : ''}" data-aba="${id}">${n}${qt[id] ? `<span class="qt">${qt[id]}</span>` : ''}</button>`).join('');
    $('#conteudo').innerHTML = TELAS[aba]();
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-aba]');
    if (a) { aba = a.dataset.aba; render(); window.scrollTo(0, 0); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.estoque) { const s = estoque(); s[t.dataset.estoque] = Math.max(0, +t.value || 0); gravar('ob_estoque', s); render(); }
    if (t.dataset.stPedido) {
      const l = ler('ob_pedidos', []); const p = l.find((x) => x.id === t.dataset.stPedido);
      if (p) { p.status = t.value; gravar('ob_pedidos', l); } else { const ex = EX_PEDIDOS.find((x) => x.id === t.dataset.stPedido); if (ex) ex.status = t.value; }
      render();
    }
  });

  const STATUS = ['Novo', 'Separado na loja', 'Lentes em produção', 'Pronto para retirar', 'Entregue', 'Cancelado'];
  const TELAS = {
    inicio() {
      const ex = exames().filter((e) => e.data === dia(0));
      const venc = EX_CLIENTES.map((c) => ({ ...c, s: situacao(c) })).filter((c) => c.s.cls !== 'ok');
      const baixo = O.produtos.filter((p) => estoque()[p.id] <= 2);
      return `
      <div class="kpis">
        <div class="kpi ouro"><small>Reservas novas</small><b>${pedidos().filter((p) => p.status === 'Novo').length}</b></div>
        <div class="kpi"><small>Exames hoje</small><b>${ex.length}</b></div>
        <div class="kpi"><small>Receitas para orçar</small><b>${receitas().length}</b></div>
        <div class="kpi"><small>Receitas vencendo</small><b style="color:var(--alerta)">${venc.length}</b></div>
      </div>
      <div class="caixa"><h3>Clientes para chamar de volta</h3>
        <p style="color:var(--suave);margin-top:0">Quem comprou há quase um ano está com a receita vencendo. Um lembrete no WhatsApp traz o cliente de volta para um óculos novo.</p>
        ${tabelaClientes(venc)}</div>
      <div class="duas">
        <div class="caixa"><h3>Exames de hoje</h3>${ex.length ? ex.map((e) => `<p style="margin:8px 0"><b>${e.hora}</b> · ${esc(e.nome)}${exTag(e)}</p>`).join('') : '<p class="vazio">Sem exames hoje.</p>'}</div>
        <div class="caixa"><h3>Estoque baixo</h3>${baixo.length ? baixo.map((p) => `<p style="margin:8px 0">${esc(p.nome)} · <span class="pill ${estoque()[p.id] ? 'alerta' : 'erro'}">${estoque()[p.id]} un.</span></p>`).join('') : '<p class="vazio">Tudo abastecido.</p>'}</div>
      </div>`;
    },
    pedidos() {
      return `<div class="caixa"><h3>Pedidos e reservas</h3>
        <p style="color:var(--suave);margin-top:0">Cada "Reservar" do site cai aqui. Acompanhe do separado até a entrega.</p>
        <div class="rolagem"><table class="tabela"><thead><tr><th>Nº</th><th>Data</th><th>Cliente</th><th>Produto</th><th>Status</th><th></th></tr></thead><tbody>
        ${pedidos().map((p) => `<tr><td><b>${esc(p.id)}</b></td><td>${br(p.quando)}</td><td>${esc(p.cliente)}${exTag(p)}</td><td>${esc(p.produto)}<br><small style="color:var(--suave)">${esc(p.cat)}</small></td>
          <td><select data-st-pedido="${esc(p.id)}">${STATUS.map((s) => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
          <td>${p.tel && p.tel !== '-' ? `<a class="btn zap mini" target="_blank" rel="noopener" href="${zap(p.tel, `Olá, ${p.cliente}! Aqui é da Ótica Baiana sobre a sua reserva ${p.id}.`)}">Avisar</a>` : ''}</td></tr>`).join('')}
        </tbody></table></div></div>`;
    },
    exames() {
      return `<div class="caixa"><h3>Agenda de exames</h3>
        <div class="rolagem"><table class="tabela"><thead><tr><th>Dia</th><th>Hora</th><th>Cliente</th><th>Observação</th><th>Status</th><th></th></tr></thead><tbody>
        ${exames().map((e) => `<tr><td>${br(e.data)}${e.data === dia(0) ? ' <span class="pill novo">hoje</span>' : ''}</td><td><b>${esc(e.hora)}</b></td><td>${esc(e.nome)}${exTag(e)}</td><td>${esc(e.obs) || '-'}</td>
          <td><span class="pill ${e.status === 'Confirmado' ? 'ok' : 'alerta'}">${esc(e.status)}</span></td>
          <td><a class="btn zap mini" target="_blank" rel="noopener" href="${zap(e.tel, `Olá, ${e.nome}! Confirmando seu exame de vista na Ótica Baiana dia ${br(e.data)} às ${e.hora}.`)}">Confirmar</a></td></tr>`).join('')}
        </tbody></table></div></div>`;
    },
    receitas() {
      const l = receitas();
      return `<div class="caixa"><h3>Receitas recebidas pelo site</h3>
        <p style="color:var(--suave);margin-top:0">O cliente fotografa a receita no site e ela aparece aqui para a loja montar o orçamento.</p>
        ${l.length ? `<div class="rolagem"><table class="tabela"><thead><tr><th>Foto</th><th>Data</th><th>Cliente</th><th>Quer</th><th></th></tr></thead><tbody>
          ${l.map((r) => `<tr><td><a href="${r.foto}" target="_blank"><img class="thumb" src="${r.foto}" alt="Receita"></a></td><td>${br(r.quando)}</td><td>${esc(r.nome)} <span class="pill novo">do site</span></td><td>${esc(r.tipo)}</td>
            <td><a class="btn zap mini" target="_blank" rel="noopener" href="${zap(r.tel, `Olá, ${r.nome}! Recebemos sua receita. Segue o orçamento de ${r.tipo}:`)}">Mandar orçamento</a></td></tr>`).join('')}
          </tbody></table></div>`
        : '<p class="vazio">Nenhuma receita ainda. Teste pelo site: "Enviar receita", com qualquer foto, e volte aqui.</p>'}</div>`;
    },
    produtos() {
      const s = estoque();
      return `<div class="caixa"><h3>Produtos e estoque</h3>
        <p style="color:var(--suave);margin-top:0">Quantidades de exemplo. Mude o número e a visão geral avisa o que está acabando.</p>
        <div class="rolagem"><table class="tabela"><thead><tr><th></th><th>Produto</th><th>Categoria</th><th>Estilo</th><th>Marca</th><th>Preço</th><th>Estoque</th></tr></thead><tbody>
        ${O.produtos.map((p) => `<tr><td><img class="thumb" src="${p.foto}" alt=""></td><td><b>${esc(p.nome)}</b> <span class="pill ex">exemplo</span></td>
          <td>${esc((O.categorias.find((c) => c.id === p.cat) || {}).nome)}</td><td>${esc(p.estilo)}</td><td>${esc(p.marca)}</td><td>Sob consulta</td>
          <td><input type="number" min="0" value="${s[p.id]}" data-estoque="${p.id}"> ${s[p.id] === 0 ? '<span class="pill erro">esgotado</span>' : s[p.id] <= 2 ? '<span class="pill alerta">baixo</span>' : ''}</td></tr>`).join('')}
        </tbody></table></div></div>`;
    },
    clientes() {
      const l = EX_CLIENTES.map((c) => ({ ...c, s: situacao(c) })).sort((a, b) => b.s.d - a.s.d);
      return `<div class="caixa"><h3>Clientes</h3>
        <p style="color:var(--suave);margin-top:0">A receita de óculos costuma valer cerca de um ano. O painel calcula pela data da última compra e mostra quem chamar.</p>
        ${tabelaClientes(l)}</div>`;
    }
  };
  function tabelaClientes(l) {
    if (!l.length) return '<p class="vazio">Ninguém com receita vencendo.</p>';
    return `<div class="rolagem"><table class="tabela"><thead><tr><th>Cliente</th><th>Última compra</th><th>Comprou</th><th>Receita</th><th></th></tr></thead><tbody>
      ${l.map((c) => `<tr><td><b>${esc(c.nome)}</b>${exTag(c)}</td><td>${br(c.ultima)}</td><td>${esc(c.compra)}</td><td><span class="pill ${c.s.cls}">${c.s.t}</span></td>
        <td>${c.s.cls !== 'ok' ? `<a class="btn zap mini" target="_blank" rel="noopener" href="${zap(c.tel, `Oi, ${c.nome}! Aqui é da Ótica Baiana. Já faz quase um ano do seu último óculos, que tal renovar o exame? Temos horário essa semana.`)}">Lembrar no WhatsApp</a>` : ''}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  mostrar();
})();
