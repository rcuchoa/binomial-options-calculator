// Variáveis globais
let currentData = null;
let currentTreeType = 'stock'; // 'stock' ou 'option'

// Elementos DOM
const optionForm = document.getElementById('optionForm');
const resultsSection = document.getElementById('resultsSection');
const treeSection = document.getElementById('treeSection');
const loading = document.getElementById('loading');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const closeModal = document.querySelector('.close');

// Elementos de resultado
const optionPrice = document.getElementById('optionPrice');
const uParam = document.getElementById('uParam');
const dParam = document.getElementById('dParam');
const pParam = document.getElementById('pParam');
const dtParam = document.getElementById('dtParam');

// Controles da árvore
const showStockPrices = document.getElementById('showStockPrices');
const showOptionValues = document.getElementById('showOptionValues');
const treeCanvas = document.getElementById('treeCanvas');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    optionForm.addEventListener('submit', handleFormSubmit);
    showStockPrices.addEventListener('click', () => switchTreeView('stock'));
    showOptionValues.addEventListener('click', () => switchTreeView('option'));
    closeModal.addEventListener('click', hideErrorModal);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target === errorModal) {
            hideErrorModal();
        }
    });
});

// Função principal para lidar com o envio do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(optionForm);
    const data = {
        S0: parseFloat(formData.get('S0')),
        K: parseFloat(formData.get('K')),
        T: parseFloat(formData.get('T')),
        r: parseFloat(formData.get('r')),
        sigma: parseFloat(formData.get('sigma')),
        n_steps: parseInt(formData.get('n_steps')),
        option_type: formData.get('option_type')
    };
    
    // Validação básica
    if (!validateInputs(data)) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentData = result;
            displayResults(result);
            drawTree(result);
            hideLoading();
        } else {
            throw new Error(result.error || 'Erro desconhecido');
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// Validação de inputs
function validateInputs(data) {
    const errors = [];
    
    if (data.S0 <= 0) errors.push('Preço atual do ativo deve ser positivo');
    if (data.K <= 0) errors.push('Preço de exercício deve ser positivo');
    if (data.T <= 0) errors.push('Tempo até vencimento deve ser positivo');
    if (data.sigma <= 0) errors.push('Volatilidade deve ser positiva');
    if (data.n_steps <= 0) errors.push('Número de passos deve ser positivo');
    if (data.n_steps > 50) errors.push('Número de passos deve ser menor ou igual a 50');
    
    if (errors.length > 0) {
        showError(errors.join('\n'));
        return false;
    }
    
    return true;
}

// Exibir resultados
function displayResults(result) {
    // Atualizar preço da opção
    optionPrice.textContent = `R$ ${result.option_price.toFixed(4)}`;
    
    // Atualizar parâmetros da árvore
    uParam.textContent = result.parameters.u.toFixed(6);
    dParam.textContent = result.parameters.d.toFixed(6);
    pParam.textContent = result.parameters.p.toFixed(6);
    dtParam.textContent = result.parameters.dt.toFixed(6);
    
    // Mostrar seções
    resultsSection.style.display = 'block';
    treeSection.style.display = 'block';
    
    // Scroll para resultados
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Desenhar árvore binomial
function drawTree(data) {
    const ctx = treeCanvas.getContext('2d');
    const canvas = treeCanvas;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const n_steps = data.stock_prices.length - 1;
    const nodeRadius = 25;
    const levelHeight = 80;
    const startX = canvas.width / 2;
    const startY = 50;
    
    // Configurações de estilo
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Desenhar nós e conexões
    for (let i = 0; i <= n_steps; i++) {
        const y = startY + i * levelHeight;
        const nodesInLevel = i + 1;
        const totalWidth = (nodesInLevel - 1) * 120;
        const startXLevel = startX - totalWidth / 2;
        
        for (let j = 0; j <= i; j++) {
            const x = startXLevel + j * 120;
            
            // Desenhar conexões (exceto para o primeiro nível)
            if (i > 0) {
                ctx.strokeStyle = '#667eea';
                ctx.lineWidth = 2;
                
                // Conexão com nó pai superior
                if (j < i) {
                    const parentX = startXLevel - 120 + j * 120;
                    const parentY = y - levelHeight;
                    ctx.beginPath();
                    ctx.moveTo(x, y - nodeRadius);
                    ctx.lineTo(parentX, parentY + nodeRadius);
                    ctx.stroke();
                }
                
                // Conexão com nó pai inferior
                if (j > 0) {
                    const parentX = startXLevel - 120 + (j - 1) * 120;
                    const parentY = y - levelHeight;
                    ctx.beginPath();
                    ctx.moveTo(x, y - nodeRadius);
                    ctx.lineTo(parentX, parentY + nodeRadius);
                    ctx.stroke();
                }
            }
            
            // Desenhar nó
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Adicionar borda
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Adicionar texto
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Inter';
            
            let value;
            if (currentTreeType === 'stock') {
                value = data.stock_prices[i][j].toFixed(2);
            } else {
                value = data.option_values[i][j].toFixed(4);
            }
            
            // Quebrar texto se necessário
            if (value.length > 8) {
                const parts = value.split('.');
                ctx.fillText(parts[0], x, y - 5);
                ctx.fillText('.' + parts[1], x, y + 5);
            } else {
                ctx.fillText(value, x, y);
            }
        }
    }
    
    // Adicionar legenda
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`Árvore de ${currentTreeType === 'stock' ? 'Preços do Ativo' : 'Valores da Opção'}`, 20, canvas.height - 30);
}

// Alternar visualização da árvore
function switchTreeView(type) {
    currentTreeType = type;
    
    // Atualizar botões
    showStockPrices.classList.toggle('active', type === 'stock');
    showOptionValues.classList.toggle('active', type === 'option');
    
    // Redesenhar árvore
    if (currentData) {
        drawTree(currentData);
    }
}

// Funções de UI
function showLoading() {
    loading.style.display = 'flex';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
}

function hideErrorModal() {
    errorModal.style.display = 'none';
}

// Função para formatar números
function formatNumber(num, decimals = 4) {
    return parseFloat(num).toFixed(decimals);
}

// Função para validar se um número é válido
function isValidNumber(num) {
    return !isNaN(num) && isFinite(num) && num > 0;
}

// Adicionar validação em tempo real nos inputs
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            
            if (this.value && !isValidNumber(value)) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#e1e8ed';
            }
        });
    });
});

// Função para exportar resultados (opcional)
function exportResults() {
    if (!currentData) return;
    
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'binomial_option_results.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Função para limpar formulário
function clearForm() {
    optionForm.reset();
    resultsSection.style.display = 'none';
    treeSection.style.display = 'none';
    currentData = null;
    
    // Limpar canvas
    const ctx = treeCanvas.getContext('2d');
    ctx.clearRect(0, 0, treeCanvas.width, treeCanvas.height);
}

// Adicionar atalhos de teclado
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
            case 'Enter':
                event.preventDefault();
                optionForm.dispatchEvent(new Event('submit'));
                break;
            case 'r':
                event.preventDefault();
                clearForm();
                break;
        }
    }
}); 