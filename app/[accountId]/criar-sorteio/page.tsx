"use client";

import { useState, useRef, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface PageProps {
  params: Promise<{ accountId: string }>;
}

interface LinkGerado {
  whatsapp_link: string;
  qrcode_webhook_url: string;
  id: string;
  phone_number: string;
}

export default function CriarSorteioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const accountId = resolvedParams.accountId;

  const [nomeSorteio, setNomeSorteio] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkGerado, setLinkGerado] = useState<LinkGerado | null>(null);
  const [sorteioCreated, setSorteioCreated] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const formatarTelefone = (telefone: string) => {
    // Remove todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, "");
    // Adiciona o código do país (55) se não estiver presente
    return numeroLimpo.length === 11 ? `55${numeroLimpo}` : numeroLimpo;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagemFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);

      // Validar tipo do arquivo
      if (!file.type.startsWith("image/")) {
        console.error("Arquivo deve ser uma imagem");
        alert(
          "Por favor, selecione apenas arquivos de imagem (PNG, JPG, etc.)"
        );
        return null;
      }

      // Validar tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error("Arquivo muito grande");
        alert("A imagem deve ter no máximo 10MB");
        return null;
      }

      const fileName = `${Date.now()}_${file.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`;
      const filePath = `sorteios/${accountId}/${fileName}`;

      console.log("Tentando fazer upload para:", filePath);

      const { data, error } = await supabase.storage
        .from("campaign-media")
        .upload(filePath, file);

      if (error) {
        console.error("Erro detalhado no upload:", error);

        if (error.message.includes("not found")) {
          alert(
            'Erro: Bucket "campaign-media" não encontrado. Verifique a configuração do Storage no Supabase.'
          );
        } else if (error.message.includes("policy")) {
          alert(
            "Erro: Sem permissão para upload. Verifique as políticas do Storage no Supabase."
          );
        } else {
          alert(`Erro ao fazer upload: ${error.message}`);
        }
        return null;
      }

      console.log("Upload realizado com sucesso:", data);

      // Obter URL pública da imagem
      const {
        data: { publicUrl },
      } = supabase.storage.from("campaign-media").getPublicUrl(filePath);

      console.log("URL pública gerada:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      alert(
        "Erro inesperado ao fazer upload da imagem. Verifique o console para mais detalhes."
      );
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const criarSorteioComQR = async () => {
    if (!nomeSorteio || !telefone || !mensagem) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload da imagem se houver
      let urlImagem = null;
      if (imagemFile) {
        urlImagem = await uploadImageToSupabase(imagemFile);
        if (!urlImagem) {
          alert("Erro ao fazer upload da imagem. Continuando sem imagem.");
        }
      }

      // 2. Criar o sorteio na tabela sorteio_cadastro
      const { data: sorteioData, error: sorteioError } = await supabase
        .from("sorteio_cadastro")
        .insert({
          nome_sorteio: nomeSorteio,
          account_id: accountId,
          url_media: urlImagem,
        })
        .select()
        .single();

      if (sorteioError) throw sorteioError;

      setSorteioCreated(true);

      // 3. Agora criar o QR code
      const telefoneFormatado = formatarTelefone(telefone);
      const mensagemCodificada = encodeURIComponent(mensagem);
      const whatsappLink = `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`;

      // 4. Primeiro inserir o link sem o webhook URL para obter o UUID
      const { data: linkData, error: linkError } = await supabase
        .from("links_qr_code")
        .insert({
          account_id: parseInt(accountId),
          phone_number: telefoneFormatado,
          message: mensagem,
          whatsapp_link: whatsappLink,
          qrcode_webhook_url: '', // Temporariamente vazio
          sorteio_nome: nomeSorteio,
          cliques: 0, // Valor inicial explícito
        })
        .select()
        .single();

      if (linkError) throw linkError;

      // 5. Agora gerar a URL do webhook usando o UUID do link criado
      const webhookUrl = `https://req.iszap.com.br/webhook/criador-links-qrcode?id=${linkData.id}`;

      // 6. Atualizar o registro com a URL do webhook correta
      const { error: updateError } = await supabase
        .from("links_qr_code")
        .update({ qrcode_webhook_url: webhookUrl })
        .eq('id', linkData.id);

      if (updateError) throw updateError;

      setLinkGerado({
        whatsapp_link: whatsappLink,
        qrcode_webhook_url: webhookUrl,
        id: linkData.id,
        phone_number: telefoneFormatado,
      });
    } catch (error: any) {
      console.error("Erro ao criar sorteio:", error);
      alert("Erro ao criar sorteio: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      alert("Link copiado para a área de transferência!");
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      alert("Erro ao copiar link");
    }
  };

  const downloadQRCode = () => {
    if (!qrRef.current || !linkGerado) return;

    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1080;
    canvas.height = 1080;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.drawImage(img, 0, 0, 1080, 1080);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `qrcode_${nomeSorteio}_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        });
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const formatTelefoneDisplay = (telefone: string) => {
    const numero = telefone.replace(/\D/g, "");
    if (numero.length === 11) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    }
    return telefone;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/${accountId}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Voltar
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Criar Novo Sorteio com QR Code
        </h1>
        <p className="text-gray-600">Account ID: {accountId}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Informações do Sorteio
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nome do Sorteio
            </label>
            <input
              type="text"
              value={nomeSorteio}
              onChange={(e) => setNomeSorteio(e.target.value)}
              placeholder="Digite o nome do sorteio..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={sorteioCreated}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Imagem do Sorteio (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={sorteioCreated || uploadingImage}
            />
            {imagemPreview && (
              <div className="mt-3">
                <img
                  src={imagemPreview}
                  alt="Preview"
                  className="w-full max-w-xs h-48 object-cover rounded-lg border"
                />
              </div>
            )}
            {uploadingImage && (
              <p className="text-sm text-blue-600 mt-2">Uploading imagem...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Número do WhatsApp
            </label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={sorteioCreated}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Mensagem Personalizada
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Olá! Gostaria de participar do sorteio..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={sorteioCreated}
            />
          </div>

          {!sorteioCreated && (
            <button
              onClick={criarSorteioComQR}
              disabled={
                loading ||
                uploadingImage ||
                !nomeSorteio ||
                !telefone ||
                !mensagem
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Criando..."
                : uploadingImage
                ? "Fazendo upload..."
                : "Criar Sorteio e Gerar QR Code"}
            </button>
          )}
        </div>
      </div>

      {linkGerado && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Sorteio "{nomeSorteio}" criado com sucesso!
          </h2>

          <div className="text-center space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <QRCodeSVG
                  ref={qrRef}
                  value={linkGerado.qrcode_webhook_url}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#000000"
                />
              </div>
            </div>

            {/* Informações do Link */}
            <div className="text-left bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Telefone:</strong>{" "}
                {formatTelefoneDisplay(linkGerado.phone_number)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Mensagem:</strong> {mensagem}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Link WhatsApp:</strong>
                <br />
                <span className="break-all text-blue-600">
                  {linkGerado.whatsapp_link}
                </span>
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <button
                onClick={() => copiarLink(linkGerado.whatsapp_link)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                📋 Copiar Link do WhatsApp
              </button>

              <button
                onClick={downloadQRCode}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                📥 Download QR Code (PNG - 1080px)
              </button>

              <Link
                href={`/${accountId}/qr-links`}
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
              >
                👁️ Ver Todos os Links QR
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
