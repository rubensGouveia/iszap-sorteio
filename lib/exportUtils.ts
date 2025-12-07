import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sorteio } from '@/types/supabase';

export function exportToExcel(data: Sorteio[], sorteioNome: string) {
  const formattedData = data.map((item) => ({
    Nome: item.nome,
    Telefone: item.telefone,
    'Número da Sorte': item.numero_sorte,
    'Data e Hora': new Date(item.created_at).toLocaleString('pt-BR'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes');

  // Ajustar largura das colunas
  const maxWidth = formattedData.reduce((acc, row) => {
    Object.keys(row).forEach((key, i) => {
      const value = String(row[key as keyof typeof row]);
      acc[i] = Math.max(acc[i] || 0, value.length, key.length);
    });
    return acc;
  }, [] as number[]);

  worksheet['!cols'] = maxWidth.map((w) => ({ wch: w + 2 }));

  XLSX.writeFile(workbook, `participantes_sorteio_${sorteioNome}.xlsx`);
}

export function exportToPDF(data: Sorteio[], sorteioNome: string) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(18);
  doc.text(`Lista de Participantes - ${sorteioNome}`, 14, 22);

  // Tabela
  const tableData = data.map((item) => [
    item.nome,
    item.telefone,
    item.numero_sorte.toString(),
    new Date(item.created_at).toLocaleString('pt-BR'),
  ]);

  autoTable(doc, {
    head: [['Nome', 'Telefone', 'Número da Sorte', 'Data e Hora']],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Exportado em: ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`participantes_sorteio_${sorteioNome}.pdf`);
}

export function printTable() {
  window.print();
}
