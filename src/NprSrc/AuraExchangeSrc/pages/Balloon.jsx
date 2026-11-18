import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import '../components/BalloonC/Balloon.css'
import { gameSocket } from '../components/BalloonC/socket'
import { initBalloonSession } from '../components/BalloonC/api'
import {
  LOCATION_BACKGROUNDS,
  DEFAULT_PRESET_CHIPS,
} from '../components/BalloonC/gameConfig'
import { useGameAudio } from '../components/BalloonC/useGameAudio'
import CasinoHeader from '../components/Header/CasinoHeader'
import MobileBottomNavbar from '../components/Header/MobileBottomNavbar'
import {
  getUserData,
  getUserId,
  selectSiteHeaderColor,
} from '../../../utils/helper/commonSelectors'
import {
  updateAvailableBalance,
  updateExposureBalance,
} from '../../../redux/slices/userSlice'
import { displayAuthModal } from '../../../redux/slices/authModalSlice'
import { fetchuserdata } from '../../../api'
import MultiplierHistory from '../components/BalloonC/MultiplierHistory'
import BetsSidebar from '../components/BalloonC/BetsSidebar'
import GameStage from '../components/BalloonC/GameStage'
import ControlsPanel from '../components/BalloonC/ControlsPanel'
import RulesModal from '../components/BalloonC/RulesModal'
import CashoutToast from '../components/BalloonC/CashoutToast'
import BetPlacedToast from '../components/BalloonC/BetPlacedToast'

function normalizeHistoryList(rawHistory) {
  if (!Array.isArray(rawHistory)) return []
  return rawHistory
    .map((h) => {
      const val =
        typeof h === 'object' && h !== null
          ? h.multiplier ?? h.crashMultiplier ?? h.finalCrash
          : h
      const parsed = parseFloat(val)
      return Number.isFinite(parsed) ? parsed : 1.0
    })
    .filter((n) => Number.isFinite(n))
    .slice(0, 25)
}

function formatLiveBet(b) {
  const isWon = Boolean(
    b?.cashedOut || b?.win || b?.status === 'WON' || b?.status === 'CASHED_OUT'
  )
  const payoutNum = b?.payout != null ? Number(b.payout) : null
  const stakeRaw = b?.bet ?? b?.amountDisplay ?? b?.amount ?? 0
  const stakeNum = Number(stakeRaw)
  return {
    id: b?.id,
    user: b?.user || 'Player',
    avatar: b?.avatar || '🎈',
    avatarBg: b?.avatarBg || '#ff6600',
    win: isWon ? true : null,
    amount:
      isWon && payoutNum != null && !Number.isNaN(payoutNum)
        ? `+${payoutNum.toFixed(2)}`
        : Number.isFinite(stakeNum)
          ? stakeNum.toFixed(2)
          : String(stakeRaw),
  }
}

export default function Balloon() {
  const dispatch = useDispatch()
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn)
  const accountType = useSelector((state) => state?.account?.accountType) || ''
  const loggedInType = useSelector((state) => state?.user?.loggedInType) || ''
  const userData = useSelector(getUserData())
  const userId = useSelector(getUserId())
  const headerColor = useSelector(selectSiteHeaderColor())
  const [initialLoading, setInitialLoading] = useState(true)

  const isDemoUser =
    accountType === 'demo' ||
    loggedInType === 'demo' ||
    userId === 'Demo' ||
    userData?.userName === 'Democlient' ||
    Boolean(userData?.isDemo)

  const authToken = useSelector(
    (state) =>
      state?.user?.token ||
      state?.user?.accessToken ||
      state?.user?.authToken ||
      state?.user?.userData?.token ||
      state?.user?.userData?.accessToken ||
      state?.auth?.token ||
      state?.auth?.accessToken ||
      null
  )

  const userDataRef = useRef(userData)
  const isLoggedInRef = useRef(isLoggedIn)
  const isDemoUserRef = useRef(isDemoUser)
  useEffect(() => {
    userDataRef.current = userData
  }, [userData])
  useEffect(() => {
    isLoggedInRef.current = isLoggedIn
  }, [isLoggedIn])
  useEffect(() => {
    isDemoUserRef.current = isDemoUser
  }, [isDemoUser])

  // Sync / refresh real user wallet with server on mount & reconnect
  const refreshUserWallet = useCallback(async () => {
    if (!userId || isDemoUser) return null
    try {
      const res = await fetchuserdata(userId)
      if (res?.success && res?.data?.userdata) {
        const avail = Number(res.data.userdata.availableBalance ?? 0)
        const exp = Number(res.data.userdata.exposure ?? 0)
        userDataRef.current = {
          ...(userDataRef.current || {}),
          ...res.data.userdata,
          availableBalance: avail,
          exposure: exp,
        }
        dispatch(updateAvailableBalance(avail))
        dispatch(updateExposureBalance(exp))
        return res.data.userdata
      }
    } catch (err) {
      console.warn('[Balloon] Wallet refresh error:', err?.message || err)
    }
    return null
  }, [dispatch, userId, isDemoUser])

  useEffect(() => {
    refreshUserWallet()
  }, [refreshUserWallet])

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 3000)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Game states: 'WAITING' | 'FLYING' | 'FLYING_AWAY'
  const [gameState, setGameState] = useState('WAITING')
  const [countdown, setCountdown] = useState(null)
  const [currentLocationIdx, setCurrentLocationIdx] = useState(0)
  const currentLocationIdxRef = useRef(0)
  currentLocationIdxRef.current = currentLocationIdx
  const [multiplier, setMultiplier] = useState(1.0)
  const [liveBets, setLiveBets] = useState([])
  const [showBetsList, setShowBetsList] = useState(true)

  // Real-time Socket & Dual Bet states (2 independent slots)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)
  const [bet1, setBet1] = useState(null)
  const [bet2, setBet2] = useState(null)
  const [nextBet1, setNextBet1] = useState(null)
  const [nextBet2, setNextBet2] = useState(null)
  const isSocketActiveRef = useRef(false)

  // Request & Toast guards to prevent duplicate bet/cashout/toast calls
  const placingSlotsRef = useRef({ 1: false, 2: false })
  const cancellingSlotsRef = useRef({ 1: false, 2: false })
  const cashingOutBetIdsRef = useRef(new Set())
  const shownWinToastIdsRef = useRef(new Set())
  const seenStatementIdsRef = useRef(new Set())

  // Betting & Control states
  const [selectedBet, setSelectedBet] = useState(null)
  const [auto1, setAuto1] = useState(false)
  const [auto2, setAuto2] = useState(false)
  const [auto1Mult, setAuto1Mult] = useState(1.1)
  const [auto2Mult, setAuto2Mult] = useState(1.1)
  const [editingAuto, setEditingAuto] = useState(null) // 1 | 2 | null
  const [tempAutoInput, setTempAutoInput] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [flameBoost, setFlameBoost] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [cashoutToast, setCashoutToast] = useState(null)
  const toastTimeoutRef = useRef(null)
  const [betToast, setBetToast] = useState(null)
  const betToastTimeoutRef = useRef(null)

  const triggerBetToast = useCallback(
    (message = 'Casino BetPlace Successful.', type = 'success') => {
      if (betToastTimeoutRef.current) clearTimeout(betToastTimeoutRef.current)
      setBetToast({ message, type, id: Date.now() })
      betToastTimeoutRef.current = setTimeout(() => {
        setBetToast(null)
      }, 3200)
    },
    []
  )

  // Audio system hook
  const { isMuted, playSound, toggleMute } = useGameAudio()
  const playSoundRef = useRef(playSound)
  useEffect(() => {
    playSoundRef.current = playSound
  }, [playSound])

  const showCashoutToast = useCallback((mult, payout) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setCashoutToast({ type: 'win', mult, payout })
    toastTimeoutRef.current = setTimeout(() => {
      setCashoutToast(null)
    }, 4500)
  }, [])

  const showLossToast = useCallback((mult, amount) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setCashoutToast({ type: 'loss', mult, amount })
    toastTimeoutRef.current = setTimeout(() => {
      setCashoutToast(null)
    }, 4500)
  }, [])

  const airplaneSoundPlayedRef = useRef(false)

  // 60fps/120fps hardware-accelerated animation refs
  const gameStageRef = useRef(null)
  const locationBgRefs = useRef([])
  const cloudsRef = useRef(null)
  const airplaneRef = useRef(null)
  const starsRef = useRef(null)
  const darkeningRef = useRef(null)
  const scrollDistanceRef = useRef(0)
  const smoothScrollYRef = useRef(0)
  const flightStartPerfTimeRef = useRef(0)
  const currentMultRef = useRef(1.0)
  const multiplierRef = useRef(1.0)
  const multiplierDisplayRef = useRef(null)
  const bet1PayoutDisplayRef = useRef(null)
  const bet2PayoutDisplayRef = useRef(null)
  const lastReactUpdateRef = useRef(0)
  const bet1Ref = useRef(null)
  const bet2Ref = useRef(null)
  const nextBet1Ref = useRef(null)
  const nextBet2Ref = useRef(null)
  const gameStateRef = useRef('WAITING')
  const auto1Ref = useRef(false)
  const auto1MultRef = useRef(1.1)
  const auto2Ref = useRef(false)
  const auto2MultRef = useRef(1.1)
  const selectedBetRef = useRef(null)

  useEffect(() => {
    bet1Ref.current = bet1
  }, [bet1])
  useEffect(() => {
    bet2Ref.current = bet2
  }, [bet2])
  useEffect(() => {
    nextBet1Ref.current = nextBet1
  }, [nextBet1])
  useEffect(() => {
    nextBet2Ref.current = nextBet2
  }, [nextBet2])
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])
  useEffect(() => {
    auto1Ref.current = auto1
  }, [auto1])
  useEffect(() => {
    auto1MultRef.current = auto1Mult
  }, [auto1Mult])
  useEffect(() => {
    auto2Ref.current = auto2
  }, [auto2])
  useEffect(() => {
    auto2MultRef.current = auto2Mult
  }, [auto2Mult])
  useEffect(() => {
    selectedBetRef.current = selectedBet
  }, [selectedBet])

  const [historyMultipliers, setHistoryMultipliers] = useState([])
  const [presetChips, setPresetChips] = useState(DEFAULT_PRESET_CHIPS)
  const [isEditingPresets, setIsEditingPresets] = useState(false)

  const applyAuthoritativeWallet = useCallback(
    (payload) => {
      if (!payload || isDemoUserRef.current || !isLoggedInRef.current) return
      const next = { ...(userDataRef.current || {}) }
      let changed = false

      if (payload.exposure !== undefined && payload.exposure !== null) {
        const exp = Math.max(0, Number(payload.exposure) || 0)
        next.exposure = exp
        dispatch(updateExposureBalance(exp))
        changed = true
      }
      if (payload.availableBalance !== undefined && payload.availableBalance !== null) {
        const avail = Math.max(0, Number(payload.availableBalance) || 0)
        next.availableBalance = avail
        dispatch(updateAvailableBalance(avail))
        changed = true
      }

      if (changed) {
        userDataRef.current = next
      }
    },
    [dispatch]
  )

  // Continuous 60fps/120fps GPU render loop for fluid, zero-jitter background scroll
  useEffect(() => {
    let animId
    const renderLoop = () => {
      if (gameStateRef.current === 'FLYING' && isSocketActiveRef.current) {
        const now = performance.now()
        const elapsedSec = Math.max(
          0,
          (now - (flightStartPerfTimeRef.current || now)) / 1000
        )
        // Linear curve synchronized with backend Balloon GameEngine: 1.00 + (0.08 * t)
        const mult = 1.0 + 0.08 * elapsedSec
        const sY = (mult - 1.0) * 850
        smoothScrollYRef.current = sY
        currentMultRef.current = mult
        scrollDistanceRef.current = sY

        const activeBg = locationBgRefs.current[currentLocationIdxRef.current]
        if (activeBg) {
          activeBg.style.transform = `translate3d(0, ${sY}px, 0)`
        }

        if (cloudsRef.current) {
          const cloudOpacity = Math.max(0, 0.95 - (mult - 1.0) * 0.35)
          cloudsRef.current.style.transform = `translate3d(0, ${sY * 0.75}px, 0)`
          cloudsRef.current.style.opacity = cloudOpacity
        }

        if (starsRef.current) {
          if (mult >= 6.5) {
            const starsOpacity = Math.min(1.0, (mult - 6.5) / 0.5)
            starsRef.current.style.opacity = starsOpacity
            const stageW = gameStageRef.current?.clientWidth || 420
            const tileH = Math.round(576 * (stageW / 512))
            const starY = Math.round((sY * 0.35) % tileH)
            starsRef.current.style.backgroundPosition = `left ${starY}px`
          } else {
            starsRef.current.style.opacity = '0'
          }
        }

        if (darkeningRef.current) {
          if (mult >= 6.8) {
            const nightProgress = Math.min(1.0, (mult - 6.8) / 2.7)
            darkeningRef.current.style.opacity = nightProgress
          } else {
            darkeningRef.current.style.opacity = '0'
          }
        }

        if (airplaneRef.current) {
          if (mult >= 3.0 && mult <= 6.5) {
            if (!airplaneSoundPlayedRef.current) {
              airplaneSoundPlayedRef.current = true
              playSoundRef.current?.('airplane')
            }
            const planeProgress = (mult - 3.0) / (6.5 - 3.0)
            const stageW = gameStageRef.current?.clientWidth || 420
            const stageH = gameStageRef.current?.clientHeight || 680
            const startX = -120
            const startY = -60
            const endX = stageW + 80
            const endY = stageH + 60
            const planeX = startX + planeProgress * (endX - startX)
            const planeY = startY + planeProgress * (endY - startY)
            const opacity =
              planeProgress > 0.88
                ? Math.max(0, (1.0 - planeProgress) / 0.12)
                : 1.0
            airplaneRef.current.style.transform = `translate3d(${planeX}px, ${planeY}px, 0)`
            airplaneRef.current.style.opacity = opacity
            airplaneRef.current.style.display = 'block'
          } else {
            airplaneRef.current.style.display = 'none'
          }
        }

        if (multiplierDisplayRef.current) {
          multiplierDisplayRef.current.textContent = `${mult.toFixed(2)}x`
        }

        if (
          bet1PayoutDisplayRef.current &&
          bet1Ref.current &&
          bet1Ref.current.win === null
        ) {
          bet1PayoutDisplayRef.current.textContent = (
            parseFloat(bet1Ref.current.amount) * mult
          ).toFixed(2)
        }
        if (
          bet2PayoutDisplayRef.current &&
          bet2Ref.current &&
          bet2Ref.current.win === null
        ) {
          bet2PayoutDisplayRef.current.textContent = (
            parseFloat(bet2Ref.current.amount) * mult
          ).toFixed(2)
        }
      }
      animId = requestAnimationFrame(renderLoop)
    }

    animId = requestAnimationFrame(renderLoop)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Authoritative Bet Actions via Socket.IO (/balloon namespace)
  const handlePlaceBet = useCallback(
    async (slot = 1, overrideAmount) => {
      if (!isSocketActiveRef.current) {
        triggerBetToast('Server Not Connected! Cannot place bet.', 'error')
        return
      }
      if (!isLoggedInRef.current) {
        dispatch(displayAuthModal('login'))
        triggerBetToast('Please log in to place a bet.', 'error')
        return
      }
      if (isDemoUserRef.current) {
        triggerBetToast('You have insufficient balance.', 'error')
        return
      }
      if (placingSlotsRef.current[slot]) return

      const betVal = overrideAmount || selectedBetRef.current || 100
      const numBetVal = parseFloat(betVal)
      if (!Number.isFinite(numBetVal) || numBetVal <= 0) {
        triggerBetToast('Please select a valid stake.', 'error')
        return
      }

      const currentSpendable = Math.max(
        0,
        Number(
          (
            (userDataRef.current?.availableBalance ?? 0) -
            (userDataRef.current?.exposure ?? 0)
          ).toFixed(2)
        )
      )
      if (currentSpendable < numBetVal) {
        triggerBetToast('Insufficient balance.', 'error')
        return
      }

      const activeAutoTarget =
        slot === 1
          ? auto1Ref.current
            ? auto1MultRef.current
            : null
          : auto2Ref.current
            ? auto2MultRef.current
            : null

      placingSlotsRef.current[slot] = true
      try {
        const res = await gameSocket.placeBet({
          amount: numBetVal,
          slot,
          autoCashout: activeAutoTarget,
        })
        if (!res?.success || !res?.data) {
          throw new Error(res?.message || res?.code || 'Bet rejected by server.')
        }

        const data = res.data
        const queued = Boolean(data.isQueuedNext || data.status === 'QUEUED_NEXT')
        const serverBet = {
          id: data.betId,
          slot,
          user: 'You',
          amount: Number(data.amountDisplay ?? numBetVal).toFixed(2),
          avatar: '🎈',
          avatarBg: '#ff6600',
          cashoutAt: activeAutoTarget,
          win: null,
          payout: null,
          isQueued: queued,
        }

        if (queued) {
          if (slot === 1) {
            setNextBet1(serverBet)
            nextBet1Ref.current = serverBet
          } else {
            setNextBet2(serverBet)
            nextBet2Ref.current = serverBet
          }
        } else {
          if (slot === 1) {
            setBet1(serverBet)
            bet1Ref.current = serverBet
          } else {
            setBet2(serverBet)
            bet2Ref.current = serverBet
          }
        }

        applyAuthoritativeWallet(data)
        triggerBetToast('Casino BetPlace Successful.')
      } catch (err) {
        triggerBetToast(err?.message || 'Unable to place bet.', 'error')
      } finally {
        placingSlotsRef.current[slot] = false
      }
    },
    [applyAuthoritativeWallet, dispatch, triggerBetToast]
  )

  const handlePlaceBetRef = useRef(handlePlaceBet)
  useEffect(() => {
    handlePlaceBetRef.current = handlePlaceBet
  }, [handlePlaceBet])

  const handleCancelBet = useCallback(
    async (slot = 1) => {
      if (!isSocketActiveRef.current) {
        triggerBetToast('Server Not Connected! Cannot cancel bet.', 'error')
        return
      }
      if (cancellingSlotsRef.current[slot]) return

      const queuedBet = slot === 1 ? nextBet1Ref.current : nextBet2Ref.current
      const activeBet = slot === 1 ? bet1Ref.current : bet2Ref.current
      const targetBet =
        queuedBet || (gameStateRef.current === 'WAITING' ? activeBet : null)
      if (!targetBet?.id) return

      cancellingSlotsRef.current[slot] = true
      try {
        const res = await gameSocket.cancelBet(targetBet.id)
        if (!res?.success) {
          throw new Error(res?.message || res?.code || 'Unable to cancel bet.')
        }

        if (queuedBet && queuedBet.id === targetBet.id) {
          if (slot === 1) {
            setNextBet1(null)
            nextBet1Ref.current = null
          } else {
            setNextBet2(null)
            nextBet2Ref.current = null
          }
        }
        if (activeBet && activeBet.id === targetBet.id) {
          if (slot === 1) {
            setBet1(null)
            bet1Ref.current = null
          } else {
            setBet2(null)
            bet2Ref.current = null
          }
        }

        if (res.data) applyAuthoritativeWallet(res.data)
      } catch (err) {
        triggerBetToast(err?.message || 'Unable to cancel bet.', 'error')
      } finally {
        cancellingSlotsRef.current[slot] = false
      }
    },
    [applyAuthoritativeWallet, triggerBetToast]
  )

  const handleCashout = useCallback(
    async (slot = 1) => {
      if (!isSocketActiveRef.current) return
      if (gameStateRef.current !== 'FLYING') return
      const currentBet = slot === 1 ? bet1Ref.current : bet2Ref.current
      if (!currentBet?.id || currentBet.win !== null) return
      if (cashingOutBetIdsRef.current.has(currentBet.id)) return

      cashingOutBetIdsRef.current.add(currentBet.id)
      try {
        const res = await gameSocket.cashOut(currentBet.id)
        if (!res?.success) {
          cashingOutBetIdsRef.current.delete(currentBet.id)
          if (res?.code && res.code !== 'BET_ALREADY_SETTLED') {
            triggerBetToast(res.message || 'Cashout failed.', 'error')
          }
        }
        // Authoritative payout & balance updates arrive via bet:updated / wallet:updated / wallet:statement
      } catch (err) {
        cashingOutBetIdsRef.current.delete(currentBet.id)
        triggerBetToast(err?.message || 'Cashout failed.', 'error')
      }
    },
    [triggerBetToast]
  )

  const handleCashoutRef = useRef(handleCashout)
  useEffect(() => {
    handleCashoutRef.current = handleCashout
  }, [handleCashout])

  // Round End / Balloon Flies Up Off Top ('FLYING_AWAY') triggered exclusively by server round:crashed
  const triggerFlyAway = useCallback(
    (finalMult) => {
      playSoundRef.current?.('flyaway')
      gameStateRef.current = 'FLYING_AWAY'
      setGameState('FLYING_AWAY')
      setMultiplier(finalMult)
      multiplierRef.current = finalMult
      if (multiplierDisplayRef.current) {
        multiplierDisplayRef.current.textContent = `${finalMult.toFixed(2)}x`
      }

      let lostTotal = 0
      if (bet1Ref.current && bet1Ref.current.win === null) {
        lostTotal += parseFloat(bet1Ref.current.amount) || 0
        const lost1 = { ...bet1Ref.current, win: false }
        bet1Ref.current = lost1
        setBet1(lost1)
      }
      if (bet2Ref.current && bet2Ref.current.win === null) {
        lostTotal += parseFloat(bet2Ref.current.amount) || 0
        const lost2 = { ...bet2Ref.current, win: false }
        bet2Ref.current = lost2
        setBet2(lost2)
      }

      if (lostTotal > 0) {
        showLossToast(finalMult.toFixed(2), lostTotal.toFixed(2))
      }

      if (airplaneRef.current) {
        const el = airplaneRef.current
        el.style.transition = 'opacity 0.35s ease'
        el.style.opacity = '0'
        setTimeout(() => {
          if (el) {
            el.style.display = 'none'
            el.style.opacity = '1'
          }
        }, 350)
      }
    },
    [showLossToast]
  )

  // =============================================================================
  // SOCKET.IO CONNECTION & REAL-TIME BALLOON ENGINE SYNC
  // =============================================================================
  useEffect(() => {
    let isMounted = true

    const resetVisualStage = () => {
      scrollDistanceRef.current = 0
      smoothScrollYRef.current = 0
      currentMultRef.current = 1.0
      multiplierRef.current = 1.0
      flightStartPerfTimeRef.current = 0
      airplaneSoundPlayedRef.current = false

      locationBgRefs.current.forEach((el) => {
        if (el) {
          el.style.transform = 'translate3d(0, 0, 0)'
        }
      })
      if (cloudsRef.current) {
        cloudsRef.current.style.transform = 'translate3d(0, 0, 0)'
        cloudsRef.current.style.opacity = '0.85'
      }
      if (starsRef.current) {
        starsRef.current.style.opacity = '0'
        starsRef.current.style.backgroundPosition = 'left 0px'
      }
      if (darkeningRef.current) {
        darkeningRef.current.style.opacity = '0'
      }
      if (airplaneRef.current) {
        airplaneRef.current.style.display = 'none'
      }
    }

    let initialGracePassed = false
    const initialBannerTimer = setTimeout(() => {
      initialGracePassed = true
      if (isMounted && !isSocketActiveRef.current) {
        setShowOfflineBanner(true)
      }
    }, 3000)

    const unsubs = [
      gameSocket.on('connection_status', ({ connected, error }) => {
        if (!isMounted) return
        setIsSocketConnected(connected)
        isSocketActiveRef.current = connected
        if (connected) {
          setShowOfflineBanner(false)
        } else {
          if (initialGracePassed || error) {
            setShowOfflineBanner(true)
          }
          gameStateRef.current = 'WAITING'
          setGameState('WAITING')
          setMultiplier(1.0)
          multiplierRef.current = 1.0
          resetVisualStage()
          setCountdown(null)
        }
      }),

      gameSocket.on('game:snapshot', (snap) => {
        if (!isMounted || !snap) return
        setIsSocketConnected(true)
        setShowOfflineBanner(false)
        isSocketActiveRef.current = true

        if (typeof snap.locationIdx === 'number') {
          setCurrentLocationIdx(snap.locationIdx)
        }

        const rawMult = parseFloat(snap.multiplier)
        const parsedMult = Number.isFinite(rawMult) ? rawMult : 1.0
        setMultiplier(parsedMult)
        multiplierRef.current = parsedMult
        currentMultRef.current = parsedMult

        if (snap.gameState === 'RUNNING') {
          gameStateRef.current = 'FLYING'
          setGameState('FLYING')
          const serverElapsedMs = Math.max(0, (parsedMult - 1.0) / 0.08) * 1000
          flightStartPerfTimeRef.current = performance.now() - serverElapsedMs
        } else if (snap.gameState === 'CRASHED') {
          gameStateRef.current = 'FLYING_AWAY'
          setGameState('FLYING_AWAY')
        } else {
          resetVisualStage()
          gameStateRef.current = 'WAITING'
          setGameState('WAITING')
          if (snap.waitingCountdown !== undefined && snap.waitingCountdown !== null) {
            setCountdown(Math.ceil(Number(snap.waitingCountdown)) || 0)
          }
        }

        if (Array.isArray(snap.history)) {
          setHistoryMultipliers(normalizeHistoryList(snap.history))
        }
        if (Array.isArray(snap.allBets)) {
          setLiveBets(snap.allBets.map(formatLiveBet))
        }

        const restoreSlot = (serverBet, slot) => {
          if (!serverBet) {
            if (slot === 1) {
              setBet1(null)
              bet1Ref.current = null
              setNextBet1(null)
              nextBet1Ref.current = null
            } else {
              setBet2(null)
              bet2Ref.current = null
              setNextBet2(null)
              nextBet2Ref.current = null
            }
            return
          }
          const amt = Number(serverBet.amount ? serverBet.amount / 100 : 0).toFixed(2)
          const cashoutAt = serverBet.autoCashout ? serverBet.autoCashout / 100 : null
          const isWon = serverBet.status === 'WON' || serverBet.status === 'CASHED_OUT'
          const isQueued = serverBet.status === 'QUEUED_NEXT'
          const restored = {
            id: serverBet.id,
            slot,
            user: 'You',
            amount: amt,
            avatar: '🎈',
            avatarBg: '#ff6600',
            cashoutAt,
            win: isWon ? true : serverBet.status === 'LOST' ? false : null,
            payout: isWon && serverBet.payout ? (serverBet.payout / 100).toFixed(2) : null,
            isQueued,
          }
          if (isQueued) {
            if (slot === 1) {
              setNextBet1(restored)
              nextBet1Ref.current = restored
              setBet1(null)
              bet1Ref.current = null
            } else {
              setNextBet2(restored)
              nextBet2Ref.current = restored
              setBet2(null)
              bet2Ref.current = null
            }
          } else {
            if (slot === 1) {
              setBet1(restored)
              bet1Ref.current = restored
              setNextBet1(null)
              nextBet1Ref.current = null
            } else {
              setBet2(restored)
              bet2Ref.current = restored
              setNextBet2(null)
              nextBet2Ref.current = null
            }
          }
        }

        restoreSlot(snap.activeBets?.slot1, 1)
        restoreSlot(snap.activeBets?.slot2, 2)

        if (snap.wallet) {
          applyAuthoritativeWallet(snap.wallet)
        }
      }),

      gameSocket.on('round:waiting', (payload) => {
        if (!isMounted || !payload) return
        resetVisualStage()
        gameStateRef.current = 'WAITING'
        setGameState('WAITING')
        setCountdown(Math.ceil(Number(payload.countdown) || 8))
        setMultiplier(1.0)

        if (typeof payload.locationIdx === 'number') {
          setCurrentLocationIdx(payload.locationIdx)
        } else {
          setCurrentLocationIdx((prev) => (prev + 1) % LOCATION_BACKGROUNDS.length)
        }

        if (Array.isArray(payload.history)) {
          setHistoryMultipliers(normalizeHistoryList(payload.history))
        }

        const queued1 = nextBet1Ref.current
        const queued2 = nextBet2Ref.current

        if (queued1) {
          const active1 = { ...queued1, isQueued: false }
          setBet1(active1)
          bet1Ref.current = active1
        } else {
          setBet1(null)
          bet1Ref.current = null
        }

        if (queued2) {
          const active2 = { ...queued2, isQueued: false }
          setBet2(active2)
          bet2Ref.current = active2
        } else {
          setBet2(null)
          bet2Ref.current = null
        }

        setNextBet1(null)
        setNextBet2(null)
        nextBet1Ref.current = null
        nextBet2Ref.current = null

        cashingOutBetIdsRef.current.clear()
      }),

      gameSocket.on('round:countdown', (payload) => {
        if (!isMounted || !payload) return
        gameStateRef.current = 'WAITING'
        setGameState('WAITING')
        if (typeof payload.locationIdx === 'number') {
          setCurrentLocationIdx(payload.locationIdx)
        }
        const val = Number(payload.countdown)
        if (Number.isFinite(val)) {
          setCountdown(Math.ceil(val))
        }
      }),

      gameSocket.on('round:started', (payload) => {
        if (!isMounted) return
        playSoundRef.current?.('start')
        gameStateRef.current = 'FLYING'
        setGameState('FLYING')
        setMultiplier(1.0)
        multiplierRef.current = 1.0
        currentMultRef.current = 1.0
        scrollDistanceRef.current = 0
        smoothScrollYRef.current = 0
        flightStartPerfTimeRef.current = performance.now()
        airplaneSoundPlayedRef.current = false
        if (typeof payload?.locationIdx === 'number') {
          setCurrentLocationIdx(payload.locationIdx)
        }
        if (starsRef.current) {
          starsRef.current.style.opacity = '0'
          starsRef.current.style.backgroundPosition = 'left 0px'
        }
      }),

      gameSocket.on('round:tick', (payload) => {
        if (!isMounted || !payload) return
        const nextMult = parseFloat(payload.multiplier)
        if (!Number.isFinite(nextMult)) return
        multiplierRef.current = nextMult

        const serverElapsedMs = Math.max(0, (nextMult - 1.0) / 0.08) * 1000
        const expectedPerfStart = performance.now() - serverElapsedMs
        if (!flightStartPerfTimeRef.current) {
          flightStartPerfTimeRef.current = expectedPerfStart
        } else {
          flightStartPerfTimeRef.current +=
            (expectedPerfStart - flightStartPerfTimeRef.current) * 0.15
        }

        const now = Date.now()
        if (now - lastReactUpdateRef.current >= 100) {
          lastReactUpdateRef.current = now
          setMultiplier(nextMult)
        }

        // Client fallback auto-take (deduped via cashingOutBetIdsRef if server auto-cashout didn't trigger yet)
        if (
          auto1Ref.current &&
          bet1Ref.current &&
          bet1Ref.current.win === null &&
          nextMult >= auto1MultRef.current
        ) {
          handleCashoutRef.current?.(1)
        }

        if (
          auto2Ref.current &&
          bet2Ref.current &&
          bet2Ref.current.win === null &&
          nextMult >= auto2MultRef.current
        ) {
          handleCashoutRef.current?.(2)
        }
      }),

      gameSocket.on('round:crashed', (payload) => {
        if (!isMounted || !payload) return
        const rawCrash = payload.finalCrash ?? payload.crashMultiplier
        const finalMult = parseFloat(rawCrash) || multiplierRef.current || 1.0
        triggerFlyAway(finalMult)
        if (Array.isArray(payload.history)) {
          setHistoryMultipliers(normalizeHistoryList(payload.history))
        }
      }),

      gameSocket.on('bets:clear', () => {
        if (!isMounted) return
        setLiveBets([])
      }),

      gameSocket.on('bets:all', (payload) => {
        if (!isMounted || !Array.isArray(payload?.bets)) return
        setLiveBets(payload.bets.map(formatLiveBet))
      }),

      gameSocket.on('bets:new', (newBet) => {
        if (!isMounted || !newBet) return
        const formatted = formatLiveBet(newBet)
        setLiveBets((prev) => [
          formatted,
          ...prev.filter((b) => b.id !== formatted.id),
        ])
      }),

      gameSocket.on('bets:settled', (settled) => {
        if (!isMounted || !settled) return
        setLiveBets((prev) =>
          prev.map((b) => {
            if (b.id !== settled.id) return b
            const isWin = Boolean(settled.cashedOut)
            const payoutNum =
              settled.payout != null ? Number(settled.payout) : null
            return {
              ...b,
              win: isWin ? true : null,
              amount:
                isWin && payoutNum != null && !Number.isNaN(payoutNum)
                  ? `+${payoutNum.toFixed(2)}`
                  : b.amount,
            }
          })
        )
      }),

      gameSocket.on('bets:cancelled', (payload) => {
        if (!isMounted || !payload) return
        const targetId = payload.betId || payload.id
        if (!targetId) return
        setLiveBets((prev) => prev.filter((b) => b.id !== targetId))
      }),

      gameSocket.on('bet:accepted', (bet) => {
        if (!isMounted || !bet) return
        applyAuthoritativeWallet(bet)
        const slot = Number(bet.slot) === 2 ? 2 : 1
        const isQueued = Boolean(bet.isQueuedNext || bet.status === 'QUEUED_NEXT')
        const acceptedObj = {
          id: bet.betId,
          slot,
          user: 'You',
          amount: Number(bet.amountDisplay || 0).toFixed(2),
          avatar: '🎈',
          avatarBg: '#ff6600',
          cashoutAt:
            slot === 1
              ? auto1Ref.current
                ? auto1MultRef.current
                : null
              : auto2Ref.current
                ? auto2MultRef.current
                : null,
          win: null,
          payout: null,
          isQueued,
        }

        if (isQueued) {
          if (slot === 1) {
            setNextBet1(acceptedObj)
            nextBet1Ref.current = acceptedObj
          } else {
            setNextBet2(acceptedObj)
            nextBet2Ref.current = acceptedObj
          }
        } else {
          if (slot === 1) {
            setBet1(acceptedObj)
            bet1Ref.current = acceptedObj
            if (nextBet1Ref.current?.id === bet.betId) {
              setNextBet1(null)
              nextBet1Ref.current = null
            }
          } else {
            setBet2(acceptedObj)
            bet2Ref.current = acceptedObj
            if (nextBet2Ref.current?.id === bet.betId) {
              setNextBet2(null)
              nextBet2Ref.current = null
            }
          }
        }
      }),

      gameSocket.on('bet:updated', (bet) => {
        if (!isMounted || !bet) return
        applyAuthoritativeWallet(bet)
        if (bet.betId) {
          cashingOutBetIdsRef.current.delete(bet.betId)
        }

        const slot =
          Number(bet.slot) === 2 ||
          bet2Ref.current?.id === bet.betId ||
          nextBet2Ref.current?.id === bet.betId
            ? 2
            : 1

        if (bet.status === 'WON' || bet.status === 'CASHED_OUT') {
          const payoutNum = parseFloat(bet.payoutDisplay) || 0
          const multNum =
            parseFloat(bet.multiplierDisplay) || multiplierRef.current || 1.0

          if (slot === 1) {
            setBet1((prev) => {
              const updated = prev
                ? { ...prev, win: true, payout: payoutNum.toFixed(2) }
                : null
              bet1Ref.current = updated
              return updated
            })
          } else {
            setBet2((prev) => {
              const updated = prev
                ? { ...prev, win: true, payout: payoutNum.toFixed(2) }
                : null
              bet2Ref.current = updated
              return updated
            })
          }

          if (!shownWinToastIdsRef.current.has(bet.betId)) {
            shownWinToastIdsRef.current.add(bet.betId)
            if (shownWinToastIdsRef.current.size > 100) {
              const first = shownWinToastIdsRef.current.values().next().value
              shownWinToastIdsRef.current.delete(first)
            }
            playSoundRef.current?.('start')
            showCashoutToast(multNum.toFixed(2), payoutNum.toFixed(2))
          }
        } else if (bet.status === 'LOST') {
          if (slot === 1) {
            setBet1((prev) => {
              const updated = prev ? { ...prev, win: false } : null
              bet1Ref.current = updated
              return updated
            })
          } else {
            setBet2((prev) => {
              const updated = prev ? { ...prev, win: false } : null
              bet2Ref.current = updated
              return updated
            })
          }
        } else if (bet.status === 'CANCELLED' || bet.status === 'VOID') {
          if (nextBet1Ref.current?.id === bet.betId) {
            setNextBet1(null)
            nextBet1Ref.current = null
          }
          if (nextBet2Ref.current?.id === bet.betId) {
            setNextBet2(null)
            nextBet2Ref.current = null
          }
          if (bet1Ref.current?.id === bet.betId) {
            setBet1(null)
            bet1Ref.current = null
          }
          if (bet2Ref.current?.id === bet.betId) {
            setBet2(null)
            bet2Ref.current = null
          }
        }
      }),

      gameSocket.on('bet:rejected', (payload) => {
        if (!isMounted || !payload) return
        triggerBetToast(payload.message || 'Bet was rejected.', 'error')
      }),

      gameSocket.on('wallet:updated', (payload) => {
        if (!isMounted || !payload) return
        applyAuthoritativeWallet(payload)
      }),

      gameSocket.on('wallet:statement', (statement) => {
        if (!isMounted || !statement) return
        const stmtKey =
          statement.statementId ||
          `${statement.type}:${statement.betId}:${statement.action}:${statement.timestamp}`
        if (seenStatementIdsRef.current.has(stmtKey)) return
        seenStatementIdsRef.current.add(stmtKey)
        if (seenStatementIdsRef.current.size > 200) {
          const oldest = seenStatementIdsRef.current.values().next().value
          seenStatementIdsRef.current.delete(oldest)
        }
        applyAuthoritativeWallet(statement)
      }),
    ]

    async function connectBalloonBackend() {
      // Connect immediately so live game state/history appears without waiting on HTTP handshake
      gameSocket.connect('demo_session')

      const session = await initBalloonSession({
        isLoggedIn,
        isDemoUser,
        authToken: authToken || userDataRef.current?.token || userDataRef.current?.accessToken,
      })
      if (!isMounted) return

      const tokenToUse = session?.sessionToken || 'demo_session'
      if (tokenToUse !== 'demo_session') {
        gameSocket.connect(tokenToUse)
      }
      if (!isDemoUser && isLoggedIn) {
        refreshUserWallet()
      }
    }

    connectBalloonBackend()

    return () => {
      isMounted = false
      clearTimeout(initialBannerTimer)
      isSocketActiveRef.current = false
      unsubs.forEach((unsub) => unsub())
      gameSocket.disconnect()
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      if (betToastTimeoutRef.current) clearTimeout(betToastTimeoutRef.current)
    }
  }, [
    isLoggedIn,
    userId,
    authToken,
    isDemoUser,
    refreshUserWallet,
    applyAuthoritativeWallet,
    triggerFlyAway,
    showCashoutToast,
    triggerBetToast,
  ])

  const handleHeat = async (slot = 1) => {
    if (!isSocketActiveRef.current) {
      triggerBetToast('Server Not Connected! Cannot place bet.', 'error')
      return
    }
    setFlameBoost(true)

    const isSlotBetPlaced = slot === 1 ? !!bet1Ref.current : !!bet2Ref.current
    const isSlotQueued =
      slot === 1 ? !!nextBet1Ref.current : !!nextBet2Ref.current

    if (gameStateRef.current === 'WAITING' && !isSlotBetPlaced) {
      const amountToBet = selectedBetRef.current || 100
      if (!selectedBetRef.current) setSelectedBet(amountToBet)
      await handlePlaceBet(slot, amountToBet)
    } else if (
      (gameStateRef.current === 'FLYING' ||
        gameStateRef.current === 'FLYING_AWAY') &&
      (!isSlotBetPlaced ||
        (slot === 1
          ? bet1Ref.current?.win !== null
          : bet2Ref.current?.win !== null)) &&
      !isSlotQueued
    ) {
      const amountToBet = selectedBetRef.current || 100
      if (!selectedBetRef.current) setSelectedBet(amountToBet)
      await handlePlaceBet(slot, amountToBet)
    } else {
      gameSocket.sendHeat()
    }

    setTimeout(() => setFlameBoost(false), 600)
  }

  const handleSelectBet = (val) => {
    setSelectedBet((prev) => (prev === val ? null : val))
  }

  const handleClear = () => {
    if (nextBet1Ref.current) handleCancelBet(1)
    if (nextBet2Ref.current) handleCancelBet(2)
    if (gameStateRef.current === 'WAITING') {
      if (bet1Ref.current) handleCancelBet(1)
      if (bet2Ref.current) handleCancelBet(2)
    }
    setSelectedBet(null)
  }

  const handleMin = () => {
    const minVal = presetChips[0] || 10
    setSelectedBet((prev) => (prev === minVal ? null : minVal))
  }

  const handleMax = () => {
    const maxVal = presetChips[presetChips.length - 1] || 10000
    setSelectedBet((prev) => (prev === maxVal ? null : maxVal))
  }

  const handleToggleEdits = () => {
    if (isEditingPresets) {
      const defaultPresets = DEFAULT_PRESET_CHIPS
      const cleanPresets = presetChips.map((val, i) => {
        const num = parseInt(val, 10)
        return isNaN(num) || num <= 0 ? defaultPresets[i] : num
      })
      setPresetChips(cleanPresets)
      setIsEditingPresets(false)
      if (selectedBet && !cleanPresets.includes(selectedBet)) {
        setSelectedBet(null)
      }
    } else {
      setIsEditingPresets(true)
    }
  }

  const handleStartEditAuto = (slot) => {
    const current = slot === 1 ? auto1Mult : auto2Mult
    setEditingAuto(slot)
    setTempAutoInput(current.toFixed(2))
  }

  const handleSaveAutoMult = (slot) => {
    const parsed = parseFloat(tempAutoInput)
    if (!isNaN(parsed) && parsed >= 1.01 && parsed <= 1000) {
      if (slot === 1) setAuto1Mult(parsed)
      else setAuto2Mult(parsed)
    }
    setEditingAuto(null)
  }

  const timerDuration = 8
  const circumference = 2 * Math.PI * 27
  const strokeOffset =
    circumference * (1 - Math.min(countdown ?? 0, timerDuration) / timerDuration)

  const getCountdownColor = (val) => {
    if (val >= 6) return '#a3e635' // Vibrant lime green (8, 7, 6)
    if (val === 5) return '#feff00' // Bright pure yellow (5)
    if (val === 4) return '#ff9500' // Warm vibrant amber/orange (4)
    if (val === 3) return '#fb8500' // Vibrant orange (3)
    return '#ff3b30' // Bright red/coral (2, 1)
  }

  return (
    <div className="balloon-root w-full h-screen h-[100dvh] bg-black flex flex-col justify-between overflow-hidden">
      {/* Exact Universe Casino Full Screen Loader matching Vimaan */}
      {initialLoading && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black w-screen h-screen">
          <img
            src="/casino/universe.gif"
            alt="universe"
            className="h-[220px] w-[220px] object-contain"
          />
        </div>
      )}

      {/* Aura Original Casino Header (Fixed Top) */}
      <div className="w-full fixed top-0 left-0 right-0 z-40 bg-[#0e0e0e]">
        <CasinoHeader headerColor={headerColor} />
      </div>

      {/* Main Game Container between 56px header and 56px footer with slim side & bottom padding */}
      <div className="w-full flex-1 pt-[57px] pb-[59px] px-[5px] flex items-center justify-center overflow-hidden box-border">
        <main className="game-viewport relative w-full max-w-[480px] h-full max-h-[850px] mx-auto overflow-hidden flex flex-col justify-between bg-[#0d1e21] shadow-2xl select-none rounded-[18px]">
          {/* ================= Unified Game Stage ================= */}
          <section ref={gameStageRef} className="game-stage">
            {/* ================= Multipliers History Bar Component ================= */}
            <MultiplierHistory
              historyMultipliers={historyMultipliers}
              showHistory={showHistory}
              onToggleHistory={() => setShowHistory(!showHistory)}
            />

            {/* ================= Persistent Server Offline Alert Banner ================= */}
            {!isSocketConnected && showOfflineBanner && (
              <div className="server-offline-banner" id="server-offline-banner">
                <div className="server-offline-pulse" />
                <span>Server Not Connected • Connecting...</span>
              </div>
            )}

            {/* ================= Bet Placed Toast Notification (Authentic Toastr) ================= */}
            <BetPlacedToast
              toast={betToast}
              onClose={() => setBetToast(null)}
            />

            {/* ================= Cashout / Loss Toast Component ================= */}
            <CashoutToast
              cashoutToast={cashoutToast}
              onClose={() => setCashoutToast(null)}
            />

            {/* ================= Bets Feed & Sound Sidebar Component ================= */}
            <BetsSidebar
              showBetsList={showBetsList}
              onToggleBetsList={() => setShowBetsList(!showBetsList)}
              liveBets={liveBets}
              gameState={gameState}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />

            {/* ================= Stage Visuals: Sky, Clouds, Stars, Airplane, Balloon ================= */}
            <GameStage
              locationBgRefs={locationBgRefs}
              currentLocationIdx={currentLocationIdx}
              darkeningRef={darkeningRef}
              starsRef={starsRef}
              cloudsRef={cloudsRef}
              airplaneRef={airplaneRef}
              multiplierDisplayRef={multiplierDisplayRef}
              gameState={gameState}
              flameBoost={flameBoost}
              countdown={countdown}
              multiplier={multiplier}
              getCountdownColor={getCountdownColor}
              circumference={circumference}
              strokeOffset={strokeOffset}
            />

            {/* ================= Bottom Controls & Dual Betting Panel Component ================= */}
            <ControlsPanel
              auto1={auto1}
              setAuto1={setAuto1}
              auto2={auto2}
              setAuto2={setAuto2}
              auto1Mult={auto1Mult}
              auto2Mult={auto2Mult}
              editingAuto={editingAuto}
              tempAutoInput={tempAutoInput}
              setTempAutoInput={setTempAutoInput}
              handleStartEditAuto={handleStartEditAuto}
              handleSaveAutoMult={handleSaveAutoMult}
              setEditingAuto={setEditingAuto}
              presetChips={presetChips}
              setPresetChips={setPresetChips}
              isEditingPresets={isEditingPresets}
              handleToggleEdits={handleToggleEdits}
              selectedBet={selectedBet}
              handleSelectBet={handleSelectBet}
              handleClear={handleClear}
              handleMin={handleMin}
              handleMax={handleMax}
              gameState={gameState}
              bet1={bet1}
              bet2={bet2}
              nextBet1={nextBet1}
              nextBet2={nextBet2}
              multiplier={multiplier}
              bet1PayoutDisplayRef={bet1PayoutDisplayRef}
              bet2PayoutDisplayRef={bet2PayoutDisplayRef}
              handleCancelBet={handleCancelBet}
              handleCashout={handleCashout}
              handleHeat={handleHeat}
            />
          </section>

          {/* ================= Rules Modal Dialog Component ================= */}
          <RulesModal
            showRules={showRules}
            onClose={() => setShowRules(false)}
          />
        </main>
      </div>

      {/* Aura Original Fixed Bottom Footer */}
      <div className="w-full fixed bottom-0 left-0 right-0 z-50">
        <MobileBottomNavbar />
      </div>
    </div>
  )
}
