"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, User, Download, ImageIcon, Video } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface GalleryPanelProps {
  generatedImages: string[]
  onExampleClick: (prompt: string) => void
  isGenerating: boolean
  generationPrompt?: string
  generationModel?: string
  generationTimestamp?: string
  uploadedImagePreview?: string
}

const exampleGallery = [
  {
    image: "/bw-portrait.png",
    title: "Black and white portrait",
    description: "Timeless monochrome face captures.",
    prompt: "Create a stunning black and white portrait with dramatic lighting and professional composition.",
  },
  {
    image: "/watercolor-character-painting.jpg",
    title: "Character watercolor painting",
    description: "Transform ordinary photo into a watercolor...",
    prompt: "Transform this photo into a beautiful watercolor painting with soft colors and artistic brush strokes.",
  },
  {
    image: "/three-view-character-diagram.jpg",
    title: "Three-view diagram",
    description: "Generates precise three-angle technical...",
    prompt: "Create a three-view character diagram showing front, side, and back views with consistent style.",
  },
  {
    image: "/business-portrait-professional.jpg",
    title: "Business portrait",
    description: "Professional headshots for career use.",
    prompt: "Generate a professional business portrait with clean background and formal attire.",
  },
  {
    image: "/illustration-cartoon-style.jpg",
    title: "Add Illustration",
    description: "Enhance images with artistic flair.",
    prompt: "Add playful cartoon illustrations and decorative elements to enhance the image.",
  },
  {
    image: "/character-pose-grid-six-views.jpg",
    title: "Character pose six-grid",
    description: "Display six dynamic pose variations.",
    prompt: "Create a six-panel grid showing the character in different dynamic poses and angles.",
  },
]

export function GalleryPanel({
  generatedImages,
  onExampleClick,
  isGenerating,
  generationPrompt,
  generationModel = "Nano Banana",
  generationTimestamp,
  uploadedImagePreview,
}: GalleryPanelProps) {
  const [activeTab, setActiveTab] = useState<"inspiration" | "creation">("inspiration")
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async (url: string) => {
    if (!url || isDownloading) {
      return
    }

    try {
      setIsDownloading(true)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Download failed. Please try again.")
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const filename =
        (() => {
          try {
            const parsedUrl = new URL(url)
            const lastSegment = parsedUrl.pathname.split("/").filter(Boolean).pop()
            return lastSegment ?? "nano-banana.jpg"
          } catch {
            return "nano-banana.jpg"
          }
        })()

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error(error)
      toast({
        title: "Unable to download",
        description:
          error instanceof Error ? error.message : "We couldn't download the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  if (isGenerating && activeTab === "inspiration") {
    setActiveTab("creation")
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b border-border">
        <Button
          variant={activeTab === "inspiration" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("inspiration")}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Inspiration
        </Button>
        <Button
          variant={activeTab === "creation" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("creation")}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          My Creation
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "inspiration" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Image Inspiration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exampleGallery.map((example, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer overflow-hidden bg-card hover:bg-accent/10 transition-all border-border"
                  onClick={() => onExampleClick(example.prompt)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={example.image || "/placeholder.svg"}
                      alt={example.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-card-foreground mb-1">{example.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{example.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "creation" && (
          <div>
            {(isGenerating || generatedImages.length > 0) && generationPrompt ? (
              <div className="max-w-4xl mx-auto">
                {/* Generation metadata header */}
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Image</span>
                  </div>
                  <span>{generationModel}</span>
                  <span>{generationTimestamp || new Date().toLocaleString()}</span>
                </div>

                {/* Prompt and reference image */}
                <div className="flex gap-3 mb-4">
                  {uploadedImagePreview && (
                    <img
                      src={uploadedImagePreview || "/placeholder.svg"}
                      alt="Reference"
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <p className="text-sm text-foreground leading-relaxed flex-1">{generationPrompt}</p>
                </div>

                {/* Loading or Result Display */}
                {isGenerating ? (
                  <div className="relative w-full aspect-[4/3] bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block h-1 w-32 bg-primary/20 rounded-full overflow-hidden mb-4">
                        <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
                      </div>
                      <p className="text-muted-foreground">Generating...</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                  <div className="relative w-full rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center">
                    <img
                      src={generatedImages[0] || "/placeholder.svg"}
                      alt="Generated result"
                      className="w-full h-auto max-h-[75vh] object-contain"
                    />
                    {/* Download button overlay */}
                    <Button
                        size="icon"
                        variant="secondary"
                        disabled={isDownloading}
                        onClick={() => handleDownload(generatedImages[0])}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download image"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Action buttons below image */}
                    <div className="flex gap-3 mt-4">
                      <Button variant="secondary" className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Used as a reference image
                      </Button>
                      <Button variant="secondary" className="gap-2">
                        <Video className="h-4 w-4" />
                        Generate video
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No creations yet. Start generating!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
