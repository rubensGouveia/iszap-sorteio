# Funcionalidades QR Code no ISZAP-Sorteio

## Visão Geral

Foi adicionada ao sistema ISZAP-Sorteio uma funcionalidade integrada para criar sorteios com QR codes do WhatsApp, baseada nas funcionalidades do wa-qr-generator.

## Novas Rotas

### 1. `/[accountId]/criar-sorteio`
- **Função**: Criar um novo sorteio com QR code integrado
- **Funcionalidades**:
  - Criação de sorteio na tabela `sorteio_cadastro`
  - Geração automática de link WhatsApp
  - Criação de QR code para o link
  - Armazenamento na tabela `links_qr_code`

### 2. `/[accountId]/qr-links`
- **Função**: Listar e gerenciar todos os links QR do account
- **Funcionalidades**:
  - Visualização de todos os links QR criados
  - Filtro por telefone, mensagem ou nome do sorteio
  - Edição de telefone e mensagem
  - Download de QR codes
  - Cópia de links
  - Exclusão de links
  - Visualização de estatísticas de cliques

## Como Usar

### Criando um Novo Sorteio com QR Code

1. Acesse `/{accountId}/criar-sorteio`
2. Preencha os campos:
   - **Nome do Sorteio**: Nome identificador do sorteio
   - **Número do WhatsApp**: Telefone no formato (11) 99999-9999
   - **Mensagem Personalizada**: Mensagem que aparecerá no WhatsApp
3. Clique em "Criar Sorteio e Gerar QR Code"
4. Após criação:
   - QR code será exibido automaticamente
   - Link do WhatsApp estará disponível para cópia
   - Botão para download do QR code (PNG 1080px)

### Gerenciando Links QR

1. Acesse `/{accountId}/qr-links`
2. Visualize todos os links criados para o account
3. Use a barra de filtro para buscar por:
   - Número de telefone
   - Conteúdo da mensagem
   - Nome do sorteio
4. Para cada link você pode:
   - **Ver QR**: Visualizar o QR code em modal
   - **Copiar**: Copiar link do WhatsApp
   - **Editar**: Modificar telefone e mensagem
   - **Deletar**: Remover o link (com confirmação)

### Navegação Principal

Na página principal `/{accountId}`, foram adicionados novos botões:
- **🎲 Criar Sorteio + QR**: Acesso direto para criar sorteio
- **📱 Ver Links QR**: Acesso para gerenciar links existentes

## Estrutura de Dados

### Tabela `links_qr_code`
```sql
- id (uuid): ID único do link
- account_id (numeric): ID da conta
- phone_number (text): Telefone formatado (55XXXXXXXXXXX)
- message (text): Mensagem personalizada
- whatsapp_link (text): Link completo do WhatsApp
- qrcode_webhook_url (text): URL do webhook para tracking (https://req.iszap.com.br/webhook/criador-links-qrcode?id={uuid})
- cliques (numeric): Contador de cliques no QR code (default: 0)
- sorteio_nome (text): Nome do sorteio associado (opcional)
- created_at (timestamp with time zone): Data de criação
```

## Funcionalidades Técnicas

### QR Code
- Gerado usando `qrcode.react`
- Nível de correção: H (alto)
- Inclui margem para melhor leitura
- Download em PNG 1080x1080px

### WhatsApp Integration
- Links no formato: `https://wa.me/{phone}?text={encoded_message}`
- Telefone com código do país (55) automático
- Mensagens codificadas para URL

### Real-time Updates
- Subscription Supabase para atualizações em tempo real
- Recarrega automaticamente lista quando há mudanças

### Tracking
- URLs de webhook configuráveis para rastrear cliques
- Contador de cliques armazenado no banco

## Dependências Adicionadas

```json
{
  "qrcode.react": "^X.X.X",
  "react-input-mask": "^X.X.X",
  "@types/qrcode.react": "^X.X.X"
}
```

## Configuração do Supabase

Certifique-se de que as variáveis de ambiente estão configuradas no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
```

E que a tabela `links_qr_code` existe no banco com as colunas mencionadas na estrutura de dados.