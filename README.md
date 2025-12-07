# Sistema de Gerenciamento de Sorteios

Sistema completo desenvolvido em Next.js 15+ para gerenciar sorteios e participantes com integração Supabase.

## 🚀 Tecnologias Utilizadas

- **Next.js 15+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **Supabase** - Backend e banco de dados
- **TanStack Table** - Tabelas interativas com filtros e ordenação
- **xlsx** - Exportação para Excel
- **jsPDF + jspdf-autotable** - Exportação para PDF

## 📋 Funcionalidades

### Principais
- ✅ Listagem de todos os sorteios cadastrados
- ✅ Visualização de participantes por sorteio
- ✅ Tabela interativa com filtros e busca
- ✅ Ordenação por colunas
- ✅ Paginação de resultados
- ✅ Cadastro de novos participantes
- ✅ Exportação de dados para Excel
- ✅ Exportação de dados para PDF
- ✅ Impressão de listas filtradas
- ✅ Design responsivo (mobile-friendly)

### Páginas
- `/` - Página principal com seleção de sorteio e tabela de participantes
- `/sorteios` - Lista de todos os sorteios cadastrados
- `/participantes/[nome_sorteio]` - Participantes de um sorteio específico
- `/participantes/novo` - Formulário de cadastro de participante

## 🗄️ Estrutura do Banco de Dados

### Tabela `sorteio_cadastro`
- `id` (uuid, primary key)
- `account_id` (text)
- `nome_sorteio` (text)
- `url_media` (text, opcional)
- `created_at` (timestamp)

### Tabela `sorteio`
- `id` (uuid, primary key)
- `nome` (text)
- `telefone` (text)
- `account_id` (integer)
- `sorteio_nome` (text)
- `created_at` (timestamp)
- `numero_sorte` (bigint)

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

As credenciais já estão configuradas no arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yamfgrfllhmrckhxsuwx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa verificação de lint

## 🎨 Componentes

### `ParticipantesTable`
Tabela interativa com:
- Filtros por nome, telefone, número da sorte
- Busca global
- Ordenação por colunas
- Paginação
- Botões de exportação (Excel, PDF, Impressão)

### `Loading`
Componente de carregamento com spinner animado

### `ErrorMessage`
Componente para exibir mensagens de erro

## 📤 Exportação de Dados

### Excel
- Formato `.xlsx`
- Colunas: Nome, Telefone, Número da Sorte, Data e Hora
- Largura de colunas ajustada automaticamente

### PDF
- Cabeçalho com nome do sorteio
- Tabela formatada
- Rodapé com data de exportação e número de página
- Alternância de cores nas linhas

### Impressão
- CSS otimizado para impressão
- Oculta elementos desnecessários
- Mantém apenas a tabela

## 🔐 Segurança

- Variáveis de ambiente para credenciais
- Queries parametrizadas (Supabase)
- Row Level Security (RLS) configurável no Supabase

## 📱 Responsividade

- Design adaptado para mobile, tablet e desktop
- Tabelas com scroll horizontal em telas pequenas
- Layout flexível com TailwindCSS

## 🎯 Próximas Melhorias

- [ ] Autenticação com Supabase Auth
- [ ] Dashboard com estatísticas
- [ ] Realizar sorteio automaticamente
- [ ] Edição de participantes
- [ ] Exclusão de participantes
- [ ] Upload de imagens para sorteios
- [ ] Filtros avançados por data
- [ ] Histórico de sorteios realizados

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.

## 👨‍💻 Desenvolvimento

Desenvolvido com Next.js 15+ e as melhores práticas de desenvolvimento web moderno.
