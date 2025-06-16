"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Coins, DollarSign, Sparkles, Trophy, Zap } from "lucide-react"
import Image from "next/image"
import { generateGameHash } from "../lib/game-security"
import { adicionarSaldoSeguro, processarJogada } from "../actions"
export default function SorteTripla() {
  const [saldo, setSaldo] = useState(50)
  const [personagensSorteados, setPersonagensSorteados] = useState([null, null, null])
  const [personagensGirando, setPersonagensGirando] = useState([false, false, false])
  const [perdaAcumulada, setPerdaAcumulada] = useState(0)
  const [showModalSaldo, setShowModalSaldo] = useState(false)
  const [showModalVitoria, setShowModalVitoria] = useState(false)
  const [showModalSaldoZero, setShowModalSaldoZero] = useState(false)
  const [valorAdicionar, setValorAdicionar] = useState("")
  const [valorGanho, setValorGanho] = useState(0)
  const [jogando, setJogando] = useState(false)
  const [personagensAnimacao, setPersonagensAnimacao] = useState([0, 0, 0])
  const [gameHash, setGameHash] = useState("")
  const [timestamp, setTimestamp] = useState(Date.now())

const personagens = [
    { id: 0, nome: "Stitch", imagem: "/images/stitch.png" },
    { id: 1, nome: "Mario", imagem: "/images/mario.webp" },
    { id: 2, nome: "Yoshi", imagem: "/images/yoshi.png" },
    { id: 3, nome: "Toad", imagem: "/images/toad.png" },
    { id: 4, nome: "Sonic", imagem: "/images/sonic.avif" },
    { id: 5, nome: "Goku", imagem: "/images/goku.webp" },
    { id: 6, nome: "Naruto", imagem: "/images/naruto.webp" },
  ]


  // Inicializar hash de segurança
  useEffect(() => {
    const initialTimestamp = Date.now()
    const initialHash = generateGameHash(saldo, perdaAcumulada, initialTimestamp)
    setGameHash(initialHash)
    setTimestamp(initialTimestamp)
  }, [])

  const jogar = async () => {
    if (saldo < 4) {
      setShowModalSaldoZero(true)
      return
    }

    setJogando(true)
    setPersonagensSorteados([null, null, null])
    setPersonagensGirando([true, true, true])

    try {
      // Processar jogada no servidor
      const resultado = await processarJogada({
        saldo,
        perdaAcumulada,
        timestamp,
        hash: gameHash,
      })

      // Animação dos resultados
      setTimeout(() => {
        setPersonagensGirando([false, true, true])
        setPersonagensSorteados([resultado.resultado[0], null, null])
      }, 500)

      setTimeout(() => {
        setPersonagensGirando([false, false, true])
        setPersonagensSorteados([resultado.resultado[0], resultado.resultado[1], null])
      }, 1000)

      setTimeout(() => {
        setPersonagensGirando([false, false, false])
        setPersonagensSorteados(resultado.resultado)

        // Atualizar estado com dados seguros do servidor
        setSaldo(resultado.novoSaldo)
        setPerdaAcumulada(resultado.novaPerdaAcumulada)
        setGameHash(resultado.hash)
        setTimestamp(resultado.timestamp)

        if (resultado.ganhou) {
          setValorGanho(resultado.premio)
          setTimeout(() => setShowModalVitoria(true), 300)
        }

        setJogando(false)
      }, 1500)
    } catch (error) {
      console.error("Erro na jogada:", error)
      setJogando(false)
      alert("Erro detectado. Recarregue a página.")
    }
  }

  // Animação dos personagens girando
  useEffect(() => {
    const intervalos = []

    personagensGirando.forEach((girando, index) => {
      if (girando) {
        const intervalo = setInterval(() => {
          setPersonagensAnimacao((prev) => {
            const novos = [...prev]
            novos[index] = Math.floor(Math.random() * 7)
            return novos
          })
        }, 80)
        intervalos.push(intervalo)
      }
    })

    return () => {
      intervalos.forEach((intervalo) => clearInterval(intervalo))
    }
  }, [personagensGirando])

  const adicionarSaldo = async () => {
    const valor = Number.parseFloat(valorAdicionar)
    if (valor && valor > 0) {
      try {
        const resultado = await adicionarSaldoSeguro(saldo, valor, timestamp, gameHash)

        setSaldo(resultado.novoSaldo)
        setGameHash(resultado.hash)
        setTimestamp(resultado.timestamp)
        setValorAdicionar("")
        setShowModalSaldo(false)
        setShowModalSaldoZero(false)
      } catch (error) {
        console.error("Erro ao adicionar saldo:", error)
        alert("Erro detectado. Recarregue a página.")
      }
    }
  }

  const resetarJogo = () => {
    setPersonagensSorteados([null, null, null])
    setPersonagensAnimacao([0, 0, 0])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
            🎰 SORTE TRIPLA 🎰
          </h1>
          <p className="text-xl text-white/80">Três personagens iguais = VITÓRIA!</p>
        </motion.div>

        {/* Saldo */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8" />
                  <div>
                    <p className="text-sm opacity-90">Seu Saldo</p>
                    <p className="text-3xl font-bold">R$ {saldo.toFixed(2)}</p>
                  </div>
                </div>
                <Button onClick={() => setShowModalSaldo(true)} className="bg-white text-green-600 hover:bg-gray-100">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Adicionar Saldo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Máquina de Sorteio */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-0 text-white shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">🎰 MÁQUINA DA SORTE 🎰</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Display dos Personagens */}
              <div className="bg-black/30 rounded-2xl p-8 mb-8">
                <div className="grid grid-cols-3 gap-6">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="relative"
                      animate={personagensGirando[index] ? { y: [0, -10, 0] } : {}}
                      transition={{ duration: 0.08, repeat: personagensGirando[index] ? Number.POSITIVE_INFINITY : 0 }}
                    >
                      <div className="bg-gradient-to-br from-white to-gray-100 rounded-xl aspect-square flex items-center justify-center border-4 border-yellow-400 shadow-lg p-2">
                        <motion.div
                          className="w-full h-full relative"
                          animate={
                            personagensGirando[index]
                              ? {
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, -5, 0],
                                }
                              : {}
                          }
                          transition={{
                            duration: 0.15,
                            repeat: personagensGirando[index] ? Number.POSITIVE_INFINITY : 0,
                          }}
                        >
                          <Image
                            src={
                              personagens[
                                personagensSorteados[index] !== null
                                  ? personagensSorteados[index]
                                  : personagensAnimacao[index]
                              ].imagem
                            }
                            alt={
                              personagens[
                                personagensSorteados[index] !== null
                                  ? personagensSorteados[index]
                                  : personagensAnimacao[index]
                              ].nome
                            }
                            fill
                            className="object-contain rounded-lg"
                            crossOrigin="anonymous"
                          />
                        </motion.div>
                      </div>

                      {/* Efeito de brilho quando girando */}
                      {personagensGirando[index] && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-xl"
                          animate={{ x: [-100, 100] }}
                          transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Indicador de Status */}
                <div className="text-center mt-6">
                  {jogando ? (
                    <motion.p
                      className="text-2xl font-bold text-yellow-300"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                    >
                      🎲 SORTEANDO... 🎲
                    </motion.p>
                  ) : personagensSorteados.every((n) => n !== null) ? (
                    personagensSorteados[0] === personagensSorteados[1] &&
                    personagensSorteados[1] === personagensSorteados[2] ? (
                      <motion.p
                        className="text-3xl font-bold text-green-300"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.4, repeat: 3 }}
                      >
                        🏆 VOCÊ GANHOU! 🏆
                      </motion.p>
                    ) : (
                      <p className="text-xl text-red-300">❌ Tente novamente!</p>
                    )
                  ) : (
                    <p className="text-xl text-white/70">Clique em JOGAR para começar!</p>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-4">
                <Button
                  onClick={jogar}
                  disabled={jogando || saldo < 4}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 text-2xl shadow-lg"
                >
                  {jogando ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="flex items-center"
                    >
                      <Zap className="w-6 h-6 mr-3" />
                      SORTEANDO...
                    </motion.div>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-3" />
                      JOGAR (R$ 4,00)
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetarJogo}
                  variant="outline"
                  className="w-full border-white/50 text-white hover:bg-white/10 py-2"
                  disabled={jogando}
                >
                  Limpar Resultado
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Legenda dos Personagens */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">🎮 Personagens do Jogo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {personagens.map((personagem) => (
                  <div key={personagem.id} className="text-center">
                    <div className="bg-white rounded-lg p-2 mb-2 aspect-square relative">
                      <Image
                        src={personagem.imagem || "/placeholder.svg"}
                        alt={personagem.nome}
                        fill
                        className="object-contain rounded"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <p className="text-white text-sm font-bold">{personagem.nome}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal Saldo Zero */}
        <Dialog open={showModalSaldoZero} onOpenChange={setShowModalSaldoZero}>
          <DialogContent className="bg-gradient-to-br from-red-600 to-red-700 text-white border-0">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">💸 Saldo Insuficiente!</DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <p className="mb-4">Você precisa de pelo menos R$ 4,00 para jogar.</p>
              <Button onClick={() => setShowModalSaldo(true)} className="bg-white text-red-600 hover:bg-gray-100">
                Adicionar Saldo
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Saldo */}
        <Dialog open={showModalSaldo} onOpenChange={setShowModalSaldo}>
          <DialogContent className="bg-gradient-to-br from-green-600 to-emerald-600 text-white border-0">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">💰 Adicionar Saldo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Valor a adicionar (R$)</Label>
                <Input
                  type="number"
                  value={valorAdicionar}
                  onChange={(e) => setValorAdicionar(e.target.value)}
                  className="bg-white/20 border-white/30 text-white"
                  placeholder="Digite o valor"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={adicionarSaldo} className="flex-1 bg-white text-green-600 hover:bg-gray-100">
                  Confirmar
                </Button>
                <Button
                  onClick={() => setShowModalSaldo(false)}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Vitória */}
        <AnimatePresence>
          {showModalVitoria && (
            <Dialog open={showModalVitoria} onOpenChange={setShowModalVitoria}>
              <DialogContent className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0 max-w-md">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <Trophy className="w-24 h-24 mx-auto mb-4" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold mb-4"
                  >
                    🎉 JACKPOT! 🎉
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl mb-4"
                  >
                    Três personagens iguais!
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="bg-white/20 rounded-lg p-4 mb-6"
                  >
                    <p className="text-3xl font-bold">💰 R$ {valorGanho.toFixed(2)} 💰</p>
                  </motion.div>

                  <Button
                    onClick={() => setShowModalVitoria(false)}
                    className="bg-white text-orange-500 hover:bg-gray-100 font-bold px-8 py-3 text-lg"
                  >
                    Continuar Jogando
                  </Button>
                </motion.div>

                {/* Confetes animados */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      initial={{
                        x: Math.random() * 400,
                        y: -10,
                        opacity: 1,
                      }}
                      animate={{
                        y: 500,
                        opacity: 0,
                        rotate: 360,
                      }}
                      transition={{
                        duration: 2,
                        delay: Math.random() * 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
