import { useState, useEffect, useRef, useCallback } from 'react'

export function useGameAudio() {
  const [isMuted, setIsMuted] = useState(true)
  const bgMusicRef = useRef(null)
  const activeSfxRef = useRef([])

  // Continuous background music controller (balloon_bg_music.mp3)
  useEffect(() => {
    const bgAudio = new Audio('/sounds/balloon_bg_music.mp3')
    bgAudio.loop = true
    bgAudio.volume = 0.45
    bgMusicRef.current = bgAudio

    return () => {
      bgAudio.pause()
      bgAudio.src = ''
    }
  }, [])

  // Immediately mute background music AND all currently active sounds when muted
  useEffect(() => {
    if (isMuted) {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
      }
      activeSfxRef.current.forEach((audio) => {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch {}
      })
      activeSfxRef.current = []
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.play().catch(() => {})
      }
    }
  }, [isMuted])

  const playSound = useCallback((type) => {
    if (isMuted) return

    let soundSrc = ''
    let volume = 0.8

    if (type === 'start' || type === 'heat') {
      soundSrc = '/sounds/balloon_heat.mp3'
      volume = 0.8
    } else if (type === 'airplane' || type === 'fly') {
      soundSrc = '/sounds/balloon_fly.mp3'
      volume = 0.8
    } else if (type === 'blast' || type === 'flyaway') {
      soundSrc = '/sounds/balloon_blast.mp3'
      volume = 0.8
    } else if (type === 'cashout' || type === 'win') {
      soundSrc = '/sounds/win.mp3'
      volume = 0.9
    }

    if (soundSrc) {
      const audio = new Audio(soundSrc)
      audio.volume = volume
      activeSfxRef.current.push(audio)

      audio.onended = () => {
        activeSfxRef.current = activeSfxRef.current.filter((a) => a !== audio)
      }

      audio.play().catch(() => {})
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  return { isMuted, playSound, toggleMute }
}

