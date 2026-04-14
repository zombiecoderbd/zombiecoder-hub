# Setting Up Ollama - Local AI for Everyone

## What is Ollama?

Ollama is a free, open-source tool that lets you run AI models locally on your computer. It's perfect for:
- Those without cloud access or expensive API keys
- Protecting user privacy (everything stays on your machine)
- Working offline
- Common people and Ulama who need AI help

## System Requirements

**Minimum:**
- 8GB RAM
- 10GB disk space
- Windows 10+, macOS 11+, or Linux

**Recommended:**
- 16GB RAM
- 20GB disk space
- GPU (NVIDIA, AMD, or Intel Arc)

## Installation

### Windows

1. Download from: https://ollama.ai/download/windows
2. Run the installer
3. Open Command Prompt and verify:
   ```bash
   ollama --version
   ```

### macOS

1. Download from: https://ollama.ai/download/mac
2. Open the DMG file
3. Drag to Applications
4. Open Terminal and verify:
   ```bash
   ollama --version
   ```

### Linux

```bash
curl https://ollama.ai/install.sh | sh
```

Verify:
```bash
ollama --version
```

## Running Ollama

### Start the Ollama Server

Open a terminal/command prompt and run:

```bash
ollama serve
```

This starts Ollama at `http://localhost:11434` (default).

You should see:
```
listening on 127.0.0.1:11434
```

**Leave this terminal running!** The server needs to stay active.

## Downloading AI Models

Open a **new** terminal/command prompt while Ollama is running:

### Recommended Models (by resource)

#### Lightweight (4GB RAM, 4GB disk)
```bash
ollama pull orca-mini
ollama pull neural-chat
```

#### Medium (8GB RAM, 7GB disk)
```bash
ollama pull smollm:latest
ollama pull deepseek-r1:1.5b
```

#### Powerful (16GB RAM, 14GB disk)
```bash
ollama pull neural-chat:13b
ollama pull smollm:latest:7b
```

### Choose ONE model to start:

For most use cases, try **smollm:latest**:
```bash
ollama pull smollm:latest
```

Then in your `.env.local`:
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=smollm:latest
```

## Testing Ollama

Test that it's working:

```bash
curl http://localhost:11434/api/tags
```

You should see a list of downloaded models.

## Common Issues

### "Connection refused"
- Ollama is not running. Run `ollama serve` in a terminal
- Wrong URL: Check `OLLAMA_BASE_URL` in `.env.local`

### Model download is slow
- Normal! Some models are 4-14GB
- Keep the terminal open during download
- You only download once

### Out of memory errors
- Choose a smaller model (orca-mini)
- Close other applications
- Increase system RAM if possible

## Available Models

Popular local models (all free):

| Model | Size | Speed | Quality | Command |
|-------|------|-------|---------|---------|
| orca-mini | 2GB | ⚡ Very Fast | ⭐⭐ | `ollama pull orca-mini` |
| neural-chat | 4GB | ⚡ Fast | ⭐⭐⭐ | `ollama pull neural-chat` |
| smollm:latest | 7GB | ⚡ Medium | ⭐⭐⭐⭐ | `ollama pull smollm:latest` |
| deepseek-r1:1.5b | 7GB | ⚡ Medium | ⭐⭐⭐⭐ | `ollama pull deepseek-r1:1.5b` |
| openchat | 3.8GB | ⚡ Very Fast | ⭐⭐⭐ | `ollama pull openchat` |

## Integration with ZombieCoder Hub

Once Ollama is running with a model:

1. Ensure `.env.local` has:
   ```
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=smollm:latest  # or your chosen model
   ```

2. Start ZombieCoder:
   ```bash
   npm run dev
   ```

3. Use the agent API:
   ```bash
   curl -X POST http://localhost:3000/api/agent/chat \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "sessionId": "your-session-id",
       "message": "Hello! Can you help me with this task?"
     }'
   ```

## Using Cloud AI as Fallback

If your local model can't handle complex tasks, ZombieCoder automatically falls back to cloud providers:

### OpenAI (GPT-4 Turbo)

1. Get API key: https://platform.openai.com/api-keys
2. Set in `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Default model: gpt-4-turbo
   ```
   OPENAI_MODEL=gpt-4-turbo
   ```

### Google Gemini

1. Get API key: https://makersuite.google.com/app/apikey
2. Set in `.env.local`:
   ```
   GEMINI_API_KEY=your-key-here
   ```

## Troubleshooting

### Model won't download
- Check internet connection
- Try: `ollama pull smollm:latest --insecure`
- Clear cache: `ollama rm smollm:latest` then retry

### ZombieCoder says "No providers available"
- Ensure Ollama is running with `ollama serve`
- Check OLLAMA_BASE_URL is correct
- Test: `curl http://localhost:11434/api/tags`

### Responses are slow
- First request is always slow (model loading)
- Reduce OLLAMA_MODEL to smaller variant
- Check system RAM usage

## For Ulama & Common People

This system was built for you:
- No expensive cloud subscriptions
- Everything happens on your computer (private)
- Works completely offline
- Free and open-source

May Allah bless your use of this knowledge to help others.

---

Need help? Check the main README.md or PROJECT_ROADMAP.md
