const API_URL = "https://guia-petrobras-backend.onrender.com";

/* =========================
   CAMPOS DO FORMULÁRIO
========================= */
const campos = [
  "numero_guia_prestador", "numero_guia_operadora",
  "beneficiario_nome", "cns", "numero_carteira", "validade_carteira", "atendimento_rn",
  "codigo_operadora", "nome_contratado", "cnes_contratado",
  "nome_profissional", "conselho", "numero_conselho", "uf_conselho", "cbo",
  "indicacao_acidente", "data_atendimento", "tipo_consulta", "tabela",
  "codigo_procedimento", "valor_procedimento", "observacao"
];

/* =========================
   DADOS DOS PROFISSIONAIS
========================= */
const profissionais = {
  "Emília Magalhães": { crm: "10608", uf: "BA", cbo: "225165" },
  "Karla Melo":      { crm: "11469", uf: "BA", cbo: "225165" },
  "Paulo Benígno":   { crm: "9795",  uf: "BA", cbo: "225125" }
};

/* =========================
   LOADING (POP-UP)
========================= */
function mostrarLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function esconderLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

/* =========================
   AUTOPREENCHIMENTO PROFISSIONAL
========================= */
const selectProfissional = document.getElementById("nome_profissional");

selectProfissional.addEventListener("change", () => {
  const dados = profissionais[selectProfissional.value] || {};

  document.getElementById("numero_conselho").value = dados.crm || "";
  document.getElementById("uf_conselho").value = dados.uf || "";
  document.getElementById("cbo").value = dados.cbo || "";
});

/* =========================
   PREENCHER DATA HOJE
========================= */
function preencherDataHoje() {
  const inputData = document.getElementById('data_atendimento');
  const hoje = new Date();
  
  // Formata a data no padrão YYYY-MM-DD (necessário para input type="date")
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  
  const dataFormatada = `${ano}-${mes}-${dia}`;
  
  // Preenche o input
  inputData.value = dataFormatada;
  
  // Adiciona efeito visual de feedback
  const btnHoje = document.querySelector('.btn-hoje');
  if (btnHoje) {
    btnHoje.classList.add('clicked');
    
    // Remove a classe após a animação
    setTimeout(() => {
      btnHoje.classList.remove('clicked');
    }, 400);
  }
  
  // Foca no input para mostrar que foi preenchido
  inputData.focus();
}

/* =========================
   GERAR PDF (BACKEND)
========================= */
async function gerarPDF() {
  const dados = {};

  campos.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      const chave = id === "cnes_contratado" ? "cnes" : id;
      dados[chave] = elemento.value;
    }
  });

  if (!dados.beneficiario_nome) {
    alert("Por favor, preencha ao menos o nome do beneficiário.");
    return;
  }

  mostrarLoading();

  try {
    const response = await fetch(`${API_URL}/gerar-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.erro || "Erro ao gerar PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "GUIA_CONSULTA_PREENCHIDA.pdf";
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao gerar PDF: " + erro.message);
  } finally {
    esconderLoading();
  }
}

/* =========================
   GERAR PDF DEBUG
========================= */
async function gerarPDFDebug() {
  mostrarLoading();

  try {
    const response = await fetch(`${API_URL}/gerar-pdf-debug`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error("Erro ao gerar PDF debug");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "GUIA_DEBUG.pdf";
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao gerar PDF debug: " + erro.message);
  } finally {
    esconderLoading();
  }
}

/* =========================
   LIMPAR FORMULÁRIO
========================= */
const valoresIniciais = {};

campos.forEach(id => {
  const elemento = document.getElementById(id);
  if (elemento && elemento.value) {
    valoresIniciais[id] = elemento.value;
  }
});

function limparFormulario() {
  campos.forEach(id => {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    if (valoresIniciais[id] !== undefined) {
      elemento.value = valoresIniciais[id];
    } else {
      elemento.value = "";
    }
  });
}

/* =========================
   EVENTOS
========================= */
document.getElementById("btnGerarPDF").addEventListener("click", gerarPDF);
document.getElementById("btnLimpar").addEventListener("click", limparFormulario);