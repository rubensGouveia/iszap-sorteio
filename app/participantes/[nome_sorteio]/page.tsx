'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Sorteio } from '@/types/supabase';
import ParticipantesTable from '@/components/ParticipantesTable';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ nome_sorteio: string }>;
}

export default function ParticipantesPorSorteioPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const nomeSorteio = decodeURIComponent(resolvedParams.nome_sorteio);
  
  const [participantes, setParticipantes] = useState<Sorteio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParticipantes() {
      try {
        const { data, error } = await supabase
          .from('sorteio')
          .select('*')
          .eq('sorteio_nome', nomeSorteio)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setParticipantes(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipantes();
  }, [nomeSorteio]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Participantes do Sorteio</h1>
        <p className="text-xl text-gray-600">{nomeSorteio}</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <ParticipantesTable data={participantes} sorteioNome={nomeSorteio} />
    </div>
  );
}
