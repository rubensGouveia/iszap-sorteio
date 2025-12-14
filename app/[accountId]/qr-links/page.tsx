"use client";

import { useState, useEffect, useRef, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface PageProps {
  params: Promise<{ accountId: string }>;
}

interface LinkData {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  account_id: number; // numeric
  phone_number: string; // text
  message: string; // text
  whatsapp_link: string; // text
  qrcode_webhook_url: string; // text
  cliques: number; // numeric
  sorteio_nome?: string; // text
}

export default function QRLinksPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const accountId = resolvedParams.accountId;

  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [showQRDialog, setShowQRDialog] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const qrRefs = useRef<{ [key: string]: SVGSVGElement | null }>({});

  useEffect(() => {
    carregarLinks();
    
    // Setup real-time subscription
    const channel = supabase
      .channel('links_qr_code_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links_qr_code',
          filter: `account_id=eq.${accountId}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          carregarLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [accountId]);

  const carregarLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links_qr_code')
        .select('*')
        .eq('account_id', parseInt(accountId))
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLinks(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar links:', error);
      alert('Erro ao carregar links: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatarTelefone = (telefone: string) => {
    const numero = telefone.replace('55', '');
    if (numero.length === 11) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    }
    return telefone;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }) + ', ' + new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copiarLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      alert('Erro ao copiar link');
    }
  };

  const deletarLink = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este link?')) return;

    try {
      const { error } = await supabase
        .from('links_qr_code')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Link deletado com sucesso!');
      carregarLinks();
    } catch (error: any) {
      console.error('Erro ao deletar link:', error);
      alert('Erro ao deletar link: ' + error.message);
    }
  };

  const formatarTelefoneInput = (telefone: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    return numeroLimpo.length === 11 ? `55${numeroLimpo}` : numeroLimpo;
  };

  const editarLink = async () => {
    if (!editingLink || !editPhone || !editMessage) return;

    try {
      const telefoneFormatado = formatarTelefoneInput(editPhone);
      const mensagemCodificada = encodeURIComponent(editMessage);
      const novoWhatsappLink = `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`;

      const { error } = await supabase
        .from('links_qr_code')
        .update({
          phone_number: telefoneFormatado,
          message: editMessage,
          whatsapp_link: novoWhatsappLink
        })
        .eq('id', editingLink.id);

      if (error) throw error;
      
      alert('Link atualizado com sucesso!');
      setEditingLink(null);
      setEditPhone('');
      setEditMessage('');
      carregarLinks();
    } catch (error: any) {
      console.error('Erro ao editar link:', error);
      alert('Erro ao editar link: ' + error.message);
    }
  };

  const downloadQRCode = (linkId: string) => {
    const qrElement = qrRefs.current[linkId];
    if (!qrElement) return;

    const svg = qrElement;
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
            a.download = `qrcode_${linkId}_${Date.now()}.png`;
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

  const filteredLinks = links.filter(link => 
    link.phone_number.includes(filterText) ||
    link.message.toLowerCase().includes(filterText.toLowerCase()) ||
    (link.sorteio_nome && link.sorteio_nome.toLowerCase().includes(filterText.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-xl">Carregando links...</div>
        </div>
      </div>
    );
  }

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
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Links QR Code</h1>
            <p className="text-gray-600">Account ID: {accountId}</p>
          </div>
          
          <Link
            href={`/${accountId}/criar-sorteio`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Novo Sorteio com QR
          </Link>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filtrar por telefone, mensagem ou nome do sorteio..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Lista de Links */}
      <div className="space-y-4">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">
              {links.length === 0 ? "Nenhum link encontrado" : "Nenhum link corresponde ao filtro"}
            </p>
          </div>
        ) : (
          filteredLinks.map((link) => (
            <div key={link.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Criado em: {formatarData(link.created_at)}</span>
                    {link.sorteio_nome && (
                      <span className="ml-4 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Sorteio: {link.sorteio_nome}
                      </span>
                    )}
                  </div>
                  <p className="font-medium mb-1">📞 {formatarTelefone(link.phone_number)}</p>
                  <p className="text-gray-700 mb-2">💬 {link.message}</p>
                  <p className="text-sm text-gray-500">👆 {link.cliques || 0} cliques</p>
                  <p className="text-xs text-gray-400 break-all mt-2">
                    🔗 {link.whatsapp_link}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 md:w-48">
                  <button
                    onClick={() => setShowQRDialog(link.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    👁️ Ver QR
                  </button>
                  
                  <button
                    onClick={() => copiarLink(link.whatsapp_link)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    📋 Copiar
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingLink(link);
                      setEditPhone(formatarTelefone(link.phone_number));
                      setEditMessage(link.message);
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  
                  <button
                    onClick={() => deletarLink(link.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm transition-colors"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal QR Code */}
      {showQRDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">QR Code</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                ref={(el) => {
                  if (el) qrRefs.current[showQRDialog] = el;
                }}
                value={links.find(l => l.id === showQRDialog)?.qrcode_webhook_url || ''}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#000000"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadQRCode(showQRDialog)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                📥 Download
              </button>
              <button
                onClick={() => setShowQRDialog(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editarLink}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditingLink(null);
                    setEditPhone('');
                    setEditMessage('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}