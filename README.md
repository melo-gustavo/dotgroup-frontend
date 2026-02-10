<p align="center">
  <a href="https://react.dev/" target="_blank" rel="noreferrer">
    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="120" alt="React Logo" />
  </a>
</p>
# DotGroup Frontend

Frontend da plataforma DotGroup, desenvolvido com React + TypeScript + Vite.

## Requisitos

- Node.js 22+
- npm

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Configure variáveis de ambiente em `.env`:

```bash
VITE_BASE_URL_BACKEND="http://localhost:3000"
```

## Scripts

- `npm run dev`: inicia ambiente de desenvolvimento
- `npm run build`: build de produção
- `npm run preview`: preview do build
- `npm run lint`: validação de lint

## Execução

```bash
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

## Integração com Backend

O frontend consome a API definida em `VITE_BASE_URL_BACKEND`.

Principais áreas:

- Usuários
- Cursos
- Turmas
- Matrículas
- Dashboard

## Qualidade

Antes de finalizar alterações:

```bash
npm run lint
npm run build
```
