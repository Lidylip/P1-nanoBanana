import { NextResponse } from "next/server"
import Replicate from "replicate"

function getReplicateClient() {
  const token = process.env.REPLICATE_API_TOKEN

  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured")
  }

  return new Replicate({
    auth: token,
  })
}

type GenerateResponse = {
  imageUrls: string[]
}

async function extractImageUrls(output: unknown): Promise<string[]> {
  const asString = (value: unknown) => {
    if (typeof value === "string") {
      return value
    }
    if (value instanceof URL) {
      return value.toString()
    }
    return null
  }

  if (typeof output === "string") {
    return [output]
  }

  if (output instanceof URL) {
    return [output.toString()]
  }

  if (
    output &&
    typeof output === "object" &&
    "url" in output &&
    typeof (output as { url: unknown }).url === "function"
  ) {
    const url = await (output as { url: () => Promise<unknown> }).url()
    const parsedUrl = asString(url)
    return parsedUrl ? [parsedUrl] : []
  }

  if (Array.isArray(output)) {
    const results: string[] = []
    for (const item of output) {
      const nestedUrls = await extractImageUrls(item)
      results.push(...nestedUrls)
    }
    return results.filter(Boolean)
  }

  if (typeof output === "object" && output !== null) {
    const values = await Promise.all(
      Object.values(output).map(async (value) => {
        if (
          value &&
          typeof value === "object" &&
          "url" in value &&
          typeof (value as { url: unknown }).url === "function"
        ) {
          const nestedUrl = await (value as { url: () => Promise<unknown> }).url()
          return asString(nestedUrl)
        }
        return asString(value)
      }),
    )
    return values.filter((value): value is string => typeof value === "string")
  }

  return []
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const promptValue = formData.get("prompt")

    if (typeof promptValue !== "string" || !promptValue.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      )
    }

    const images = formData
      .getAll("images")
      .filter((file): file is File => file instanceof File && file.size > 0)

    const replicate = getReplicateClient()

    const output = await replicate.run("google/nano-banana", {
      input: {
        prompt: promptValue,
        ...(images.length > 0 ? { image_input: images } : {}),
      },
    })

    const imageUrls = await extractImageUrls(output)

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "No images were returned by the model." },
        { status: 502 },
      )
    }

    return NextResponse.json<GenerateResponse>({ imageUrls })
  } catch (error) {
    console.error("[generate]", error)

    const message =
      error instanceof Error ? error.message : "Failed to generate image."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
