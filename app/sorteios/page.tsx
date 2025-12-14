import { supabase } from "@/lib/supabase";
import { SorteioCadastro } from "@/types/supabase";
import Link from "next/link";

export default async function SorteiosPage() {
  const { data: sorteios, error } = await supabase
    .from("sorteio_cadastro")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Sorteios Cadastrados</h1>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sorteios Cadastrados</h1>
        <Link
          href="/"
          className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Ver Participantes
        </Link>
      </div>

      {sorteios && sorteios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            Nenhum sorteio cadastrado ainda.
          </p>
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
                  href={`/${sorteio.account_id}/sorteios`}
                  className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-medium px-3 py-2 rounded-lg transition-colors flex-1 text-center text-sm"
                >
                  Sorteios do Account
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
