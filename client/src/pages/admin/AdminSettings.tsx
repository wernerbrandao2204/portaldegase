import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Database, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LogoUploadField } from "@/components/LogoUploadField";
import { FaviconUploadField } from "@/components/FaviconUploadField";

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [backupFormat, setBackupFormat] = useState<'sql' | 'csv' | 'xlsx'>('sql');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: "",
    siteDescription: "",
    footerText: "",
    contactEmail: "",
    contactPhone: "",
    favicon: "",
    logo: "",
    emailDomains: "",
  });

  const getAllConfig = trpc.admin.getAllSiteConfig.useQuery();
  const setSiteConfig = trpc.admin.setSiteConfig.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      getAllConfig.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const getBackupMutation = trpc.admin.getDatabaseDump.useMutation({
    onSuccess: (data) => {
      let mimeType = 'text/plain';
      if (backupFormat === 'csv') mimeType = 'text/csv';
      if (backupFormat === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      const blob = new Blob([data.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Backup gerado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar backup: ${error.message}`);
    },
  });

  useEffect(() => {
    if (getAllConfig.data) {
      const configMap: Record<string, string> = {};
      getAllConfig.data.forEach((item) => {
        configMap[item.configKey] = item.configValue || "";
      });
      setSettings({
        siteTitle: configMap["siteTitle"] || "",
        siteDescription: configMap["siteDescription"] || "",
        footerText: configMap["footerText"] || "",
        contactEmail: configMap["contactEmail"] || "",
        contactPhone: configMap["contactPhone"] || "",
        favicon: configMap["favicon"] || "",
        logo: configMap["logo"] || "",
        emailDomains: configMap["emailDomains"] || "",
      });
    }
  }, [getAllConfig.data]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configKeys = Object.keys(settings) as (keyof typeof settings)[];
      for (const key of configKeys) {
        await setSiteConfig.mutateAsync({
          key,
          value: settings[key],
          description: `Configuração: ${key}`,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (getAllConfig.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Portal</h1>
        <p className="text-gray-600 mt-2">Gerencie as configurações gerais do site DEGASE</p>
      </div>

      <div className="grid gap-6">
        {/* Site Identity */}
        <Card>
          <CardHeader>
            <CardTitle>Identidade do Portal</CardTitle>
            <CardDescription>Título, descrição e branding do site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Portal</label>
              <Input
                value={settings.siteTitle}
                onChange={(e) => handleChange("siteTitle", e.target.value)}
                placeholder="DEGASE - Departamento Geral de Ações Socioeducativas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição do Portal</label>
              <Textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange("siteDescription", e.target.value)}
                placeholder="Descrição breve do portal..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Logo do Portal</label>
              <LogoUploadField value={settings.logo} onChange={(url) => handleChange("logo", url)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Favicon do Portal</label>
              <FaviconUploadField value={settings.favicon} onChange={(url) => handleChange("favicon", url)} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>Dados de contato exibidos no site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email de Contato</label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                placeholder="contato@degase.rj.gov.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone de Contato</label>
              <Input
                value={settings.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                placeholder="(21) 2534-5000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle>Rodapé</CardTitle>
            <CardDescription>Texto exibido no rodapé do site</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">Texto do Rodapé</label>
              <Textarea
                value={settings.footerText}
                onChange={(e) => handleChange("footerText", e.target.value)}
                placeholder="Texto do rodapé..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Domains */}
        <Card>
          <CardHeader>
            <CardTitle>Domínios de E-mail Aceitos</CardTitle>
            <CardDescription>Especifique quais domínios de e-mail são aceitos para cadastro de usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">Domínios (um por linha)</label>
              <Textarea
                value={settings.emailDomains}
                onChange={(e) => handleChange("emailDomains", e.target.value)}
                placeholder="rj.gov.br\ndegase.rj.gov.br\nnovodegase.rj.gov.br"
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Deixe em branco para aceitar qualquer domínio. Digite um domínio por linha (ex: rj.gov.br).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Database Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} />
              Banco de Dados
            </CardTitle>
            <CardDescription>Gerencie o backup e a manutenção do banco de dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                O backup gera um arquivo SQL contendo todas as tabelas e dados do portal. 
                Recomenda-se realizar backups periódicos antes de grandes alterações.
              </p>
            </div>
            <Button 
              onClick={() => getBackupMutation.mutate()} 
              disabled={getBackupMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              {getBackupMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Baixar Backup SQL (.sql)
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || setSiteConfig.isPending}
            style={{ backgroundColor: "var(--degase-blue-dark)" }}
          >
            {isSaving || setSiteConfig.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
