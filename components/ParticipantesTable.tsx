"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Sorteio } from "@/types/supabase";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface ParticipantesTableProps {
  data: Sorteio[];
  sorteioNome: string;
}

export default function ParticipantesTable({
  data,
  sorteioNome,
}: ParticipantesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Função de filtro global personalizada
  const globalFilterFn = (row: any, columnId: string, value: string) => {
    const search = value.toLowerCase();

    // Buscar em nome, telefone e número da sorte
    const nome = row.getValue("nome")?.toString().toLowerCase() || "";
    const telefone = row.getValue("telefone")?.toString().toLowerCase() || "";
    const numeroSorte =
      row.getValue("numero_sorte")?.toString().toLowerCase() || "";

    return (
      nome.includes(search) ||
      telefone.includes(search) ||
      numeroSorte.includes(search)
    );
  };

  const columns = useMemo<ColumnDef<Sorteio>[]>(
    () => [
      {
        accessorKey: "nome",
        header: "Nome",
        cell: (info) => info.getValue() as string,
        enableGlobalFilter: true,
        filterFn: "includesString",
      },
      {
        accessorKey: "telefone",
        header: "Telefone",
        cell: (info) => info.getValue() as string,
        enableGlobalFilter: true,
        filterFn: "includesString",
      },
      {
        accessorKey: "numero_sorte",
        header: "Número da Sorte",
        cell: (info) => info.getValue() as number,
        enableGlobalFilter: true,
        filterFn: "includesString",
      },
      {
        accessorKey: "created_at",
        header: "Data e Hora",
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
        enableGlobalFilter: false,
        filterFn: "includesString",
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalFilterFn,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const filteredData = table
    .getFilteredRowModel()
    .rows.map((row) => row.original);

  return (
    <div className="space-y-4">
      {/* Filtros e Ações */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar participante..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder-gray-600"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-800 font-medium whitespace-nowrap">
              Mostrar:
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 bg-white"
            >
              {[5, 10, 20, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-800 font-medium whitespace-nowrap">
              por página
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportToExcel(filteredData, sorteioNome)}
            className="bg-green-700 hover:bg-green-800 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Gerar Excel
          </button>

          <button
            onClick={() => exportToPDF(filteredData, sorteioNome)}
            className="bg-red-700 hover:bg-red-800 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Gerar PDF
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum participante encontrado
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {table.getPageCount() > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Informações da paginação */}
              <div className="text-sm text-gray-800 font-medium">
                Mostrando{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                a{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                de {table.getFilteredRowModel().rows.length} participantes
                {table.getFilteredRowModel().rows.length !== data.length && (
                  <span> (filtrado de {data.length} total)</span>
                )}
              </div>

              {/* Controles de navegação */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-2 text-sm font-medium text-gray-800 border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  title="Primeira página"
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-2 text-sm font-medium text-gray-800 border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  title="Página anterior"
                >
                  {"<"}
                </button>

                {/* Seletor de página */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-800 font-medium">
                    Página
                  </span>
                  <input
                    type="number"
                    value={table.getState().pagination.pageIndex + 1}
                    onChange={(e) => {
                      const page = e.target.value
                        ? Number(e.target.value) - 1
                        : 0;
                      if (page >= 0 && page < table.getPageCount()) {
                        table.setPageIndex(page);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm font-medium text-gray-900 border border-gray-400 rounded-md text-center focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                    min="1"
                    max={table.getPageCount()}
                  />
                  <span className="text-sm text-gray-800 font-medium">
                    de {table.getPageCount()}
                  </span>
                </div>

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-2 text-sm font-medium text-gray-800 border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  title="Próxima página"
                >
                  {">"}
                </button>
                <button
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-2 text-sm font-medium text-gray-800 border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  title="Última página"
                >
                  {">>"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
