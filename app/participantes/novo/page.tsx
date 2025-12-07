'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SorteioCadastro } from '@/types/supabase';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NovoParticipantePage() {
  const router = useRouter();
  const [sorteios, setSorteios] = useState<SorteioCadastro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    sorteio_nome: '',
    account_id: 1,
    numero_sorte: 0,
  });

  useEffect(() => {
    async function fetchSorteios() {
      const { data, error } = await supabase
        .from('sorteio_cadastro')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setSorteios(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, sorteio_nome: data[0].nome_sorteio }));
        }
      }
    }

    fetchSorteios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Gerar número da sorte aleatório
      const numeroSorte = Math.floor(Math.random() * 10000000);

      const { data, error } = await supabase.from('sorteio').insert([
        {
          nome: formData.nome,
          telefone: formData.telefone,
          sorteio_nome: formData.sorteio_nome,
          account_id: formData.account_id,
          numero_sorte: numeroSorte,
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        nome: '',
        telefone: '',
        sorteio_nome: formData.sorteio_nome,
        account_id: 1,
        numero_sorte: 0,
      });

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>

          <h1 className="text-3xl font-bold">Cadastrar Novo Participante</h1>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700">Participante cadastrado com sucesso!</p>
          </div>
        )}

        {sorteios.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">
              Nenhum sorteio cadastrado. É necessário ter pelo menos um sorteio para adicionar participantes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="sorteio_nome" className="block text-sm font-medium text-gray-700 mb-2">
                Sorteio *
              </label>
              <select
                id="sorteio_nome"
                required
                value={formData.sorteio_nome}
                onChange={(e) => setFormData({ ...formData, sorteio_nome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sorteios.map((sorteio) => (
                  <option key={sorteio.id} value={sorteio.nome_sorteio}>
                    {sorteio.nome_sorteio}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Participante *
              </label>
              <input
                type="text"
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                id="telefone"
                required
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 mb-2">
                Account ID
              </label>
              <input
                type="number"
                id="account_id"
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                O número da sorte será gerado automaticamente ao salvar o participante.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Participante'}
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors text-center font-medium"
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
