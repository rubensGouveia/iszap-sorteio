"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { Sorteio, SorteioCadastro } from "@/types/supabase";
import ParticipantesTable from "@/components/ParticipantesTable";
import Loading from "@/components/Loading";
import ErrorMessage from "@/components/ErrorMessage";
import Link from "next/link";

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default function AccountPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const accountId = resolvedParams.accountId;

  const [sorteios, setSorteios] = useState<SorteioCadastro[]>([]);
  const [participantes, setParticipantes] = useState<Sorteio[]>([]);
  const [selectedSorteio, setSelectedSorteio] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar sorteios filtrados por accountId
  useEffect(() => {
    async function fetchSorteios() {
      try {
        const { data, error } = await supabase
          .from("sorteio_cadastro")
          .select("*")
          .eq("account_id", accountId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setSorteios(data || []);
        if (data && data.length > 0) {
          setSelectedSorteio(data[0].nome_sorteio);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSorteios();
  }, [accountId]);

  // Carregar participantes quando o sorteio for selecionado
  useEffect(() => {
    if (!selectedSorteio) return;

    async function fetchParticipantes() {
      setLoadingParticipantes(true);
      try {
        const { data, error } = await supabase
          .from("sorteio")
          .select("*")
          .eq("sorteio_nome", selectedSorteio)
          .eq("account_id", accountId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setParticipantes(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingParticipantes(false);
      }
    }

    fetchParticipantes();
  }, [selectedSorteio, accountId]);

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Gerenciamento de Sorteios</h1>
            </div>
            <p className="text-gray-600 mt-1">Account ID: {accountId}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${accountId}/sorteios`}
              className="bg-purple-700 hover:bg-purple-800 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Lista de Sorteios
            </Link>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {sorteios.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg mb-4">
              Nenhum sorteio encontrado para o Account ID: {accountId}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label
                htmlFor="sorteio-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Selecione um Sorteio:
              </label>
              <select
                id="sorteio-select"
                value={selectedSorteio}
                onChange={(e) => setSelectedSorteio(e.target.value)}
                className="w-full md:w-96 px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 bg-white"
              >
                {sorteios.map((sorteio) => (
                  <option key={sorteio.id} value={sorteio.nome_sorteio}>
                    {sorteio.nome_sorteio}
                  </option>
                ))}
              </select>
            </div>

            {loadingParticipantes ? (
              <Loading />
            ) : (
              <ParticipantesTable
                data={participantes}
                sorteioNome={selectedSorteio}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
