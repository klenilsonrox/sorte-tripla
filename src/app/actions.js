'use server'

import { calculateSecurePrize, generateGameHash, generateSecureResult, shouldGuaranteeWin, validateGameHash } from './lib/game-security'
// Server Action para processar jogada
export async function processarJogada(dadosJogo) {
  const { saldo, perdaAcumulada, timestamp, hash } = dadosJogo
  
  // Validar integridade dos dados
  if (!validateGameHash(saldo, perdaAcumulada, timestamp, hash)) {
    throw new Error('Dados inválidos detectados')
  }
  
  // Validar saldo mínimo
  if (saldo < 4) {
    throw new Error('Saldo insuficiente')
  }
  
  // Processar jogada no servidor
  const novoSaldo = saldo - 4
  const garantirVitoria = shouldGuaranteeWin(perdaAcumulada)
  const resultado = generateSecureResult(garantirVitoria)
  
  // Verificar vitória
  const ganhou = resultado[0] === resultado[1] && resultado[1] === resultado[2]
  
  let dadosRetorno = {
    resultado,
    ganhou,
    novoSaldo,
    novaPerdaAcumulada: perdaAcumulada,
    premio: 0
  }
  
  if (ganhou) {
    const premio = calculateSecurePrize()
    dadosRetorno.novoSaldo += premio
    dadosRetorno.premio = premio
    dadosRetorno.novaPerdaAcumulada = 0
  } else {
    dadosRetorno.novaPerdaAcumulada = perdaAcumulada + 4
  }
  
  // Gerar novo hash para os dados atualizados
  const novoTimestamp = Date.now()
  const novoHash = generateGameHash(dadosRetorno.novoSaldo, dadosRetorno.novaPerdaAcumulada, novoTimestamp)
  
  dadosRetorno.timestamp = novoTimestamp
  dadosRetorno.hash = novoHash
  
  return dadosRetorno
}

// Server Action para validar adição de saldo
export async function adicionarSaldoSeguro(saldoAtual, valorAdicionar, timestamp, hash) {
  // Validar dados
  if (!validateGameHash(saldoAtual, 0, timestamp, hash)) {
    throw new Error('Dados inválidos')
  }
  
  if (valorAdicionar <= 0 || valorAdicionar > 1000) {
    throw new Error('Valor inválido')
  }
  
  const novoSaldo = saldoAtual + valorAdicionar
  const novoTimestamp = Date.now()
  const novoHash = generateGameHash(novoSaldo, 0, novoTimestamp)
  
  return {
    novoSaldo,
    timestamp: novoTimestamp,
    hash: novoHash
  }
}
