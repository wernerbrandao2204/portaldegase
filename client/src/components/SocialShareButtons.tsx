import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Facebook, Twitter } from 'lucide-react';

interface SocialShareButtonsProps {
  postId: number;
  postTitle: string;
  postUrl: string;
}

export function SocialShareButtons({ postId, postTitle, postUrl }: SocialShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);

  // Mutation para registrar compartilhamento
  const recordShareMutation = trpc.socialShares.recordShare.useMutation();

  // Obter IP do usuário (simulado - em produção seria do servidor)
  const getClientIp = () => {
    // Isso é uma simplificação - em produção, você deve obter o IP do servidor
    return 'client-ip';
  };

  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'twitter') => {
    setIsSharing(true);

    try {
      // Registrar compartilhamento no banco de dados
      await recordShareMutation.mutateAsync({
        postId,
        platform,
        ipAddress: getClientIp(),
        userAgent: navigator.userAgent,
      });

      // Construir URL de compartilhamento
      const encodedUrl = encodeURIComponent(postUrl);
      const encodedTitle = encodeURIComponent(postTitle);

      let shareUrl = '';

      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
          break;
      }

      // Abrir janela de compartilhamento
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        const platformName = platform === 'whatsapp' ? 'WhatsApp' : platform === 'facebook' ? 'Facebook' : 'Twitter';
        alert(`Notícia compartilhada no ${platformName}`);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Não foi possível registrar o compartilhamento');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-gray-600">Compartilhar:</span>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('whatsapp')}
          disabled={isSharing}
          className="gap-2"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          disabled={isSharing}
          className="gap-2"
          title="Compartilhar no Facebook"
        >
          <Facebook className="h-4 w-4" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          disabled={isSharing}
          className="gap-2"
          title="Compartilhar no Twitter"
        >
          <Twitter className="h-4 w-4" />
          <span className="hidden sm:inline">Twitter</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(postUrl);
            alert('Link copiado para a área de transferência');
          }}
          className="gap-2"
          title="Copiar link"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Copiar</span>
        </Button>
      </div>
    </div>
  );
}
