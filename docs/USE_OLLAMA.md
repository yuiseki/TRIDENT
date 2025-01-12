# Using ollama with TRIDENT

This guide explains how to set up and use ollama, particularly with the qwen2.5:1.5b model, for enhanced language processing capabilities.

## Installation

Install ollama using the official installation script:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

This command will:

1. Download the ollama installation script
2. Install ollama on your system
3. Set up the ollama service

### Download and Run

To use the qwen2.5:1.5b model:

```bash
ollama run qwen2.5:1.5b
```

This will:

1. Download the model if not already present
2. Start an interactive session with the model

### Example Usage

Here's an example of using qwen2.5:1.5b with Japanese text:

```bash
ollama run qwen2.5:1.5b "こんにちは！簡単な自己紹介をお願いします。"
```

Example response:

```
こんにちは、私の名前はQwenです。AIの助手のような存在で、あなたが質問や要望をすると回答や情報提供を行います。私は学習データに基づいて人工知能技術を使って進化し続けますので、最新の情報を常に取り入れています。何かお困りのことであればいつでもお助けさせていただきますよ。
```

## Troubleshooting

If you encounter any issues:

1. Verify ollama is running:

```bash
systemctl status ollama
```

2. Check model status:

```bash
ollama list
```

3. For model-specific issues, try removing and re-pulling the model:

```bash
ollama rm qwen2.5:1.5b
ollama pull qwen2.5:1.5b
```
