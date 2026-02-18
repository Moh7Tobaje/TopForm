"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Video, Upload, X, Square } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AnalyzePerformancePage() {
  const { user, isLoaded } = useUser()
  const { t } = useLanguage()
  
  // Analyze performance (video) modal state
  const [analyzeOpen, setAnalyzeOpen] = useState(true)
  const [analyzeStep, setAnalyzeStep] = useState<'picker' | 'record' | 'analyzing' | 'result' | 'error'>('picker')
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const closeAnalyze = () => {
    setAnalyzeOpen(false)
    setAnalyzeStep('picker')
    setAnalyzeError(null)
    setAnalysisResult(null)
    setVideoUrlInput('')
    stopRecording()
  }

  const startRecordFlow = () => {
    setAnalyzeStep('record')
  }

  const chooseFromGallery = () => {
    fileInputRef.current?.click()
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      })
      streamRef.current = stream
      videoRef.current!.srcObject = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      recordedChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        sendVideoToAPI(blob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      setAnalyzeError('Failed to access camera. Please check permissions.')
      setAnalyzeStep('error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const sendVideoToAPI = async (videoBlob: Blob) => {
    setAnalyzeStep('analyzing')
    
    try {
      const formData = new FormData()
      formData.append('video', videoBlob, 'workout-video.webm')
      
      const response = await fetch('/api/workout/analyze-video', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const result = await response.json()
      setAnalysisResult(result.analysis)
      setAnalyzeStep('result')
    } catch (error) {
      console.error('Error analyzing video:', error)
      setAnalyzeError('Failed to analyze video. Please try again.')
      setAnalyzeStep('error')
    }
  }

  const sendVideoUrl = async (url: string) => {
    if (!url.trim()) return
    
    setAnalyzeStep('analyzing')
    
    try {
      const response = await fetch('/api/workout/analyze-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const result = await response.json()
      setAnalysisResult(result.analysis)
      setAnalyzeStep('result')
    } catch (error) {
      console.error('Error analyzing video URL:', error)
      setAnalyzeError('Failed to analyze video. Please try again.')
      setAnalyzeStep('error')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      sendVideoToAPI(file)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen circuit-pattern-dense bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen circuit-pattern-dense bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to access performance analysis.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen circuit-pattern-dense bg-background p-4 pt-20">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-[var(--font-heading)]">Analyze Performance</h1>
            <p className="text-muted-foreground">Get AI-powered analysis of your workout form and technique</p>
          </div>
        </div>

        {/* Analyze performance content */}
        <div className="w-full max-w-lg mx-auto">
          <div className="rounded-2xl bg-[#1a1b1b] border border-[#2d2e2e] shadow-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {analyzeStep === 'picker' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Record, choose a video (up to 4.4 MB), or paste a URL for larger files.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={startRecordFlow}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#e3372e]/20 border-2 border-[#e3372e]/50 text-white hover:bg-[#e3372e]/30 hover:border-[#e3372e] transition-colors"
                    >
                      <Video className="w-10 h-10" />
                      <span className="font-semibold">Record with camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={chooseFromGallery}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-[#2d2e2e] border-2 border-[#3d3e3e] text-white hover:bg-[#3d3e3e] hover:border-[#4d4e4e] transition-colors"
                    >
                      <Upload className="w-10 h-10" />
                      <span className="font-semibold">Choose from library</span>
                    </button>
                  </div>
                  <div className="pt-2 border-t border-[#2d2e2e]">
                    <p className="text-gray-400 text-xs mb-2">Analyze from URL (for large videos, e.g. Google Drive, Dropbox direct link)</p>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://…"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className="flex-1 bg-[#2d2e2e] border-[#3d3e3e] text-white placeholder:text-gray-500"
                      />
                      <Button
                        onClick={() => sendVideoUrl(videoUrlInput)}
                        className="bg-[#e3372e] hover:bg-[#c41e3a] text-white shrink-0"
                      >
                        Analyze from URL
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {analyzeStep === 'record' && (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  </div>
                  <div className="flex gap-3">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="flex-1 bg-[#e3372e] hover:bg-[#c41e3a] text-white">
                        <Video className="w-4 h-4 mr-2" />
                        Start recording
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                        <Square className="w-4 h-4 mr-2 fill-current" />
                        Stop & analyze
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {analyzeStep === 'analyzing' && (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-gray-300">
                  <Loader2 className="w-14 h-14 text-[#e3372e] animate-spin" />
                  <p className="font-medium">Analyzing your performance…</p>
                  <p className="text-sm text-gray-500">This may take a minute.</p>
                </div>
              )}

              {analyzeStep === 'result' && analysisResult && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#2d2e2e]/80 border border-[#3d3e3e] max-h-80 overflow-y-auto">
                    <div className="prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: analysisResult }} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setAnalyzeStep('picker')} variant="outline" className="flex-1">
                      Analyze Another Video
                    </Button>
                  </div>
                </div>
              )}

              {analyzeStep === 'error' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/50">
                    <p className="text-red-400">{analyzeError}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setAnalyzeStep('picker')} variant="outline" className="flex-1">
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
