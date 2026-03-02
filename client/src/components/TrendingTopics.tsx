import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, TrendingUp } from 'lucide-react';

export function TrendingTopics() {
  const [selectedDays, setSelectedDays] = useState<7 | 30 | 90>(7);

  // Buscar posts em trending
  const { data: trendingPosts, isLoading: isLoadingTrending } = trpc.postsRouter.getTrendingPosts.useQuery({
    days: selectedDays,
    limit: 5,
  });

  // Buscar posts mais compartilhados
  const { data: mostSharedPosts, isLoading: isLoadingShared } = trpc.socialShares.getMostShared.useQuery({
    limit: 5,
  });

  const isLoading = isLoadingTrending || isLoadingShared;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Notícias em Destaque</CardTitle>
                <CardDescription>Conteúdo mais visualizado e compartilhado</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trending">Mais Visualizadas</TabsTrigger>
              <TabsTrigger value="shared">Mais Compartilhadas</TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <div className="flex gap-2">
                  {[7, 30, 90].map((days) => (
                    <button
                      key={days}
                      onClick={() => setSelectedDays(days as 7 | 30 | 90)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        selectedDays === days
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {days} dias
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : trendingPosts && trendingPosts.length > 0 ? (
                <div className="space-y-3">
                  {trendingPosts.map((post, index) => (
                    <a
                      key={post.id}
                      href={`/noticias/${post.slug}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            {post.category && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {post.category.name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 truncate">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-medium">{post.viewCount || 0}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma notícia visualizada neste período
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : mostSharedPosts && mostSharedPosts.length > 0 ? (
                <div className="space-y-3">
                  {mostSharedPosts.map((post, index) => (
                    <a
                      key={post.id}
                      href={`/noticias/${post.slug}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 truncate">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">{post.shareCount || 0}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma notícia compartilhada ainda
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
