# CineCatalog — Atividade 4

Projeto Flask de catálogo integrado a uma API externa.

## Requisitos

- Python 3.10 ou superior
- VS Code

## Como executar no Windows

Abra o terminal na pasta do projeto e execute:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Depois abra no navegador:

http://127.0.0.1:5000

## Páginas

- `/` — Página inicial
- `/vetor` — Cadastro usando vetor/lista
- `/dicionario` — Cadastro usando dicionário
- `/api` — Consulta à API pública TVMaze
- `/sobre` — Informações do projeto

## Observação

Os dados de vetor e dicionário ficam somente em memória e são perdidos quando o programa é encerrado, conforme solicitado na atividade.

A consulta da API usa a TVMaze e procura séries. Não é necessário cadastrar chave de API.
