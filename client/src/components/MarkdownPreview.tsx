import { useState } from "react";
import { Eye, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Simples renderizador de Markdown
  const renderMarkdown = (md: string) => {
    let html = md;

    // Títulos
    html = html.replace(/^### (.*?)$/gm, "<h3 className='text-lg font-bold mt-4 mb-2'>$1</h3>");
    html = html.replace(/^## (.*?)$/gm, "<h2 className='text-xl font-bold mt-4 mb-2'>$1</h2>");
    html = html.replace(/^# (.*?)$/gm, "<h1 className='text-2xl font-bold mt-4 mb-2'>$1</h1>");

    // Negrito
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");

    // Itálico
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.+?)_/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">$1</a>');

    // Imagens
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" className="max-w-full h-auto rounded-lg my-2" />');

    // Quebras de linha
    html = html.replace(/\n\n/g, "</p><p>");
    html = `<p>${html}</p>`;

    // Listas
    html = html.replace(/^- (.*?)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*?<\/li>)/s, "<ul className='list-disc list-inside ml-4'>$1</ul>");

    return html;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={!showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPreview(false)}
          className="flex items-center gap-1"
        >
          <Code size={14} /> Editar
        </Button>
        <Button
          type="button"
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1"
        >
          <Eye size={14} /> Pré-visualizar
        </Button>
      </div>

      {showPreview ? (
        <div className="w-full p-4 border rounded-md bg-white text-gray-900 prose prose-sm max-w-none overflow-auto h-64">
          <div
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            className="space-y-2 text-sm leading-relaxed"
          />
        </div>
      ) : null}
    </div>
  );
}
