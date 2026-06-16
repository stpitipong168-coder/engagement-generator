'use client'

import { useEffect, useRef } from 'react'

export function HeroBg({ children }: { children?: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function fadeLoop() {
      if (!video) return
      const { currentTime, duration } = video
      if (!duration) return

      const fadeIn = 0.5
      const fadeOut = 0.5

      if (currentTime < fadeIn) {
        video.style.opacity = String(currentTime / fadeIn)
      } else if (currentTime > duration - fadeOut) {
        video.style.opacity = String((duration - currentTime) / fadeOut)
      } else {
        video.style.opacity = '1'
      }

      rafRef.current = requestAnimationFrame(fadeLoop)
    }

    function handleEnded() {
      if (!video) return
      video.style.opacity = '0'
      setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {})
      }, 100)
    }

    video.style.opacity = '0'
    video.play().catch(() => {})
    rafRef.current = requestAnimationFrame(fadeLoop)
    video.addEventListener('ended', handleEnded)

    return () => {
      cancelAnimationFrame(rafRef.current)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background video */}
      <video
        ref={videoRef}
        src="/hero-bg.mp4"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0 }}
      />

      {/* Blur overlay centered behind content */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-950 opacity-90"
        style={{ width: 984, height: 527, filter: 'blur(82px)' }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
