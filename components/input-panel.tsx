"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Sparkles, Upload, X } from "lucide-react"
import { useRef } from "react"

interface InputPanelProps {
  prompt: string
  setPrompt: (prompt: string) => void
  uploadedImages: File[]
  setUploadedImages: (images: File[]) => void
  onGenerate: () => void | Promise<void>
  isGenerating: boolean
  hasResults?: boolean
}

export function InputPanel({
  prompt,
  setPrompt,
  uploadedImages,
  setUploadedImages,
  onGenerate,
  isGenerating,
  hasResults = false,
}: InputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedImages([...uploadedImages, ...newFiles])
    }
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  return (
    <div className="w-[480px] border-r border-border bg-card flex flex-col">
      {/* Header Tabs */}
      <div className="flex gap-2 p-4 border-b border-border">
        <Button variant="secondary" className="flex-1 gap-2">
          <ImageIcon className="h-4 w-4" />
          AI Image
        </Button>
        <Button variant="ghost" className="flex-1 gap-2">
          <Upload className="h-4 w-4" />
          AI Video
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Model Selection */}
        <div className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Models:</span>
          <Select defaultValue="nano-banana">
            <SelectTrigger className="w-[180px] bg-primary text-primary-foreground border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nano-banana">🍌 Nano Banana</SelectItem>
              <SelectItem value="mega-mango">🥭 Mega Mango</SelectItem>
              <SelectItem value="ultra-apple">🍎 Ultra Apple</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <span className="text-sm">Describe Your Idea</span>
            </Label>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-accent">
              <Sparkles className="h-3 w-3" />
              AI Optimization
            </Button>
          </div>
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Please transform the person in the uploaded photo into a professional and artistic portrait..."
              className="min-h-[200px] bg-secondary/50 border-border resize-none"
              maxLength={1000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">{prompt.length}/1000</div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm">Upload Images</Label>
          <div className="flex gap-2 flex-wrap">
            {uploadedImages.map((file, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary group">
                <img
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Auto Translation */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div>
            <div className="text-sm font-medium">Enable Auto Translation</div>
            <div className="text-xs text-muted-foreground">
              Translates non-English prompts to English for better results
            </div>
          </div>
          <Switch />
        </div>

        {/* Sheet Selection */}
        <div>
          <Select defaultValue="1">
            <SelectTrigger className="w-full bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 sheet</SelectItem>
              <SelectItem value="2">2 sheets</SelectItem>
              <SelectItem value="4">4 sheets</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium relative overflow-hidden"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : hasResults ? (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Create + 100
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Limited-Time Free
            </>
          )}
          {/* Mascot character */}
          <span className="absolute -right-2 -bottom-2 text-4xl">👋🐵</span>
        </Button>
      </div>
    </div>
  )
}
