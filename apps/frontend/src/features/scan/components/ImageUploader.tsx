import { useRef, useState, useCallback } from 'react'
import { Camera, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@components/ui/button'
import { cn } from '@lib/utils'

interface ImageUploaderProps {
  onFile: (file: File) => void
  disabled?: boolean
}

export function ImageUploader({ onFile, disabled }: ImageUploaderProps) {
  const fileRef   = useRef<HTMLInputElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const [dragOver, setDragOver]       = useState(false)
  const [cameraOpen, setCameraOpen]   = useState(false)
  const [stream, setStream]           = useState<MediaStream | null>(null)
  const [cameraErr, setCameraErr]     = useState(false)

  // ── File input handler ─────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = ''     // reset so same file can be re-selected
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }, [onFile])

  // ── Camera ─────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    setCameraErr(false)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setStream(mediaStream)
      setCameraOpen(true)
      // Attach to video element after render
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play()
        }
      })
    } catch {
      setCameraErr(true)
      // Fallback to file input
      fileRef.current?.click()
    }
  }

  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCameraOpen(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const video  = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' })
        closeCamera()
        onFile(file)
      }
    }, 'image/jpeg', 0.9)
  }

  // ── Camera view ────────────────────────────────────────────────────────────
  if (cameraOpen) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] max-h-[420px]">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {/* Scan frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 rounded-2xl border-2 border-white/70" style={{
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
          }} />
        </div>
        <p className="absolute top-4 left-0 right-0 text-center text-white/80 text-xs">
          Đặt món ăn vào khung
        </p>
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-6">
          <Button variant="outline" size="sm" onClick={closeCamera}
            className="bg-black/50 border-white/30 text-white hover:bg-black/70">
            Huỷ
          </Button>
          <button onClick={capturePhoto}
            className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
            <div className="h-13 w-13 rounded-full bg-white border-4 border-gray-300" />
          </button>
          <div className="w-16" /> {/* spacer */}
        </div>
      </div>
    )
  }

  // ── Upload area ────────────────────────────────────────────────────────────
  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); !disabled && setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => !disabled && fileRef.current?.click()}
      className={cn(
        'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none',
        dragOver && !disabled
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-accent/20',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="py-14 flex flex-col items-center gap-4">
        <div className={cn(
          'h-18 w-18 rounded-2xl flex items-center justify-center transition-colors',
          dragOver ? 'bg-primary/15' : 'bg-muted'
        )}>
          {dragOver
            ? <ImageIcon className="h-9 w-9 text-primary" />
            : <Upload className="h-9 w-9 text-muted-foreground" />
          }
        </div>

        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground">
            {dragOver ? 'Thả ảnh vào đây' : 'Tải ảnh lên hoặc kéo thả'}
          </p>
          <p className="text-sm text-muted-foreground">JPG, PNG, WebP · Tối đa 20MB</p>
        </div>

        <div className="flex gap-3" onClick={e => e.stopPropagation()}>
          <Button
            size="sm" className="gap-2"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="h-4 w-4" /> Chọn ảnh
          </Button>
          <Button
            size="sm" variant="outline" className="gap-2"
            onClick={openCamera}
            disabled={disabled}
          >
            <Camera className="h-4 w-4" />
            {cameraErr ? 'Không có camera' : 'Chụp ảnh'}
          </Button>
        </div>

        {cameraErr && (
          <p className="text-xs text-destructive">Camera không khả dụng. Dùng chọn ảnh thay thế.</p>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </div>
  )
}
