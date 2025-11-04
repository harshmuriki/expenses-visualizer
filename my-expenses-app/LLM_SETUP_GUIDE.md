# LLM Provider Setup Guide

The Expenses Visualizer now supports multiple LLM providers, giving you the flexibility to use OpenAI, local models (Ollama, LM Studio), Anthropic Claude, or any custom OpenAI-compatible API.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Provider Options](#provider-options)
3. [Setup Instructions](#setup-instructions)
4. [Environment Variables](#environment-variables)
5. [UI Configuration](#ui-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Option 1: Using the UI (Recommended)

1. Start the application: `npm run dev`
2. Navigate to the chart page
3. Click the ⚙️ **Settings** icon in the top-right corner
4. Select your preferred LLM provider
5. Configure the provider-specific settings
6. Click **Test Connection** to verify
7. Click **Save Settings**

### Option 2: Using Environment Variables

Add these to your `.env` file:

```bash
# LLM Provider Configuration
LLM_PROVIDER=openai           # Options: openai, ollama, lmstudio, anthropic, custom
LLM_MODEL=gpt-4o-mini         # Model name
LLM_TEMPERATURE=0.2           # 0-2 (lower = more deterministic)
LLM_MAX_TOKENS=16000          # Maximum tokens for response

# Provider-specific keys
OPENAI_KEY=sk-...             # For OpenAI
ANTHROPIC_API_KEY=sk-ant-...  # For Anthropic

# For local providers
OLLAMA_BASE_URL=http://localhost:11434          # For Ollama
LMSTUDIO_BASE_URL=http://localhost:1234/v1      # For LM Studio

# For custom OpenAI-compatible endpoints
CUSTOM_LLM_BASE_URL=https://your-api.com/v1
CUSTOM_LLM_API_KEY=your-key   # Optional
```

---

## Provider Options

### 1. OpenAI (Cloud)

**Pros:**
- High-quality results
- Fast response times
- Reliable and well-supported
- Structured output support

**Cons:**
- Requires internet connection
- Costs money per token
- Data sent to external servers

**Pricing:**
- GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens
- GPT-4: $5.00/1M input tokens, $15.00/1M output tokens

**Best for:** Production use, high accuracy requirements

---

### 2. Ollama (Local)

**Pros:**
- 100% free
- 100% private - no data leaves your machine
- Works offline
- Fast on good hardware
- Easy to install and use

**Cons:**
- Requires local compute resources
- Quality depends on model size
- No native structured output support

**Requirements:**
- 8GB+ RAM recommended
- Install Ollama: [ollama.com](https://ollama.com)

**Best for:** Privacy-conscious users, offline use, experimentation

---

### 3. LM Studio (Local)

**Pros:**
- 100% free
- 100% private - no data leaves your machine
- User-friendly GUI
- Works offline
- Good model selection

**Cons:**
- Requires local compute resources
- Quality depends on model size
- Some models may not support JSON output

**Requirements:**
- 8GB+ RAM recommended
- Install LM Studio: [lmstudio.ai](https://lmstudio.ai)

**Best for:** Users who want a GUI for managing local models

---

### 4. Anthropic Claude (Cloud)

**Pros:**
- High-quality results
- Good at following instructions
- Reliable

**Cons:**
- Requires internet connection
- Costs money per token
- Data sent to external servers
- No native structured output yet

**Pricing:**
- Claude 3.5 Sonnet: $3/1M input tokens, $15/1M output tokens
- Claude 3 Haiku: $0.25/1M input tokens, $1.25/1M output tokens

**Best for:** Users who prefer Claude's capabilities

---

### 5. Custom (OpenAI-Compatible APIs)

**Pros:**
- Use any OpenAI-compatible API
- Works with self-hosted models
- Flexible configuration

**Cons:**
- Requires technical setup
- Quality varies by provider

**Best for:** Advanced users with custom infrastructure

---

## Setup Instructions

### OpenAI Setup

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Either:
   - **UI**: Settings → Provider: OpenAI → Enter API Key
   - **Env**: Add `OPENAI_KEY=sk-...` to `.env`

**Recommended Models:**
- `gpt-4o-mini` - Fast, cheap, good for most use cases
- `gpt-4o` - Higher quality, more expensive
- `gpt-4` - Highest quality, most expensive

---

### Ollama Setup

1. **Install Ollama:**
   ```bash
   # macOS
   brew install ollama

   # Linux
   curl -fsSL https://ollama.com/install.sh | sh

   # Windows
   # Download from ollama.com
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **Download a Model:**
   ```bash
   # Recommended for transaction processing
   ollama pull llama3.2        # 3B model, fast and accurate
   ollama pull mistral         # 7B model, very capable
   ollama pull llama3.1        # 8B model, better quality
   ```

4. **Configure in App:**
   - **UI**: Settings → Provider: Ollama → Base URL: `http://localhost:11434` → Model: `llama3.2`
   - **Env**:
     ```bash
     LLM_PROVIDER=ollama
     OLLAMA_BASE_URL=http://localhost:11434
     LLM_MODEL=llama3.2
     ```

**Model Recommendations:**
- **llama3.2** (3B) - Fast, good for basic categorization
- **mistral** (7B) - Great balance of speed and quality
- **llama3.1** (8B) - Higher quality, slower
- **codellama** - Good for structured data

---

### LM Studio Setup

1. **Install LM Studio:**
   - Download from [lmstudio.ai](https://lmstudio.ai)

2. **Download a Model:**
   - Open LM Studio
   - Go to "Discover" tab
   - Search for and download:
     - **Recommended**: `TheBloke/Mistral-7B-Instruct-v0.2-GGUF`
     - Alternative: `TheBloke/Llama-2-7B-Chat-GGUF`

3. **Start the Local Server:**
   - Go to "Local Server" tab
   - Select your downloaded model
   - Click "Start Server"
   - Note the URL (usually `http://localhost:1234`)

4. **Configure in App:**
   - **UI**: Settings → Provider: LM Studio → Base URL: `http://localhost:1234/v1` → Model: `local-model`
   - **Env**:
     ```bash
     LLM_PROVIDER=lmstudio
     LMSTUDIO_BASE_URL=http://localhost:1234/v1
     LLM_MODEL=local-model
     ```

---

### Anthropic Claude Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)

2. **Configure in App:**
   - **UI**: Settings → Provider: Anthropic → Enter API Key
   - **Env**:
     ```bash
     LLM_PROVIDER=anthropic
     ANTHROPIC_API_KEY=sk-ant-...
     LLM_MODEL=claude-3-5-sonnet-20241022
     ```

**Recommended Models:**
- `claude-3-5-sonnet-20241022` - Best quality
- `claude-3-haiku-20240307` - Faster, cheaper

---

### Custom Provider Setup

For any OpenAI-compatible API (Together AI, Replicate, self-hosted, etc.):

1. **Get your API endpoint and key**

2. **Configure in App:**
   - **UI**: Settings → Provider: Custom → Enter Base URL and API Key
   - **Env**:
     ```bash
     LLM_PROVIDER=custom
     CUSTOM_LLM_BASE_URL=https://your-api.com/v1
     CUSTOM_LLM_API_KEY=your-key
     LLM_MODEL=your-model-name
     ```

---

## Environment Variables

Create a `.env` file in `my-expenses-app/`:

```bash
# ====================================
# LLM PROVIDER CONFIGURATION
# ====================================

# Provider type (required)
# Options: openai, ollama, lmstudio, anthropic, custom
LLM_PROVIDER=openai

# Model name (required)
LLM_MODEL=gpt-4o-mini

# Temperature (optional, default: 0.2)
# Range: 0-2 (lower = more deterministic, higher = more creative)
LLM_TEMPERATURE=0.2

# Max tokens (optional, default: 16000)
LLM_MAX_TOKENS=16000

# ====================================
# OPENAI CONFIGURATION
# ====================================
OPENAI_KEY=sk-...
# Alternative: OPENAI_API_KEY=sk-...

# ====================================
# OLLAMA CONFIGURATION
# ====================================
OLLAMA_BASE_URL=http://localhost:11434

# ====================================
# LM STUDIO CONFIGURATION
# ====================================
LMSTUDIO_BASE_URL=http://localhost:1234/v1

# ====================================
# ANTHROPIC CONFIGURATION
# ====================================
ANTHROPIC_API_KEY=sk-ant-...

# ====================================
# CUSTOM PROVIDER CONFIGURATION
# ====================================
CUSTOM_LLM_BASE_URL=https://your-api.com/v1
CUSTOM_LLM_API_KEY=your-key  # Optional

# ====================================
# OTHER REQUIRED VARIABLES
# ====================================
# (Keep your existing Firebase, Plaid, etc. config)
```

---

## UI Configuration

### Accessing Settings

1. Navigate to the `/chart` page
2. Look for the ⚙️ **Settings** icon in the top-right corner (next to the theme switcher)
3. Click to open the LLM settings modal

### Configuration Fields

**Provider**: Select from dropdown
- OpenAI
- Ollama (Local)
- LM Studio (Local)
- Anthropic Claude
- Custom (OpenAI-compatible)

**API Key**: Required for OpenAI, Anthropic, and optionally Custom
- Your provider's API key
- Not needed for local providers (Ollama, LM Studio)

**Base URL**: Required for Ollama, LM Studio, and Custom
- Ollama: `http://localhost:11434`
- LM Studio: `http://localhost:1234/v1`
- Custom: Your API endpoint

**Model**: Model name/identifier
- OpenAI: `gpt-4o-mini`, `gpt-4`, etc.
- Ollama: `llama3.2`, `mistral`, etc.
- Anthropic: `claude-3-5-sonnet-20241022`, etc.

**Temperature**: 0-2 scale
- 0 = Deterministic, consistent results
- 0.2 = Recommended for transaction categorization
- 1.0 = Balanced
- 2.0 = Creative, varied results

**Max Tokens**: Maximum response length
- 16000 for most use cases
- 4096 for Anthropic models
- Adjust based on your needs

### Testing Connection

Before saving, click **Test Connection** to verify:
- ✅ Connection successful = Provider is working
- ❌ Connection failed = Check your settings

### Saving Configuration

Click **Save Settings** to:
- Store configuration in browser localStorage
- Apply immediately to all LLM operations

---

## Troubleshooting

### OpenAI

**Error: "Missing OPENAI_KEY environment variable"**
- Add `OPENAI_KEY=sk-...` to your `.env` file
- Or configure via UI Settings

**Error: 429 Too Many Requests**
- You've hit rate limits
- Wait a few minutes
- Consider upgrading your OpenAI plan

**Error: 401 Unauthorized**
- Check your API key is correct
- Ensure key has billing enabled

---

### Ollama

**Error: "Connection failed"**
- Ensure Ollama is running: `ollama serve`
- Check the URL is correct: `http://localhost:11434`
- Verify port 11434 is not blocked

**Error: "Model not found"**
- Pull the model first: `ollama pull llama3.2`
- Verify model name matches exactly

**Slow performance**
- Your model might be too large for your hardware
- Try a smaller model: `ollama pull llama3.2` (3B)
- Close other memory-intensive apps

**Poor categorization quality**
- Try a larger model: `ollama pull mistral` (7B)
- Increase temperature slightly (0.3-0.4)
- The model may need more specific prompts

---

### LM Studio

**Error: "Connection failed"**
- Ensure LM Studio local server is running
- Check "Local Server" tab shows "Server Running"
- Verify URL: `http://localhost:1234/v1`

**Error: "No model loaded"**
- Load a model in LM Studio
- Click "Load Model" in the Local Server tab
- Wait for model to fully load

**Invalid JSON responses**
- Some models don't support structured output well
- Try a different model (Mistral Instruct recommended)
- Check LM Studio console for errors

---

### Anthropic

**Error: "Missing ANTHROPIC_API_KEY"**
- Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env`
- Or configure via UI Settings

**Error: 401 Unauthorized**
- Check your API key is correct
- Verify billing is set up

**Unexpected responses**
- Claude doesn't support native structured output yet
- The system uses prompt engineering as a fallback
- This should work fine but may occasionally need retry

---

### General Issues

**"LLM provider not configured" error**
- Set `LLM_PROVIDER` in `.env` OR
- Configure via UI Settings
- Restart the application

**Transaction categorization failing**
- Check the model is appropriate for the task
- Verify API key/connection
- Check browser console for detailed errors
- Try the "Test Connection" button in settings

**Cost concerns (OpenAI/Anthropic)**
- Monitor usage in provider dashboard
- Switch to local models (Ollama/LM Studio) for free
- Use smaller models (gpt-4o-mini instead of gpt-4)

**Quality concerns (local models)**
- Try larger models (7B or 13B)
- Increase temperature slightly
- Use Mistral models (often better for structured tasks)
- Consider using cloud providers for critical accuracy

---

## Performance Comparison

| Provider | Speed | Quality | Cost | Privacy | Internet |
|----------|-------|---------|------|---------|----------|
| OpenAI GPT-4o-mini | ⚡⚡⚡ | ⭐⭐⭐⭐ | $ | 🔒 | Required |
| OpenAI GPT-4 | ⚡⚡ | ⭐⭐⭐⭐⭐ | $$$ | 🔒 | Required |
| Ollama (llama3.2) | ⚡⚡⚡ | ⭐⭐⭐ | Free | 🔒🔒🔒 | None |
| Ollama (mistral) | ⚡⚡ | ⭐⭐⭐⭐ | Free | 🔒🔒🔒 | None |
| LM Studio | ⚡⚡ | ⭐⭐⭐⭐ | Free | 🔒🔒🔒 | None |
| Anthropic Claude | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | $$ | 🔒 | Required |

---

## Best Practices

### For Production
- Use OpenAI GPT-4o-mini for best balance of cost/quality
- Set up monitoring and error tracking
- Keep API keys in environment variables, not UI
- Set reasonable token limits

### For Development
- Use local models (Ollama/LM Studio) for free testing
- Configure via UI for quick iteration
- Test with small datasets first

### For Privacy
- Use only local models (Ollama/LM Studio)
- Never send sensitive data to cloud providers
- Consider self-hosted alternatives

### For Cost Optimization
- Start with GPT-4o-mini (cheapest OpenAI option)
- Switch to local models if usage is high
- Monitor token usage regularly
- Use appropriate max_tokens limits

---

## FAQ

**Q: Can I switch providers without losing data?**
A: Yes! Your transaction data is stored in Firebase. The LLM provider only affects processing of new uploads.

**Q: Which provider is best?**
A: For production: OpenAI GPT-4o-mini. For privacy/cost: Ollama. For quality: GPT-4 or Claude 3.5 Sonnet.

**Q: Can I use multiple providers?**
A: Not simultaneously, but you can easily switch between providers in settings.

**Q: Do local models work offline?**
A: Yes! Ollama and LM Studio work completely offline once models are downloaded.

**Q: How much does OpenAI cost?**
A: For 1000 transactions, approximately $0.05-0.15 depending on complexity.

**Q: What if my local model gives poor results?**
A: Try a larger model (7B or 13B), adjust temperature, or switch to a cloud provider.

**Q: Is my financial data safe?**
A: With local models (Ollama/LM Studio), data never leaves your machine. With cloud providers, data is sent via encrypted connections.

---

## Support

For issues or questions:
1. Check this guide first
2. Test connection via UI settings
3. Check browser console for errors
4. Create an issue on GitHub with error details

---

## Example Configurations

### Privacy-Focused Setup
```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=mistral
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=16000
```

### Cost-Effective Cloud Setup
```bash
LLM_PROVIDER=openai
OPENAI_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=8000
```

### High-Quality Setup
```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=4096
```

### Development Setup
```bash
LLM_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LLM_MODEL=local-model
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=16000
```

---

**Last Updated:** November 2024
**Compatible with:** Expenses Visualizer v2.0+
