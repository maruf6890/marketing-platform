# SocialAI Content API

AI-powered content generation backend for social media management platforms.
Built with **FastAPI** · **LangChain** · **Google Gemini 1.5 Flash / Imagen 3**

---

## Features

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/generate/hashtags` | POST | Generate platform-optimised hashtags + caption |
| `/api/v1/generate/facebook-post` | POST | Generate Facebook post copy with optional CTA |
| `/api/v1/generate/image-to-content` | POST | Analyse an image → captions, hashtags, platform posts |
| `/api/v1/generate/text-to-image` | POST | Enhance prompt + generate image via Imagen 3 |

---

## Quick Start

```bash
# 1. Clone / copy project
cd social-media-api

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment (optional — key is also passed per-request)
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

# 5. Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## API Reference

### 1. Generate Hashtags

```http
POST /api/v1/generate/hashtags
Content-Type: application/json

{
  "description": "Launching a new eco-friendly water bottle brand",
  "platform": "instagram",
  "count": 20,
  "tone": "trendy",
  "api_key": "YOUR_GEMINI_API_KEY"
}
```

**Response**
```json
{
  "hashtags": ["#EcoBottle", "#SustainableLiving", ...],
  "caption_suggestion": "Hydrate responsibly. 💧",
  "platform": "instagram"
}
```

---

### 2. Generate Facebook Post

```http
POST /api/v1/generate/facebook-post
Content-Type: application/json

{
  "topic": "Summer sale on handmade jewellery",
  "brand_name": "GlowCraft",
  "tone": "engaging",
  "include_cta": true,
  "target_audience": "women aged 25-40",
  "api_key": "YOUR_GEMINI_API_KEY"
}
```

**Response**
```json
{
  "post_text": "Your summer just got a little more golden...",
  "character_count": 312,
  "emoji_version": "✨ Your summer just got a little more golden... 💍"
}
```

---

### 3. Image → Social Content

```http
POST /api/v1/generate/image-to-content
Content-Type: multipart/form-data

file=<image.jpg>
api_key=YOUR_GEMINI_API_KEY
platforms=instagram,facebook,twitter
```

**Response**
```json
{
  "description": "A golden-hour beach scene...",
  "suggested_caption": "Where the sun meets the sea.",
  "hashtags": ["#BeachVibes", "#GoldenHour", ...],
  "platform_posts": {
    "instagram": "Sun-kissed and salt-aired...",
    "facebook": "We all need a little vitamin sea...",
    "twitter": "Golden hour hits different by the ocean 🌅"
  },
  "mood": "serene",
  "content_themes": ["nature", "travel", "wellness"]
}
```

---

### 4. Text → Image

```http
POST /api/v1/generate/text-to-image
Content-Type: application/json

{
  "description": "A serene Japanese tea garden at dawn",
  "style": "photorealistic",
  "aspect_ratio": "1:1",
  "api_key": "YOUR_GEMINI_API_KEY"
}
```

**Response**
```json
{
  "enhanced_prompt": "Ultra-realistic Japanese tea garden...",
  "image_base64": "data:image/png;base64,...",
  "generation_tip": "Use soft morning light for best results",
  "style_guide": "Muted earth tones with lush green accents"
}
```

> **Note**: `image_base64` is `null` if Imagen 3 is not available on your API tier.
> The enhanced prompt can be used directly in any other image generation tool.

---

## Architecture

```
Request → FastAPI Router
             │
             ├── LangChain ChatPromptTemplate
             │        └── ChatGoogleGenerativeAI (gemini-1.5-flash)
             │
             └── google-generativeai (vision / imagen)
                      ├── gemini-1.5-flash  (image analysis)
                      └── imagen-3.0        (image generation)
```

All endpoints are **fully async** using `asyncio.get_event_loop().run_in_executor`
to wrap synchronous SDK calls without blocking the event loop.

---

## Get a Gemini API Key

1. Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a new key
3. Pass it as `api_key` in each request body

---

## License

MIT
