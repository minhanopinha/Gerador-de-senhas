const CONJUNTOS = {
  maiusculas: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  minusculas: "abcdefghijklmnopqrstuvwxyz",
  numeros: "0123456789",
  simbolos: "!@#$%&*()_+-=[]{}?",
};

const TAMANHO_MIN = 4;
const TAMANHO_MAX = 32;

let tamanho = 12;

const campoSenha = document.getElementById("campo-senha");
const numeroCaracteres = document.getElementById("numero-caracteres");
const botaoDiminuir = document.getElementById("botao-diminuir");
const botaoAumentar = document.getElementById("botao-aumentar");
const botaoGerar = document.getElementById("botao-gerar");
const botaoCopiar = document.getElementById("botao-copiar");
const avisoCopiado = document.getElementById("copiado-aviso");
const forcaBarraPreenchido = document.getElementById("forca-barra-preenchido");
const forcaTexto = document.getElementById("forca-texto");

const opcaoMaiusculas = document.getElementById("opcao-maiusculas");
const opcaoMinusculas = document.getElementById("opcao-minusculas");
const opcaoNumeros = document.getElementById("opcao-numeros");
const opcaoSimbolos = document.getElementById("opcao-simbolos");

const checkboxes = [opcaoMaiusculas, opcaoMinusculas, opcaoNumeros, opcaoSimbolos];

function obterOpcoesAtivas() {
  return {
    maiusculas: opcaoMaiusculas.checked,
    minusculas: opcaoMinusculas.checked,
    numeros: opcaoNumeros.checked,
    simbolos: opcaoSimbolos.checked,
  };
}

function contarOpcoesAtivas(opcoes) {
  return Object.values(opcoes).filter(Boolean).length;
}

function montarConjuntoCaracteres(opcoes) {
  let conjunto = "";
  if (opcoes.maiusculas) conjunto += CONJUNTOS.maiusculas;
  if (opcoes.minusculas) conjunto += CONJUNTOS.minusculas;
  if (opcoes.numeros) conjunto += CONJUNTOS.numeros;
  if (opcoes.simbolos) conjunto += CONJUNTOS.simbolos;
  return conjunto;
}

function gerarNumerosAleatorios(quantidade) {
  const array = new Uint32Array(quantidade);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < quantidade; i++) {
      array[i] = Math.floor(Math.random() * 4294967296);
    }
  }
  return array;
}

function gerarSenha() {
  const opcoes = obterOpcoesAtivas();
  const conjunto = montarConjuntoCaracteres(opcoes);

  if (!conjunto) {
    return "";
  }

  const numerosAleatorios = gerarNumerosAleatorios(tamanho);
  let senha = "";

  for (let i = 0; i < tamanho; i++) {
    const indice = numerosAleatorios[i] % conjunto.length;
    senha += conjunto[indice];
  }

  return senha;
}

function calcularForca(senha, opcoes) {
  const categoriasAtivas = contarOpcoesAtivas(opcoes);
  let pontuacao = 0;

  if (senha.length >= 8) pontuacao += 1;
  if (senha.length >= 12) pontuacao += 1;
  if (senha.length >= 16) pontuacao += 1;
  pontuacao += categoriasAtivas - 1;

  if (pontuacao <= 1) {
    return { nivel: "Fraca", largura: "25%", cor: "var(--fraca)" };
  }
  if (pontuacao <= 3) {
    return { nivel: "Média", largura: "50%", cor: "var(--media)" };
  }
  if (pontuacao <= 5) {
    return { nivel: "Forte", largura: "75%", cor: "var(--forte)" };
  }
  return { nivel: "Muito forte", largura: "100%", cor: "var(--muito-forte)" };
}

function atualizarForca(senha) {
  const opcoes = obterOpcoesAtivas();
  const forca = calcularForca(senha, opcoes);

  forcaBarraPreenchido.style.width = forca.largura;
  forcaBarraPreenchido.style.backgroundColor = forca.cor;
  forcaTexto.textContent = forca.nivel;
}

function atualizarSenha() {
  const senha = gerarSenha();
  campoSenha.value = senha;
  atualizarForca(senha);
}

function garantirPeloMenosUmaOpcao(checkboxAtual) {
  const algumaMarcada = checkboxes.some((checkbox) => checkbox.checked);
  if (!algumaMarcada) {
    checkboxAtual.checked = true;
  }
}

function ajustarTamanho(delta) {
  tamanho = Math.min(TAMANHO_MAX, Math.max(TAMANHO_MIN, tamanho + delta));
  numeroCaracteres.textContent = tamanho;
  atualizarSenha();
}

botaoDiminuir.addEventListener("click", () => ajustarTamanho(-1));
botaoAumentar.addEventListener("click", () => ajustarTamanho(1));
botaoGerar.addEventListener("click", atualizarSenha);

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    garantirPeloMenosUmaOpcao(checkbox);
    atualizarSenha();
  });
});

botaoCopiar.addEventListener("click", async () => {
  if (!campoSenha.value) return;

  try {
    await navigator.clipboard.writeText(campoSenha.value);
  } catch (erro) {
    campoSenha.select();
    document.execCommand("copy");
  }

  avisoCopiado.classList.add("visivel");
  setTimeout(() => {
    avisoCopiado.classList.remove("visivel");
  }, 1500);
});

numeroCaracteres.textContent = tamanho;
atualizarSenha();
