import { supabase } from "@/lib/supabase";
import { SorteioCadastro } from "@/types/supabase";
import Link from "next/link";

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default async function AccountSorteiosPage({ params }: PageProps) {
  const resolvedParams = await params;
  const accountId = resolvedParams.accountId;

  const { data: sorteios, error } = await supabase
    .from("sorteio_cadastro")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/${accountId}`}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            Sorteios do Account {accountId}
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Erro ao carregar sorteios: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${accountId}`}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Voltar
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
                Sorteios do Account {accountId}
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              {sorteios?.length || 0} sorteio(s) encontrado(s)
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${accountId}`}
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Painel do Account
            </Link>
          </div>
        </div>
      </div>

      {sorteios && sorteios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            Nenhum sorteio encontrado para o Account ID: {accountId}
          </p>
          <div className="flex justify-center gap-4"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorteios?.map((sorteio: SorteioCadastro) => (
            <div
              key={sorteio.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {sorteio.url_media && (
                <div className="mb-4">
                  <img
                    src={sorteio.url_media}
                    alt={sorteio.nome_sorteio}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                {sorteio.nome_sorteio}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Account ID: {sorteio.account_id}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Criado em:{" "}
                {new Date(sorteio.created_at).toLocaleDateString("pt-BR")}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/participantes/${encodeURIComponent(
                    sorteio.nome_sorteio
                  )}`}
                  className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-medium px-3 py-2 rounded-lg transition-colors flex-1 text-center text-sm"
                >
                  Ver Participantes
                </Link>
                <Link
                  href={`/${accountId}`}
                  className="inline-block bg-green-700 hover:bg-green-800 text-white font-medium px-3 py-2 rounded-lg transition-colors flex-1 text-center text-sm"
                >
                  Ver no Painel
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
