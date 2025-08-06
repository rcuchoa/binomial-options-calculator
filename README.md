## Calculadora de Opções Binomiais

Uma aplicação web completa para cálculo de preços de opções usando o modelo de árvore binomial. A aplicação oferece uma interface moderna e intuitiva para entrada de parâmetros e visualização dos resultados.

## Características

- **Cálculo de Preços**: Implementa o modelo de árvore binomial para opções call e put
- **Suporte a Opções Americanas e Europeias**: Calcula preços para ambos os estilos de opção
- **Interface Moderna**: Design responsivo e intuitivo
- **Visualização da Árvore**: Representação gráfica da árvore binomial
- **Validação de Dados**: Validação em tempo real dos parâmetros de entrada
- **Resultados Detalhados**: Exibição do preço da opção e parâmetros da árvore

## Parâmetros da Opção

- **S₀ (Preço Atual do Ativo)**: Preço atual do ativo subjacente
- **K (Preço de Exercício)**: Preço de exercício da opção
- **T (Tempo até Vencimento)**: Tempo até o vencimento em anos
- **r (Taxa de Juros Livre de Risco)**: Taxa de juros anual
- **σ (Volatilidade)**: Volatilidade anual do ativo
- **N (Número de Passos)**: Número de passos na árvore binomial (1-50)
- **Tipo de Opção**: Call ou Put
- **Estilo da Opção**: Europeia ou Americana

## Instalação

### Pré-requisitos

- Python 3.7 ou superior
- pip (gerenciador de pacotes Python)

### Passos de Instalação

1. **Clone ou baixe o projeto**:
   ```bash
   cd ~/binomial-options-calculator
   ```

2. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Execute a aplicação**:
   ```bash
   python app.py
   ```

4. **Acesse no navegador**:
   Abra seu navegador e vá para `http://localhost:8080`

## Como Usar

### 1. Entrada de Parâmetros

Preencha os campos do formulário com os parâmetros da sua opção:

- **Preço Atual do Ativo (S₀)**: Ex: 100
- **Preço de Exercício (K)**: Ex: 100
- **Tempo até Vencimento (anos)**: Ex: 1
- **Taxa de Juros Livre de Risco (r)**: Ex: 0.05 (5%)
- **Volatilidade (σ)**: Ex: 0.2 (20%)
- **Número de Passos**: Ex: 10
- **Tipo de Opção**: Call ou Put
- **Estilo da Opção**: Europeia ou Americana

### 2. Cálculo

Clique no botão "Calcular Preço da Opção" para executar o cálculo.

### 3. Visualização dos Resultados

A aplicação exibirá:

- **Preço da Opção**: O valor calculado da opção
- **Tipo e Estilo da Opção**: Call/Put Europeia/Americana
- **Parâmetros da Árvore**: 
  - Fator de alta (u)
  - Fator de baixa (d)
  - Probabilidade neutra (p)
  - Intervalo de tempo (Δt)

### 4. Visualização da Árvore

A árvore binomial é exibida graficamente com:

- **Preços do Ativo**: Mostra a evolução dos preços do ativo
- **Valores da Opção**: Mostra os valores da opção em cada nó

Use os botões para alternar entre as visualizações.

## Modelo Matemático

### Árvore Binomial

O modelo assume que o preço do ativo pode subir ou descer em cada passo:

- **Fator de alta (u)**: `u = e^(σ√Δt)`
- **Fator de baixa (d)**: `d = 1/u`
- **Probabilidade neutra (p)**: `p = (e^(rΔt) - d)/(u - d)`

### Cálculo do Preço da Opção

1. **Construção da árvore**: Calcula os preços do ativo em cada nó
2. **Valores no vencimento**: Calcula o payoff da opção no vencimento
3. **Retropropagação**: Calcula os valores da opção retroativamente usando:
   ```
   V = e^(-rΔt) * [p * V_up + (1-p) * V_down]
   ```

### Diferenças entre Opções Americanas e Europeias

- **Opções Europeias**: Só podem ser exercidas no vencimento
- **Opções Americanas**: Podem ser exercidas a qualquer momento até o vencimento
- **Calls Americanas**: Geralmente não são exercidas antecipadamente (sem dividendos)
- **Puts Americanas**: Podem ser exercidas antecipadamente quando é ótimo fazê-lo

## Estrutura do Projeto

```
binomial-options-calculator/
├── app.py                 # Backend Flask
├── requirements.txt       # Dependências Python
├── README.md             # Documentação
├── templates/
│   └── index.html        # Template HTML
└── static/
    ├── css/
    │   └── style.css     # Estilos CSS
    └── js/
        └── script.js     # JavaScript frontend
```

## Tecnologias Utilizadas

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Cálculos**: NumPy
- **Visualização**: HTML5 Canvas

## Funcionalidades Avançadas

- **Validação em Tempo Real**: Os campos são validados conforme você digita
- **Responsividade**: Interface adaptável para diferentes tamanhos de tela
- **Tratamento de Erros**: Mensagens de erro claras e informativas
- **Atalhos de Teclado**: 
  - `Ctrl+Enter`: Calcular
  - `Ctrl+R`: Limpar formulário

## Exemplos de Uso

### Opção Call At-the-Money (Europeia)
- S₀ = 100, K = 100, T = 1, r = 0.05, σ = 0.2, N = 10
- Resultado esperado: ~10.25

### Opção Put In-the-Money (Americana vs Europeia)
- S₀ = 90, K = 100, T = 1, r = 0.05, σ = 0.2, N = 10
- Put Europeia: ~10.20
- Put Americana: ~11.44 (mais valiosa devido ao exercício antecipado)

## Limitações

- Número máximo de passos: 50 (para performance)
- Modelo assume volatilidade constante
- Não considera dividendos
- Aproximação discreta do movimento browniano

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto. 
