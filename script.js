// Lista completa de campos
const campos = [
  "numero_guia_prestador", "numero_guia_operadora",
  "beneficiario_nome", "cns", "numero_carteira", "validade_carteira", "atendimento_rn",
  "codigo_operadora", "nome_contratado", "cnes_contratado",
  "nome_profissional", "conselho", "numero_conselho", "uf_conselho", "cbo",
  "indicacao_acidente", "data_atendimento", "tipo_consulta", "tabela",
  "codigo_procedimento", "valor_procedimento", "observacao"
];

// Dados dos profissionais
const profissionais = {
  "Emília Magalhães": { crm: "10608", uf: "BA", cbo: "225165" },
  "Karla Melo":      { crm: "11469", uf: "BA", cbo: "225165" },
  "Paulo Benígno":   { crm: "9795",  uf: "BA", cbo: "225125" }
};

// Preenche dados do profissional automaticamente
const select = document.getElementById("nome_profissional");

select.addEventListener("change", () => {
  const dados = profissionais[select.value];

  document.getElementById("numero_conselho").value = dados?.crm || "";
  document.getElementById("uf_conselho").value = dados?.uf || "";
  document.getElementById("cbo").value = dados?.cbo || "";
});

// Gera PDF profissional no backend
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

  try {
    const response = await fetch('/gerar-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.erro || 'Erro ao gerar PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GUIA_CONSULTA_PREENCHIDA.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    alert('PDF gerado com sucesso!');
  } catch (erro) {
    console.error('Erro:', erro);
    alert('Erro ao gerar PDF: ' + erro.message);
  }
}

// Gera PDF de debug com régua
async function gerarPDFDebug() {
  try {
    const response = await fetch('/gerar-pdf-debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!response.ok) throw new Error('Erro ao gerar PDF debug');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GUIA_DEBUG.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    alert('PDF debug gerado! Use-o para calibrar as coordenadas.');
  } catch (erro) {
    console.error('Erro:', erro);
    alert('Erro ao gerar PDF debug: ' + erro.message);
  }
}

// Event listeners
document.getElementById('btnGerarPDF').addEventListener('click', gerarPDF);
document.getElementById('btnDebug').addEventListener('click', gerarPDFDebug);