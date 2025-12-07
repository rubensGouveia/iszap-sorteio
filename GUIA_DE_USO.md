# 📚 Guia de Uso do Sistema de Gerenciamento de Sorteios

## 🎯 Como Usar

### 1. Página Principal (/)
A página principal exibe todos os participantes de um sorteio selecionado:

- **Selecionar Sorteio**: Use o dropdown para escolher qual sorteio visualizar
- **Buscar**: Digite no campo de busca para filtrar participantes por nome, telefone ou número da sorte
- **Ordenar**: Clique nos cabeçalhos das colunas para ordenar (🔼/🔽)
- **Exportar**:
  - **Gerar Excel**: Baixa arquivo .xlsx com todos os dados filtrados
  - **Gerar PDF**: Baixa arquivo .pdf formatado com cabeçalho e rodapé
  - **Imprimir**: Abre diálogo de impressão com apenas a tabela

### 2. Lista de Sorteios (/sorteios)
Visualize todos os sorteios cadastrados:

- Cada card mostra: nome, imagem (se disponível) e data de criação
- Clique em "Ver Participantes" para ir à página específica do sorteio

### 3. Participantes por Sorteio (/participantes/[nome])
Página dedicada a um sorteio específico:

- Mesmas funcionalidades da página principal
- URL compartilhável para acesso direto

### 4. Cadastrar Participante (/participantes/novo)
Formulário para adicionar novo participante:

- **Sorteio**: Selecione em qual sorteio cadastrar
- **Nome**: Nome completo do participante
- **Telefone**: Número de contato
- **Account ID**: Identificador da conta (padrão: 1)
- **Número da Sorte**: Gerado automaticamente ao salvar

## 🔧 Configuração do Supabase

### Criar Tabelas no Supabase

Execute os seguintes comandos SQL no Supabase SQL Editor:

```sql
-- Tabela de cadastro de sorteios
CREATE TABLE sorteio_cadastro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT NOT NULL,
  nome_sorteio TEXT NOT NULL,
  url_media TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de participantes
CREATE TABLE sorteio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  account_id INTEGER NOT NULL,
  sorteio_nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  numero_sorte BIGINT NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_sorteio_nome ON sorteio(sorteio_nome);
CREATE INDEX idx_sorteio_cadastro_nome ON sorteio_cadastro(nome_sorteio);
CREATE INDEX idx_sorteio_created_at ON sorteio(created_at);
```

### Inserir Dados de Exemplo

```sql
-- Inserir sorteios de exemplo
INSERT INTO sorteio_cadastro (account_id, nome_sorteio, url_media) VALUES
('1', 'Sorteio de Natal 2024', 'https://example.com/natal.jpg'),
('1', 'Mega Sorteio de Ano Novo', 'https://example.com/anonovo.jpg'),
('1', 'Sorteio do Mês', NULL);

-- Inserir participantes de exemplo
INSERT INTO sorteio (nome, telefone, account_id, sorteio_nome, numero_sorte) VALUES
('João Silva', '(11) 98765-4321', 1, 'Sorteio de Natal 2024', 1234567),
('Maria Santos', '(11) 97654-3210', 1, 'Sorteio de Natal 2024', 2345678),
('Pedro Oliveira', '(11) 96543-2109', 1, 'Sorteio de Natal 2024', 3456789),
('Ana Costa', '(11) 95432-1098', 1, 'Mega Sorteio de Ano Novo', 4567890),
('Carlos Souza', '(11) 94321-0987', 1, 'Mega Sorteio de Ano Novo', 5678901);
```

### Configurar Row Level Security (RLS) - Opcional

Para produção, configure políticas de segurança:

```sql
-- Habilitar RLS
ALTER TABLE sorteio_cadastro ENABLE ROW LEVEL SECURITY;
ALTER TABLE sorteio ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (ajuste conforme necessário)
CREATE POLICY "Permitir leitura para todos" ON sorteio_cadastro
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura para todos" ON sorteio
  FOR SELECT USING (true);

-- Permitir inserção (ajuste para autenticação)
CREATE POLICY "Permitir inserção" ON sorteio
  FOR INSERT WITH CHECK (true);
```

## 🎨 Personalização

### Alterar Cores do Tema

Edite `app/globals.css` para mudar as cores principais:

```css
:root {
  --primary-color: #2563eb; /* Azul */
  --success-color: #16a34a; /* Verde */
  --danger-color: #dc2626; /* Vermelho */
}
```

### Adicionar Logo

1. Coloque sua logo em `public/logo.png`
2. Edite `app/layout.tsx` para adicionar:

```tsx
<header className="bg-white shadow">
  <div className="container mx-auto px-4 py-4">
    <img src="/logo.png" alt="Logo" className="h-12" />
  </div>
</header>
```

## 📊 Dicas de Performance

### Otimizar Consultas

Para grandes volumes de dados, considere:

1. **Paginação no Servidor**: Modifique as queries para usar `.range()`
2. **Índices**: Adicione índices nas colunas frequentemente filtradas
3. **Cache**: Use React Query ou SWR para cache de dados

### Exemplo de Paginação

```typescript
const { data, error } = await supabase
  .from('sorteio')
  .select('*')
  .eq('sorteio_nome', nomeSorteio)
  .range(0, 99) // Primeiros 100 registros
  .order('created_at', { ascending: false });
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático!

### Outras Plataformas

- **Netlify**: Adicione `netlify.toml` com configurações
- **Railway**: Configuração automática via `package.json`
- **DigitalOcean App Platform**: Deploy direto do GitHub

## 🔒 Segurança em Produção

### Checklist

- [ ] Ativar RLS no Supabase
- [ ] Configurar políticas de acesso apropriadas
- [ ] Usar autenticação (Supabase Auth)
- [ ] Validar inputs no frontend e backend
- [ ] Configurar CORS adequadamente
- [ ] Usar HTTPS em produção
- [ ] Limitar rate de requisições

## 📱 Testes

### Testar Localmente

```bash
# Executar em modo de desenvolvimento
npm run dev

# Testar build de produção
npm run build
npm run start
```

### Testar Exportações

1. Acesse a página principal
2. Selecione um sorteio com participantes
3. Teste cada botão de exportação:
   - Excel: Verifique se o arquivo abre corretamente
   - PDF: Confirme formatação e dados
   - Impressão: Visualize a prévia

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se as credenciais do Supabase estão corretas
- Confirme que as tabelas existem no banco
- Verifique a conexão com internet

### Tabela vazia
- Confirme que há dados na tabela do Supabase
- Verifique o nome do sorteio selecionado
- Inspecione console do navegador para erros

### Erro na exportação
- Verifique se há dados para exportar
- Teste com conjunto menor de dados
- Verifique permissões de download do navegador

## 📞 Suporte

Para mais informações:
- Documentação Next.js: https://nextjs.org/docs
- Documentação Supabase: https://supabase.com/docs
- Documentação TanStack Table: https://tanstack.com/table/latest
