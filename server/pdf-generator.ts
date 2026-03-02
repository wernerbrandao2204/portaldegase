import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface AnalyticsReportData {
  period: string;
  generatedAt: Date;
  totalViews: number;
  totalShares: number;
  conversionRate: number;
  sharesByPlatform: Array<{ platform: string; count: number }>;
  performanceComparison: {
    current: { views: number; shares: number };
    previous: { views: number; shares: number };
    comparison: { viewsChange: number; sharesChange: number };
  };
  topPosts: Array<{
    title: string;
    views: number;
    shares: number;
    engagementScore: number;
  }>;
}

/**
 * Gera um relatório em PDF com as métricas de analytics
 */
export function generateAnalyticsPDF(data: AnalyticsReportData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(0, 61, 122); // DEGASE blue
  doc.text('Relatório de Analytics', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${data.period}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 5;
  doc.text(`Gerado em: ${data.generatedAt.toLocaleDateString('pt-BR')} às ${data.generatedAt.toLocaleTimeString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Seção de Métricas Principais
  doc.setFontSize(14);
  doc.setTextColor(0, 61, 122);
  doc.text('Métricas Principais', 20, yPosition);

  yPosition += 10;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const metricsData = [
    ['Métrica', 'Valor'],
    ['Visualizações Totais', data.totalViews.toString()],
    ['Compartilhamentos Totais', data.totalShares.toString()],
    ['Taxa de Conversão', `${data.conversionRate.toFixed(2)}%`],
  ];

  (doc as any).autoTable({
    head: [metricsData[0]],
    body: metricsData.slice(1),
    startY: yPosition,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    headStyles: {
      fillColor: [0, 61, 122],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Seção de Comparação de Desempenho
  if (data.performanceComparison) {
    doc.setFontSize(14);
    doc.setTextColor(0, 61, 122);
    doc.text('Comparação de Desempenho', 20, yPosition);

    yPosition += 10;

    const comparisonData = [
      ['Métrica', 'Período Atual', 'Período Anterior', 'Variação'],
      [
        'Visualizações',
        data.performanceComparison.current.views.toString(),
        data.performanceComparison.previous.views.toString(),
        `${data.performanceComparison.comparison.viewsChange > 0 ? '+' : ''}${data.performanceComparison.comparison.viewsChange.toFixed(2)}%`,
      ],
      [
        'Compartilhamentos',
        data.performanceComparison.current.shares.toString(),
        data.performanceComparison.previous.shares.toString(),
        `${data.performanceComparison.comparison.sharesChange > 0 ? '+' : ''}${data.performanceComparison.comparison.sharesChange.toFixed(2)}%`,
      ],
    ];

    (doc as any).autoTable({
      head: [comparisonData[0]],
      body: comparisonData.slice(1),
      startY: yPosition,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      headStyles: {
        fillColor: [0, 61, 122],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Seção de Compartilhamentos por Plataforma
  if (data.sharesByPlatform && data.sharesByPlatform.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0, 61, 122);
    doc.text('Compartilhamentos por Plataforma', 20, yPosition);

    yPosition += 10;

    const platformData = [
      ['Plataforma', 'Quantidade'],
      ...data.sharesByPlatform.map((p) => [
        p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
        p.count.toString(),
      ]),
    ];

    (doc as any).autoTable({
      head: [platformData[0]],
      body: platformData.slice(1),
      startY: yPosition,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      headStyles: {
        fillColor: [0, 61, 122],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  // Seção de Top Posts
  if (data.topPosts && data.topPosts.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0, 61, 122);
    doc.text('Posts com Maior Engajamento', 20, yPosition);

    yPosition += 10;

    const postsData = [
      ['Título', 'Views', 'Shares', 'Score'],
      ...data.topPosts.slice(0, 10).map((p) => [
        p.title.substring(0, 40) + (p.title.length > 40 ? '...' : ''),
        p.views.toString(),
        p.shares.toString(),
        p.engagementScore.toString(),
      ]),
    ];

    (doc as any).autoTable({
      head: [postsData[0]],
      body: postsData.slice(1),
      startY: yPosition,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      headStyles: {
        fillColor: [0, 61, 122],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });
  }

  // Rodapé
  const totalPages = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}
