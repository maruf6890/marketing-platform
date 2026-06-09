"""
Social Media Management Platform — AI Content API
FastAPI + LangChain (LCEL) + Google Gemini (NEW SDK)
"""

import base64
import asyncio
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field

from google import genai

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from google.genai import types
#load .env variables
from dotenv import load_dotenv
import os

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")

# ─────────────────────────────────────────────
# App
# ─────────────────────────────────────────────

app = FastAPI(
    title="SocialAI Content API",
    description="AI-powered content generation using Gemini + LangChain LCEL (Modern)",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def get_llm(model: str = GEMINI_MODEL):
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.8,
    )


def get_client(api_key: str = GOOGLE_API_KEY):
    return genai.Client(api_key=api_key)


# ─────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────

class HashtagRequest(BaseModel):
    description: str
    platform: str = "instagram"
    count: int = Field(20, ge=5, le=50)
    tone: str = "trendy"



class PostRequest(BaseModel):
    topic: str
    description: str
    brand_name: Optional[str] = None
    tone: str = "engaging"
    include_cta: bool = True
    target_audience: Optional[str] = None



class TextToImageRequest(BaseModel):
    description: str
    style: str = "photorealistic"
    aspect_ratio: str = "1:1"
    api_key: str


#output purser



class HashtagResponse(BaseModel):
    hashtags: List[str]
    caption: str

class FacebookPostResponse(BaseModel):
    post_text: str

# ─────────────────────────────────────────────
# Root
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "SocialAI API", "status": "running"}


@app.post("/api/v1/generate/hashtags")
async def generate_hashtags(req: HashtagRequest):

    llm = get_llm().with_structured_output(HashtagResponse)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a professional social media marketing optimizer specialized in boosting algorithmic visibility."),
        ("human", """
Generate a catchy caption and an accurate array of highly relevant hashtags based on the parameters provided below.

Desired Hashtag Count: {count}
Brand Tone Style: {tone}
Target Network Platform: {platform}

Context Description: 
{description}
""")
    ])

    chain = prompt | llm

    try:
        data = await chain.ainvoke({
            "count": req.count,
            "tone": req.tone,
            "platform": req.platform,
            "description": req.description
        })

        return {
            "success": True,
            "data": {
                "hashtags": data.hashtags,
                "caption": data.caption,
            },
            "message": f"Generated {len(data.hashtags)} hashtags for {req.platform} with {req.tone} tone."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 2. Facebook Post (LangChain ONLY)
# ─────────────────────────────────────────────

@app.post("/api/v1/generate/post")
async def generate_facebook_post(req: PostRequest):

    llm = get_llm().with_structured_output(FacebookPostResponse)

    prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are an elite Facebook growth copywriter.

Your job is to write high-performing Facebook posts that maximize:
- engagement (comments, shares, reactions)
- readability (mobile-first short lines)
- emotional hook (curiosity, relatability, value)
- conversion via CTA

Rules:
- Write like a real human, not an AI
- Avoid robotic, salesy, or generic marketing tone
- Use natural storytelling when possible
- Keep sentences short and punchy
- Prioritize clarity over complexity
"""
    ),
    (
        "human",
        """
Create a high-performing Facebook post using the inputs below:

🎯 Topic: {topic}
🧠 Description: {description}
🎭 Tone: {tone}
🏢 Brand/Identity: {brand}
👥 Target Audience: {audience}
📢 Call To Action: {cta}

Requirements:
- Hook the reader in the first 1–2 lines
- Make the post emotionally engaging or highly relatable
- Naturally integrate the brand if needed (don’t force it)
- End with a strong CTA that encourages action or comments
- Keep it concise (max 100 words)
- Format for Facebook readability (line breaks, short paragraphs)
- dont add emojies
s
Output ONLY the Facebook post. No explanations.
"""
    )
])

    chain = prompt | llm

    try:
        # FIXED: Replacing empty strings with clear instructional defaults for the model
        data = await chain.ainvoke({
            "tone": req.tone,
            "topic": req.topic,
            "description": req.description if req.description else "No description provided",
            "brand": req.brand_name if req.brand_name else "General / Not specified",
            "audience": req.target_audience if req.target_audience else "General public",
            "cta": "Include a clear, high-conversion call to action" if req.include_cta else "Do not include an explicit call to action"
        })

        return {
            "success": True,
            "data": {
                "post_text": data.post_text,
            },
            "message": "Post generated successfully."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ─────────────────────────────────────────────
# 3. Image → Content (NEW Gemini SDK)
# ─────────────────────────────────────────────


@app.post("/api/v1/generate/product-photo")
async def product_photo(
    file: UploadFile = File(...),
    api_key: str = Form(...),
):
    # Validate image type
    if file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG and WEBP images are supported."
        )

    try:
        # Read uploaded image
        image_bytes = await file.read()

        # Initialize Gemini client using the user's provided API key
        client = genai.Client(api_key=GOOGLE_API_KEY)

        # Convert image into Gemini Part for Vision Analysis
        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=file.content_type,
        )

        # Step 1: Analyze uploaded product
        analysis = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                image_part,
                """
                Analyze this product image.

                Return a detailed description including:
                - product type
                - color
                - material
                - shape
                - design details
                - branding if visible

                Focus on information useful for professional ecommerce photography.
                """
            ],
        )

        product_description = analysis.text

        # Step 2: Build enhanced product photography prompt
        prompt = f"""
        Professional ecommerce product photography.

        Product:
        {product_description}

        Requirements:
        - preserve original product appearance
        - preserve colors and branding
        - white seamless studio background
        - premium commercial photography
        - softbox lighting
        - realistic shadows
        - ultra sharp focus
        - realistic reflections if appropriate
        - luxury advertising style
        - ecommerce catalog quality
        - highly detailed
        - 8k quality
        """

        # Step 3: Generate improved product image using Gemini's image model
        image_response = client.models.generate_content(
            model="gemini-2.5-flash-image",  # Or "gemini-3-pro-image" for ultra-high fidelity
            contents=[prompt],
        )

        # Extract the image bytes from the response parts
        generated_image_bytes = None
        for part in image_response.parts:
            if part.inline_data is not None:
                # Convert the part back into bytes (or use .as_image() if converting to PIL)
                generated_image_bytes = part.inline_data.data
                break

        if not generated_image_bytes:
            raise HTTPException(
                status_code=500,
                detail="Failed to extract generated image data from Gemini API."
            )

        # Return the generated binary image directly to the client
        return Response(content=generated_image_bytes, media_type="image/png")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/api/v1/generate/text-to-image")
async def text_to_image(req: TextToImageRequest):

    llm = get_llm(req.api_key)
    parser = JsonOutputParser()

    prompt = ChatPromptTemplate.from_messages([
        ("system", "Return ONLY JSON."),
        ("human", """
Enhance image prompt:

Description: {description}
Style: {style}
Aspect: {aspect}

Return:
{
  "enhanced_prompt": "",
  "style_guide": "",
  "generation_tip": ""
}
""")
    ])

    chain = prompt | llm | parser

    try:
        meta = await chain.ainvoke({
            "description": req.description,
            "style": req.style,
            "aspect": req.aspect_ratio
        })

        enhanced_prompt = meta["enhanced_prompt"]

        image_b64 = None

        try:
            client = genai.Client(api_key=req.api_key)

            result = client.models.generate_images(
                model="imagen-3.0-generate-001",
                prompt=enhanced_prompt
            )

            if result.generated_images:
                image_b64 = base64.b64encode(
                    result.generated_images[0].image.image_bytes
                ).decode()

        except Exception:
            image_b64 = None

        return {
            "enhanced_prompt": enhanced_prompt,
            "image_base64": image_b64,
            "style_guide": meta.get("style_guide", ""),
            "generation_tip": meta.get("generation_tip", "")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)