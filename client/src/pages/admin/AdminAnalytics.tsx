import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Eye, MessageSquare, Share2 } from "lucide-react";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<"30days" | "7days" | "90days" | "all">("30days");

  const { data: analytics, isLoading } = trpc.analytics.getMetrics.useQuery({ range: dateRange });
  const { data: topPosts } = trpc.analytics.getTopPosts.useQuery({ limit: 10 });
  const { data: engagementData } = trpc.analytics.getEngagementTrend.useQuery({ range: dateRange });

  const COLORS = ["#003d7a", "#d4af37", "#1e5a96", "#f0ad4e", "#5cb85c"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>
          Análise de Dados
        </h1>
        <p className="text-gray-600 mt-2">
          Visualize métricas de engajamento, posts populares e tendências
        </p>
      </div>

      {/* Filtro de Data */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
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

      {isLoading ? (
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




          </div>

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

          {/* Posts Mais Populares */}
          {topPosts && topPosts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Posts Mais Populares</CardTitle>
                    <CardDescription>Top 10 posts por visualizações</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    const csv = "Título,Visualizações\n" + topPosts.map((p: any) => `\"${p.title}\",${p.views}`).join("\n");
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
