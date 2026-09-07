from flask import Flask, render_template, request
import requests

app = Flask(__name__)

# Dados armazenados em memória
filmes = [
    "Interestelar",
    "Oppenheimer",
    "Vingadores: Ultimato"
]

catalogo = {
    "Interestelar": {
        "genero": "Ficção Científica",
        "ano": 2014,
        "nota": 8.7
    },
    "Oppenheimer": {
        "genero": "Drama",
        "ano": 2023,
        "nota": 8.6
    }
}

# API pública: TVMaze (sem necessidade de chave)
API_URL = "https://api.tvmaze.com/singlesearch/shows"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/vetor", methods=["GET", "POST"])
def vetor():
    mensagem = None

    if request.method == "POST":
        nome = request.form.get("nome", "").strip()

        if nome:
            filmes.append(nome)
            mensagem = f'"{nome}" foi adicionado ao vetor.'
        else:
            mensagem = "Digite o nome de um filme ou série."

    return render_template("vetor.html", filmes=filmes, mensagem=mensagem)


@app.route("/dicionario", methods=["GET", "POST"])
def dicionario():
    mensagem = None

    if request.method == "POST":
        nome = request.form.get("nome", "").strip()
        genero = request.form.get("genero", "").strip()
        ano = request.form.get("ano", "").strip()
        nota = request.form.get("nota", "").strip()

        if not nome or not genero or not ano or not nota:
            mensagem = "Preencha todos os campos."
        else:
            try:
                ano_int = int(ano)
                nota_float = float(nota.replace(",", "."))

                catalogo[nome] = {
                    "genero": genero,
                    "ano": ano_int,
                    "nota": nota_float
                }

                mensagem = f'"{nome}" foi cadastrado com sucesso.'
            except ValueError:
                mensagem = "Ano deve ser inteiro e nota deve ser um número."

    return render_template(
        "dicionario.html",
        catalogo=catalogo,
        mensagem=mensagem
    )


@app.route("/api", methods=["GET", "POST"])
def api():
    resultado = None
    erro = None
    busca = ""

    if request.method == "POST":
        busca = request.form.get("busca", "").strip()

        if not busca:
            erro = "Digite o nome de uma série para pesquisar."
        else:
            try:
                resposta = requests.get(
                    API_URL,
                    params={"q": busca},
                    timeout=8
                )

                if resposta.status_code == 200:
                    dados = resposta.json()

                    resultado = {
                        "titulo": dados.get("name", "Não informado"),
                        "genero": ", ".join(dados.get("genres", [])) or "Não informado",
                        "ano": (
                            dados.get("premiered", "")[:4]
                            if dados.get("premiered")
                            else "Não informado"
                        ),
                        "status": dados.get("status", "Não informado"),
                        "idioma": dados.get("language", "Não informado"),
                        "nota": (
                            dados.get("rating", {}).get("average")
                            or "Não informado"
                        ),
                        "sinopse": dados.get("summary", "Sem sinopse disponível.")
                    }

                    # Remove tags HTML da sinopse
                    import re
                    resultado["sinopse"] = re.sub(
                        r"<[^>]+>", "", resultado["sinopse"]
                    )
                elif resposta.status_code == 404:
                    erro = "Nenhuma série encontrada com esse nome."
                else:
                    erro = "A API respondeu com um erro. Tente novamente."

            except requests.exceptions.Timeout:
                erro = "A consulta demorou demais. Tente novamente."
            except requests.exceptions.RequestException:
                erro = "Não foi possível conectar à API."
            except (ValueError, TypeError):
                erro = "A resposta da API não pôde ser processada."

    return render_template(
        "api.html",
        resultado=resultado,
        erro=erro,
        busca=busca
    )


@app.route("/sobre")
def sobre():
    return render_template("sobre.html")


if __name__ == "__main__":
    app.run(debug=True)
