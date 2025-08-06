from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import math

app = Flask(__name__)
CORS(app)

class BinomialOptionPricer:
    def __init__(self, S0, K, T, r, sigma, n_steps, option_type='call', option_style='european'):
        """
        Inicializa o calculador de opções binomiais
        
        Args:
            S0: Preço atual do ativo
            K: Preço de exercício
            T: Tempo até o vencimento (em anos)
            r: Taxa de juros livre de risco
            sigma: Volatilidade
            n_steps: Número de passos na árvore
            option_type: Tipo de opção ('call' ou 'put')
            option_style: Estilo da opção ('european' ou 'american')
        """
        self.S0 = S0
        self.K = K
        self.T = T
        self.r = r
        self.sigma = sigma
        self.n_steps = n_steps
        self.option_type = option_type
        self.option_style = option_style
        
        # Calcula parâmetros da árvore
        self.dt = T / n_steps
        self.u = math.exp(sigma * math.sqrt(self.dt))
        self.d = 1 / self.u
        self.p = (math.exp(r * self.dt) - self.d) / (self.u - self.d)
        
    def calculate_option_price(self):
        """Calcula o preço da opção usando árvore binomial"""
        # Inicializa matrizes para preços do ativo e valores da opção
        stock_prices = np.zeros((self.n_steps + 1, self.n_steps + 1))
        option_values = np.zeros((self.n_steps + 1, self.n_steps + 1))
        
        # Calcula preços do ativo na árvore
        for i in range(self.n_steps + 1):
            for j in range(i + 1):
                stock_prices[i, j] = self.S0 * (self.u ** (i - j)) * (self.d ** j)
        
        # Calcula valores da opção no vencimento
        for j in range(self.n_steps + 1):
            if self.option_type == 'call':
                option_values[self.n_steps, j] = max(stock_prices[self.n_steps, j] - self.K, 0)
            else:  # put
                option_values[self.n_steps, j] = max(self.K - stock_prices[self.n_steps, j], 0)
        
        # Retropropaga os valores da opção
        for i in range(self.n_steps - 1, -1, -1):
            for j in range(i + 1):
                # Valor esperado da opção
                expected_value = (self.p * option_values[i + 1, j] + 
                               (1 - self.p) * option_values[i + 1, j + 1])
                # Valor descontado
                option_values[i, j] = math.exp(-self.r * self.dt) * expected_value
                
                # Para opções americanas, verifica se é melhor exercer antecipadamente
                if self.option_style == 'american':
                    if self.option_type == 'call':
                        intrinsic_value = max(stock_prices[i, j] - self.K, 0)
                    else:  # put
                        intrinsic_value = max(self.K - stock_prices[i, j], 0)
                    
                    # O valor da opção é o máximo entre o valor intrínseco e o valor esperado
                    option_values[i, j] = max(intrinsic_value, option_values[i, j])
        
        return {
            'option_price': option_values[0, 0],
            'stock_prices': stock_prices.tolist(),
            'option_values': option_values.tolist(),
            'parameters': {
                'u': self.u,
                'd': self.d,
                'p': self.p,
                'dt': self.dt
            }
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate_option():
    try:
        data = request.get_json()
        
        # Extrai parâmetros
        S0 = float(data['S0'])
        K = float(data['K'])
        T = float(data['T'])
        r = float(data['r'])
        sigma = float(data['sigma'])
        n_steps = int(data['n_steps'])
        option_type = data['option_type']
        option_style = data.get('option_style', 'european')  # Padrão é europeia
        
        # Validações básicas
        if S0 <= 0 or K <= 0 or T <= 0 or n_steps <= 0:
            return jsonify({'error': 'Parâmetros devem ser positivos'}), 400
        
        if sigma <= 0:
            return jsonify({'error': 'Volatilidade deve ser positiva'}), 400
        
        if option_type not in ['call', 'put']:
            return jsonify({'error': 'Tipo de opção deve ser "call" ou "put"'}), 400
        
        if option_style not in ['european', 'american']:
            return jsonify({'error': 'Estilo de opção deve ser "european" ou "american"'}), 400
        
        # Calcula preço da opção
        pricer = BinomialOptionPricer(S0, K, T, r, sigma, n_steps, option_type, option_style)
        result = pricer.calculate_option_price()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Erro no cálculo: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080) 