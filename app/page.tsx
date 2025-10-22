"use client"

import { useEffect, useRef, useState } from "react"
import { InputPanel } from "@/components/input-panel"
import { GalleryPanel } from "@/components/gallery-panel"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMetadata, setGenerationMetadata] = useState<{
    prompt: string
    timestamp: string
    imagePreview: string
  } | null>(null)
  const previewRef = useRef<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const previousPreview = previewRef.current
    const currentPreview = generationMetadata?.imagePreview ?? null

    if (previousPreview && previousPreview !== currentPreview && previousPreview.startsWith("blob:")) {
      URL.revokeObjectURL(previousPreview)
    }

    previewRef.current = currentPreview
  }, [generationMetadata?.imagePreview])

  useEffect(() => {
    return () => {
      const preview = previewRef.current
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)

    const imagePreview =
      uploadedImages.length > 0 ? URL.createObjectURL(uploadedImages[0]) : ""

    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    setGenerationMetadata({
      prompt,
      timestamp,
      imagePreview,
    })

    const formData = new FormData()
    formData.append("prompt", prompt)
    uploadedImages.forEach((file) => {
      formData.append("images", file)
    })

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Generation request failed.",
        )
      }

      const imageUrls =
        Array.isArray(payload?.imageUrls) && payload.imageUrls.length > 0
          ? payload.imageUrls
          : []

      if (imageUrls.length === 0) {
        throw new Error("No images were returned by the model.")
      }

      setGeneratedImages(imageUrls)
    } catch (error) {
      console.error(error)
      setGeneratedImages([])
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "We couldn’t create an image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  return (
    <div className="flex h-screen bg-background">
      <InputPanel
        prompt={prompt}
        setPrompt={setPrompt}
        uploadedImages={uploadedImages}
        setUploadedImages={setUploadedImages}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasResults={generatedImages.length > 0}
      />
      <GalleryPanel
        generatedImages={generatedImages}
        onExampleClick={handleExampleClick}
        isGenerating={isGenerating}
        generationPrompt={generationMetadata?.prompt}
        generationTimestamp={generationMetadata?.timestamp}
        uploadedImagePreview={generationMetadata?.imagePreview}
      />
    </div>
  )
}
