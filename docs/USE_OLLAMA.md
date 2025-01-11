# Using Ollama with TRIDENT

This guide explains how to set up and use Ollama, particularly with the phi4:14b model, for enhanced language processing capabilities.

## Installation

Install Ollama using the official installation script:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

This command will:
1. Download the Ollama installation script
2. Install Ollama on your system
3. Set up the Ollama service

## Using phi4:14b Model

The phi4:14b model is recommended for its improved language processing capabilities, particularly for Japanese text.

### Download and Run

To use the phi4:14b model:

```bash
ollama run phi4:14b
```

This will:
1. Download the model if not already present (approximately 9.1GB)
2. Start an interactive session with the model

### Example Usage

Here's an example of using phi4:14b with Japanese text:

```bash
ollama run phi4:14b "こんにちは！簡単な自己紹介をお願いします。"
```

Example response:
```
こんにちは！私はOpenAIが開発した言語モデルです。質問に答えたり、情報を提供したりするのが得意です。
さまざまなトピックについての知識を持っていますが、最新の出来事や特定の個人的な経験に関しては限界があります。
プライバシーや安全性を尊重しながら、皆さんのお役に立てるよう努めています。何か質問や話したいことがあれば、
遠慮なくどうぞ！
```

## Features

- Supports multiple languages, with good Japanese language capabilities
- Approximately 14 billion parameters for improved performance
- Interactive command-line interface
- Efficient response generation

## Troubleshooting

If you encounter any issues:

1. Verify Ollama is running:
```bash
systemctl status ollama
```

2. Check model status:
```bash
ollama list
```

3. For model-specific issues, try removing and re-pulling the model:
```bash
ollama rm phi4:14b
ollama pull phi4:14b
```
