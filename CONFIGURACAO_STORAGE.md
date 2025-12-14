# Configuração do Supabase Storage

## Erro 400 Bad Request ao fazer upload de imagem

O erro ocorre porque o bucket `campaign-media` não está configurado corretamente no Supabase.

## Solução: Configurar o Storage no Supabase

### 1. Acessar o Dashboard do Supabase

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Entre no seu projeto: `yamfgrfllhmrckhxsuwx`

### 2. Criar o Bucket

1. No menu lateral, clique em **Storage**
2. Clique em **Create Bucket**
3. Configure o bucket:
   - **Name**: `campaign-media`
   - **Public bucket**: ✅ **Marque esta opção** (para permitir acesso público às imagens)
   - **File size limit**: 50MB (ou o que preferir)
   - **Allowed MIME types**: `image/*` (apenas imagens)

### 3. Configurar Políticas de Segurança (RLS)

Depois de criar o bucket, você precisa criar políticas para permitir uploads e visualização:

#### Política para Upload (INSERT):

```sql
CREATE POLICY "Enable upload for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'campaign-media'
  AND auth.role() = 'authenticated'
);
```

#### Política para Visualização Pública (SELECT):

```sql
CREATE POLICY "Enable public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'campaign-media');
```

#### Política para Deletar (DELETE) - Opcional:

```sql
CREATE POLICY "Enable delete for authenticated users" ON storage.objects
FOR DELETE USING (
  bucket_id = 'campaign-media'
  AND auth.role() = 'authenticated'
);
```

### 4. Como Aplicar as Políticas

1. No Supabase Dashboard, vá para **Storage**
2. Clique no bucket `campaign-media`
3. Vá na aba **Policies**
4. Clique em **New Policy**
5. Copie e cole cada política SQL acima

### 5. Alternativa Simples (Menos Segura)

Se você quiser permitir acesso total ao bucket (menos recomendado para produção):

```sql
-- Permite qualquer operação para qualquer usuário
CREATE POLICY "Allow all operations" ON storage.objects
FOR ALL USING (bucket_id = 'campaign-media');
```

### 6. Verificar se Funciona

Após configurar:

1. Tente fazer upload de uma imagem novamente
2. A URL gerada deve ser algo como:
   `https://yamfgrfllhmrckhxsuwx.supabase.co/storage/v1/object/public/campaign-media/sorteios/210/1765724687319_violao.png`

### 7. Estrutura de Pastas

O código está criando esta estrutura:

```
campaign-media/
└── sorteios/
    └── {accountId}/
        └── {timestamp}_{filename}
```

Exemplo: `sorteios/210/1765724687319_violao.png`

## Problemas Comuns

- **403 Forbidden**: Problema nas políticas RLS
- **400 Bad Request**: Bucket não existe ou configurado incorretamente
- **413 Payload Too Large**: Arquivo muito grande
- **415 Unsupported Media Type**: Tipo de arquivo não permitido
