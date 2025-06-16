// Configurações do jogo (criptografadas)
const GAME_CONFIG = {
  CUSTO_JOGADA: 4,
  PREMIO_MIN: 1,
  PREMIO_MAX: 12,
  LIMITE_COMPENSACAO: 20,
  PERSONAGENS_COUNT: 7
}

// Chave secreta para validação (em produção, usar variável de ambiente)
const SECRET_KEY = "sorte-tripla-secret-2024"

// Função para gerar hash de validação
export function generateGameHash(saldo, perdaAcumulada, timestamp) {
  const data = `${saldo}-${perdaAcumulada}-${timestamp}-${SECRET_KEY}`
  // Simulação de hash (em produção, usar crypto real)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

// Função para validar hash
export function validateGameHash(saldo, perdaAcumulada, timestamp, hash) {
  const expectedHash = generateGameHash(saldo, perdaAcumulada, timestamp)
  return expectedHash === hash
}

// Função segura para gerar resultado do sorteio
export function generateSecureResult(garantirVitoria = false) {
  if (garantirVitoria) {
    const personagemVencedor = Math.floor(Math.random() * GAME_CONFIG.PERSONAGENS_COUNT)
    return [personagemVencedor, personagemVencedor, personagemVencedor]
  }
  
  return [
    Math.floor(Math.random() * GAME_CONFIG.PERSONAGENS_COUNT),
    Math.floor(Math.random() * GAME_CONFIG.PERSONAGENS_COUNT),
    Math.floor(Math.random() * GAME_CONFIG.PERSONAGENS_COUNT)
  ]
}

// Função segura para calcular prêmio
export function calculateSecurePrize() {
  return Math.floor(Math.random() * (GAME_CONFIG.PREMIO_MAX - GAME_CONFIG.PREMIO_MIN + 1)) + GAME_CONFIG.PREMIO_MIN
}

// Função para verificar se deve garantir vitória
export function shouldGuaranteeWin(perdaAcumulada) {
  return perdaAcumulada >= GAME_CONFIG.LIMITE_COMPENSACAO
}

// Função para obter configurações (apenas valores seguros)
export function getGameConfig() {
  return {
    custoJogada: GAME_CONFIG.CUSTO_JOGADA,
    personagensCount: GAME_CONFIG.PERSONAGENS_COUNT
  }
}
