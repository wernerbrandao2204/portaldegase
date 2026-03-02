import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Eye, Share2, ArrowUp, ArrowDown } from "lucide-react";
import { ExportPDFButton } from "@/components/ExportPDFButton";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<"30days" | "7days" | "90days" | "all">("30days");
  const [comparisonDays, setComparisonDays] = useState<30 | 7 | 14>(30);

  // Queries existentes
  const { data: analytics, isLoading } = trpc.analytics.getMetrics.useQuery({ range: dateRange });
  const { data: topPosts } = trpc.analytics.getTopPosts.useQuery({ limit: 10 });
  const { data: engagementData } = trpc.analytics.getEngagementTrend.useQuery({ range: dateRange });

  // Novas queries de analytics avançadas
  const { data: sharesByPlatform } = trpc.advancedAnalytics.getSharesByPlatform.useQuery({ days: 30 });
  const { data: conversionRate } = trpc.advancedAnalytics.getConversionRate.useQuery({ days: 30 });
  const { data: performanceComparison } = trpc.advancedAnalytics.getPerformanceComparison.useQuery({
    currentDays: comparisonDays,
    previousDays: comparisonDays,
  });
  const { data: topEngagement } = trpc.advancedAnalytics.getTopPostsByEngagement.useQuery({ days: 30, limit: 10 });
  const { data: engagementByDay } = trpc.advancedAnalytics.getEngagementByDay.useQuery({ days: 30 });

  const COLORS = ["#003d7a", "#d4af37", "#1e5a96", "#f0ad4e", "#5cb85c"];
  const PLATFORM_COLORS: Record<string, string> = {
    whatsapp: "#25D366",
    facebook: "#1877F2",
    twitter: "#1DA1F2",
  };

  const isLoading_ = isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>
          Análise de Dados Avançada
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize métricas detalhadas de engajamento, compartilhamentos e desempenho
        </p>
      </div>

      {/* Filtro de Data e Exportação */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Período</CardTitle>
            <ExportPDFButton period={`Últimos ${comparisonDays} dias`} days={comparisonDays} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: "7days", label: "Últimos 7 dias" },
              { value: "30days", label: "Últimos 30 dias" },
              { value: "90days", label: "Últimos 90 dias" },
              { value: "all", label: "Todos os tempos" },
            ].map(option => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? "default" : "outline"}
                onClick={() => setDateRange(option.value as "30days" | "7days" | "90days" | "all")}
                style={dateRange === option.value ? { backgroundColor: "var(--degase-blue-dark)" } : {}}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading_ ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--degase-blue-dark)" }} />
        </div>
      ) : (
        <>
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye size={16} style={{ color: "var(--degase-blue-dark)" }} />
                  Visualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>
                  {analytics?.totalViews || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  +{analytics?.viewsGrowth || 0}% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Share2 size={16} style={{ color: "#d4af37" }} />
                  Compartilhamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: "#d4af37" }}>
                  {conversionRate?.totalShares || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Taxa de conversão: {conversionRate?.conversionRate || 0}%
                </p>
              </CardContent>
            </Card>

            {performanceComparison && performanceComparison.comparison && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp size={16} style={{ color: "#5cb85c" }} />
                      Variação de Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold" style={{ color: "#5cb85c" }}>
                        {(performanceComparison.comparison.viewsChange ?? 0) > 0 ? "+" : ""}
                        {performanceComparison.comparison.viewsChange ?? 0}%
                      </div>
                      {(performanceComparison.comparison.viewsChange ?? 0) > 0 ? (
                        <ArrowUp size={20} style={{ color: "#5cb85c" }} />
                      ) : (
                        <ArrowDown size={20} style={{ color: "#dc3545" }} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      vs período anterior
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Share2 size={16} style={{ color: "#1e5a96" }} />
                      Variação de Shares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold" style={{ color: "#1e5a96" }}>
                        {(performanceComparison.comparison.sharesChange ?? 0) > 0 ? "+" : ""}
                        {performanceComparison.comparison.sharesChange ?? 0}%
                      </div>
                      {(performanceComparison.comparison.sharesChange ?? 0) > 0 ? (
                        <ArrowUp size={20} style={{ color: "#5cb85c" }} />
                      ) : (
                        <ArrowDown size={20} style={{ color: "#dc3545" }} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      vs período anterior
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Gráfico de Engajamento por Dia */}
          {engagementByDay && engagementByDay.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Engajamento Diário</CardTitle>
                <CardDescription>Visualizações e compartilhamentos ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="var(--degase-blue-dark)" strokeWidth={2} />
                    <Line type="monotone" dataKey="shares" stroke="#d4af37" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Compartilhamentos por Plataforma */}
          {sharesByPlatform && sharesByPlatform.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Compartilhamentos por Plataforma</CardTitle>
                <CardDescription>Distribuição de compartilhamentos nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sharesByPlatform}
                        dataKey="count"
                        nameKey="platform"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {sharesByPlatform.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {sharesByPlatform.map((platform) => (
                      <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PLATFORM_COLORS[platform.platform] || "#999" }}
                          />
                          <span className="capitalize font-medium">{platform.platform}</span>
                        </div>
                        <span className="text-lg font-bold">{platform.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Engajamento */}
          {engagementData && engagementData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Engajamento</CardTitle>
                <CardDescription>Visualizações, comentários e compartilhamentos ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="var(--degase-blue-dark)" />
                    <Line type="monotone" dataKey="comments" stroke="var(--degase-gold)" />
                    <Line type="monotone" dataKey="shares" stroke="#1e5a96" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Posts com Maior Engajamento */}
          {topEngagement && topEngagement.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Posts com Maior Engajamento</CardTitle>
                <CardDescription>Ranking de posts por engajamento combinado (views + shares)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topEngagement.slice(0, 5).map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <h4 className="font-semibold text-sm truncate">{post.title}</h4>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>👁️ {post.views || 0} views</span>
                          <span>📤 {post.shares || 0} shares</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: "var(--degase-blue-dark)" }}>
                          {post.engagementScore || 0}
                        </div>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts Mais Populares */}
          {topPosts && topPosts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Posts Mais Visualizados</CardTitle>
                    <CardDescription>Top 10 posts por visualizações</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    const csv = "Título,Visualizações\n" + topPosts.map((p: any) => `"${p.title}",${p.views}`).join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `analytics-posts-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}>
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPosts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="var(--degase-blue-dark)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
