import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Menu, Settings, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminIntranet() {
  const [intranetConfig, setIntranetConfig] = useState({
    title: "DEGASE Intranet",
    description: "Área restrita para colaboradores e usuários autorizados",
    backgroundColor: "#2d5a4a",
    accentColor: "#1a3a2e",
    showBanners: true,
    showNews: true,
    showVideos: true,
    showDocuments: true,
    showServices: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: string, value: any) => {
    setIntranetConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Aqui você faria a chamada para salvar as configurações
      // await trpc.admin.setIntranetConfig.mutateAsync(intranetConfig);
      toast.success("Configurações da Intranet salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento da Intranet</h1>
        <p className="text-gray-600 mt-2">Configure a aparência e o conteúdo da Intranet</p>
      </div>

      <div className="grid gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Configurações Gerais
            </CardTitle>
            <CardDescription>Informações básicas da Intranet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título da Intranet</label>
              <Input
                value={intranetConfig.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="DEGASE Intranet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={intranetConfig.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descrição da Intranet..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Identidade Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={20} />
              Identidade Visual
            </CardTitle>
            <CardDescription>Cores e aparência da Intranet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cor de Fundo Principal</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={intranetConfig.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    className="h-10 w-20 cursor-pointer border border-gray-300 rounded"
                  />
                  <Input
                    value={intranetConfig.backgroundColor}
                    onChange={(e) => handleChange("backgroundColor", e.target.value)}
                    placeholder="#2d5a4a"
                    className="flex-1"
                  />
                </div>
                <div
                  className="mt-2 h-20 rounded-lg border-2"
                  style={{ backgroundColor: intranetConfig.backgroundColor }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cor de Destaque</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={intranetConfig.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="h-10 w-20 cursor-pointer border border-gray-300 rounded"
                  />
                  <Input
                    value={intranetConfig.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    placeholder="#1a3a2e"
                    className="flex-1"
                  />
                </div>
                <div
                  className="mt-2 h-20 rounded-lg border-2"
                  style={{ backgroundColor: intranetConfig.accentColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seções Visíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Seções Visíveis
            </CardTitle>
            <CardDescription>Escolha quais seções exibir na Intranet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "showBanners", label: "Banners" },
                { key: "showNews", label: "Notícias" },
                { key: "showVideos", label: "Vídeos" },
                { key: "showDocuments", label: "Documentos" },
                { key: "showServices", label: "Serviços" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={intranetConfig[item.key as keyof typeof intranetConfig] as boolean}
                    onChange={(e) => handleChange(item.key, e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu da Intranet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Menu size={20} />
              Menu da Intranet
            </CardTitle>
            <CardDescription>Gerencie os itens do menu da Intranet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
              <p className="text-sm text-blue-700">
                O menu da Intranet exibe automaticamente links para: Início, Notícias, Documentos, Vídeos e Serviços (baseado nas seções ativas acima).
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Itens do Menu Padrão:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Início (/intranet)</li>
                <li>✓ Notícias (/intranet/noticias)</li>
                <li>✓ Documentos (/intranet/documentos)</li>
                <li>✓ Vídeos (/intranet/videos)</li>
                <li>✓ Serviços (/intranet/servicos)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Acesso */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso à Intranet</CardTitle>
            <CardDescription>Informações sobre quem pode acessar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="font-medium text-green-800 mb-1">✓ Usuários com Perfil "Usuário"</p>
                <p className="text-green-700">Serão redirecionados automaticamente para a Intranet após o login.</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="font-medium text-blue-800 mb-1">✓ Administradores e Contribuidores</p>
                <p className="text-blue-700">Podem acessar a Intranet através do link /intranet, além do painel administrativo.</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="font-medium text-yellow-800 mb-1">✓ Usuários Não Autenticados</p>
                <p className="text-yellow-700">Serão redirecionados para a página inicial do portal ao tentar acessar /intranet.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            style={{ backgroundColor: "var(--degase-blue-dark)" }}
            className="text-white"
          >
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
