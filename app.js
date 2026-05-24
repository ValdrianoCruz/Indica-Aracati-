// DADOS
let profissionais = JSON.parse(localStorage.getItem('profissionais') || '[]');
let denuncias = JSON.parse(localStorage.getItem('denuncias') || '[]');
let adminLogado = false;

const PROFISSOES = ['Eletricista', 'Pedreiro', 'Costureira', 'Mototáxi', 'Táxi', 'Carroceiro', 'Boleiro'];
const SENHA_ADMIN = '148450V@ldri@noFvc@';

// Dados de exemplo
function inicializarDados() {
  if (profissionais.length === 0) {
    profissionais = [
      {
        id: 'prof-1',
        nome: 'João Silva',
        profissao: 'Eletricista',
        bairro: 'Centro',
        whatsapp: '5588998123456',
        status: 'aprovado',
        suspenso_ate: null,
        data_cadastro: new Date().toISOString(),
        data_aprovacao: new Date().toISOString()
      },
      {
        id: 'prof-2',
        nome: 'Maria Santos',
        profissao: 'Costureira',
        bairro: 'Várzea da Matriz',
        whatsapp: '5588999112233',
        status: 'aprovado',
        suspenso_ate: null,
        data_cadastro: new Date().toISOString(),
        data_aprovacao: new Date().toISOString()
      },
      {
        id: 'prof-3',
        nome: 'Pedro Mototaxi',
        profissao: 'Mototáxi',
        bairro: 'Pedregal',
        whatsapp: '5588999334455',
        status: 'aprovado',
        suspenso_ate: null,
        data_cadastro: new Date().toISOString(),
        data_aprovacao: new Date().toISOString()
      }
    ];
    localStorage.setItem('profissionais', JSON.stringify(profissionais));
  }
}

// UI FUNCTIONS
function mostrarSecao(secaoId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(secaoId).classList.add('active');
  window.scrollTo(0, 0);
}

function abrirModal(modalId) {
  document.getElementById(modalId).classList.add('ativo');
}

function fecharModal(modalId) {
  document.getElementById(modalId).classList.remove('ativo');
}

function abrirSuporte() {
  window.open('mailto:indicaaracati@gmail.com?subject=Suporte INDICA ARACATI');
}

function abrirAdmin() {
  abrirModal('modalAdmin');
}

// PROFISSIONAIS
function renderizarProfissionais(lista = null) {
  const container = document.getElementById('listaProf');
  const profAtivos = (lista || profissionais).filter(p => 
    p.status === 'aprovado' && (p.suspenso_ate === null || new Date(p.suspenso_ate) < new Date())
  );

  container.innerHTML = profAtivos.map(p => `
    <div class="card-prof">
      <div class="card-prof-header">
        <div>
          <h3>${p.nome}</h3>
          <p style="color: #999; font-size: 13px;">${p.profissao}</p>
        </div>
        <button class="denunciar-btn" onclick="abrirDenuncia('${p.id}', '${p.nome}')">⚠️</button>
      </div>
      <div class="card-prof-info">
        <span>📍 ${p.bairro}</span>
      </div>
      <a href="https://wa.me/${p.whatsapp}" target="_blank" class="whatsapp-btn">
        📱 Chamar no WhatsApp
      </a>
    </div>
  `).join('');
}

function buscarProfissionais() {
  const termo = document.getElementById('busca').value.toLowerCase();
  const filtrados = profissionais.filter(p => 
    p.nome.toLowerCase().includes(termo) ||
    p.profissao.toLowerCase().includes(termo) ||
    p.bairro.toLowerCase().includes(termo)
  );
  renderizarProfissionais(filtrados);
}

// FILTROS
function renderizarFiltros() {
  const container = document.getElementById('filtros');
  const filtros = ['Ver Todos', ...PROFISSOES];
  
  container.innerHTML = filtros.map(f => `
    <button class="filtro-btn ${f === 'Ver Todos' ? 'ativo' : ''}" 
            onclick="filtrarPorProfissao('${f}', this)">
      ${f}
    </button>
  `).join('');
}

function filtrarPorProfissao(profissao, btn) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');

  if (profissao === 'Ver Todos') {
    renderizarProfissionais();
  } else {
    const filtrados = profissionais.filter(p => p.profissao === profissao);
    renderizarProfissionais(filtrados);
  }

  document.getElementById('busca').value = '';
}

// CADASTRO
function cadastrarProf(e) {
  e.preventDefault();

  const prof = {
    id: 'prof-' + Date.now(),
    nome: document.getElementById('nome').value,
    profissao: document.getElementById('profissao').value,
    bairro: document.getElementById('bairro').value,
    whatsapp: '55' + document.getElementById('whatsapp').value.replace(/\D/g, ''),
    status: 'pendente',
    suspenso_ate: null,
    data_cadastro: new Date().toISOString(),
    data_aprovacao: null
  };

  profissionais.push(prof);
  localStorage.setItem('profissionais', JSON.stringify(profissionais));

  // Enviar email
  enviarEmailCadastro(prof);

  // Ir para pagamento
  mostrarSecao('pagamento');
  document.getElementById('formCadastro').reset();
}

function enviarEmailCadastro(prof) {
  const subject = `Novo Cadastro - ${prof.nome}`;
  const body = `DADOS DO PROFISSIONAL:%0A%0ANome: ${prof.nome}%0AProfissão: ${prof.profissao}%0ABairro: ${prof.bairro}%0AWhatsApp: ${prof.whatsapp}%0AData: ${new Date(prof.data_cadastro).toLocaleString('pt-BR')}%0A%0AINFORMAÇÕES DE PAGAMENTO:%0AChave PIX: 88999518761%0AValor: R$ 14,99`;
  
  window.open(`mailto:indicaaracati@gmail.com?subject=${subject}&body=${body}`);
}

function copiarPix() {
  navigator.clipboard.writeText('88999518761');
  alert('✅ Chave PIX copiada: 88999518761');
}

// DENÚNCIAS
function abrirDenuncia(profId, profNome) {
  document.getElementById('denunciaNome').textContent = `Denunciar: ${profNome}`;
  document.getElementById('motivoDenuncia').dataset.profId = profId;
  abrirModal('modalDenuncia');
}

function enviarDenuncia(e) {
  e.preventDefault();
  const profId = document.getElementById('motivoDenuncia').dataset.profId;
  const motivo = document.getElementById('motivoDenuncia').value;

  denuncias.push({
    id: 'den-' + Date.now(),
    profissional_id: profId,
    motivo: motivo,
    data: new Date().toISOString()
  });

  localStorage.setItem('denuncias', JSON.stringify(denuncias));
  alert('✅ Denúncia enviada com sucesso');
  fecharModal('modalDenuncia');
  document.getElementById('motivoDenuncia').value = '';
}

// ADMIN
function fazerLoginAdmin() {
  const senha = document.getElementById('senhaAdmin').value;
  
  if (senha === SENHA_ADMIN) {
    adminLogado = true;
    document.getElementById('adminPanel').classList.remove('hidden');
    document.getElementById('senhaAdmin').style.display = 'none';
    abaAdmin('aprovados');
  } else {
    alert('❌ Senha incorreta');
    document.getElementById('senhaAdmin').value = '';
  }
}

function abaAdmin(aba) {
  document.querySelectorAll('.admin-content').forEach(a => a.classList.remove('ativo'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('ativo'));
  
  document.getElementById('aba-' + aba).classList.add('ativo');
  event.target.classList.add('ativo');

  if (aba === 'aprovados') renderTabelaAprovados();
  if (aba === 'pendentes') renderTabelaPendentes();
  if (aba === 'denuncias') renderTabelaDenuncias();
  if (aba === 'relatorios') renderRelatorios();
}

function renderTabelaAprovados() {
  const tbody = document.getElementById('tabelaAprovados');
  const aprovados = profissionais.filter(p => p.status === 'aprovado');

  tbody.innerHTML = aprovados.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td>${p.profissao}</td>
      <td>${p.bairro}</td>
      <td>${p.whatsapp}</td>
      <td><span class="status-badge status-aprovado">Aprovado</span></td>
      <td class="acoes-col">
        <button class="btn-acao btn-suspender" onclick="suspenderProf('${p.id}')">Suspender 7d</button>
        <button class="btn-acao btn-banir" onclick="banirProf('${p.id}')">Banir</button>
      </td>
    </tr>
  `).join('');
}

function renderTabelaPendentes() {
  const tbody = document.getElementById('tabelaPendentes');
  const pendentes = profissionais.filter(p => p.status === 'pendente');

  tbody.innerHTML = pendentes.map(p => `
    <tr>
      <td>${p.nome}</td>
      <td>${p.profissao}</td>
      <td>${p.bairro}</td>
      <td>${p.whatsapp}</td>
      <td>${new Date(p.data_cadastro).toLocaleDateString('pt-BR')}</td>
      <td class="acoes-col">
        <button class="btn-acao btn-aprovar" onclick="aprovarProf('${p.id}')">Aprovar</button>
        <button class="btn-acao btn-rejeitar" onclick="rejeitarProf('${p.id}')">Rejeitar</button>
      </td>
    </tr>
  `).join('');
}

function renderTabelaDenuncias() {
  const tbody = document.getElementById('tabelaDenuncias');

  tbody.innerHTML = denuncias.map(d => {
    const prof = profissionais.find(p => p.id === d.profissional_id);
    return `
      <tr>
        <td>${prof ? prof.nome : 'Desconhecido'}</td>
        <td>${d.motivo}</td>
        <td>${new Date(d.data).toLocaleDateString('pt-BR')}</td>
        <td class="acoes-col">
          <button class="btn-acao btn-banir" onclick="banirProf('${d.profissional_id}')">Banir</button>
          <button class="btn-acao btn-suspender" onclick="suspenderProf('${d.profissional_id}')">Suspender 7d</button>
          <button class="btn-acao btn-secondary" onclick="ignorarDenuncia('${d.id}')">Ignorar</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderRelatorios() {
  const ativos = profissionais.filter(p => p.status === 'aprovado' && (p.suspenso_ate === null || new Date(p.suspenso_ate) < new Date())).length;
  const suspensos = profissionais.filter(p => p.suspenso_ate && new Date(p.suspenso_ate) > new Date()).length;
  const totalDen = denuncias.length;

  document.getElementById('totalAtivos').textContent = ativos;
  document.getElementById('totalSuspensos').textContent = suspensos;
  document.getElementById('totalDenuncias').textContent = totalDen;
}

function aprovarProf(id) {
  const prof = profissionais.find(p => p.id === id);
  if (prof) {
    prof.status = 'aprovado';
    prof.data_aprovacao = new Date().toISOString();
    localStorage.setItem('profissionais', JSON.stringify(profissionais));
    alert('✅ Profissional aprovado');
    renderTabelaPendentes();
    renderizarProfissionais();
  }
}

function rejeitarProf(id) {
  profissionais = profissionais.filter(p => p.id !== id);
  localStorage.setItem('profissionais', JSON.stringify(profissionais));
  alert('✅ Cadastro rejeitado');
  renderTabelaPendentes();
}

function suspenderProf(id) {
  const prof = profissionais.find(p => p.id === id);
  if (prof) {
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 7);
    prof.suspenso_ate = dataVencimento.toISOString();
    localStorage.setItem('profissionais', JSON.stringify(profissionais));
    alert('⏱️ Profissional suspenso por 7 dias');
    renderizarProfissionais();
  }
}

function banirProf(id) {
  const prof = profissionais.find(p => p.id === id);
  if (prof) {
    prof.status = 'banido';
    localStorage.setItem('profissionais', JSON.stringify(profissionais));
    alert('❌ Profissional banido');
    renderizarProfissionais();
  }
}

function ignorarDenuncia(id) {
  denuncias = denuncias.filter(d => d.id !== id);
  localStorage.setItem('denuncias', JSON.stringify(denuncias));
  alert('✅ Denúncia ignorada');
  renderTabelaDenuncias();
}

function exportarCSV() {
  const aprovados = profissionais.filter(p => p.status === 'aprovado');
  let csv = 'Nome,Profissão,Bairro,WhatsApp,Data Aprovação\n';
  
  aprovados.forEach(p => {
    csv += `"${p.nome}","${p.profissao}","${p.bairro}","${p.whatsapp}","${new Date(p.data_aprovacao).toLocaleString('pt-BR')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'profissionais_aprovados.csv';
  link.click();
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
  inicializarDados();
  renderizarFiltros();
  renderizarProfissionais();
});