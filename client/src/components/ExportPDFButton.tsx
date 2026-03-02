import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ExportPDFButtonProps {
  period: string;
  days: number;
}

export function ExportPDFButton({ period, days }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const exportMutation = trpc.reports.exportAnalyticsPDF.useQuery(
    { period, days },
    { enabled: false }
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Executar a query manualmente
      const result = await exportMutation.refetch();
      
      if (result.data?.data) {
        // Decodificar base64 para blob
        const binaryString = atob(result.data.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });

        // Criar link de download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.filename || `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert('Relatório exportado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar relatório em PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
      style={{
        backgroundColor: isExporting ? '#ccc' : 'var(--degase-blue-dark)',
        color: 'white',
      }}
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download size={16} />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
