import { useParams, Link } from "wouter";
import { useEffect } from "react";
import { ArrowLeft, Calendar, Eye, Tag, User } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function NewsDetail() {
  const params = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.posts.getBySlug.useQuery({ slug: params.slug || "" });
  const recordViewMutation = trpc.posts.recordView.useMutation();

  useEffect(() => {
    if (post?.id) {
      recordViewMutation.mutate({ postId: post.id });
    }
  }, [post?.id, recordViewMutation]);

  const { data: tags } = trpc.posts.getTags.useQuery(
    { postId: post?.id ?? 0 },
    { enabled: !!post?.id }
  );

  if (isLoading) {
    return (
      <main id="main-content" className="py-8">
        <div className="container max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main id="main-content" className="py-16 text-center">
        <div className="container">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Notícia não encontrada</h1>
          <Link href="/noticias" className="text-blue-600 hover:underline">Voltar para notícias</Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="py-8">
      <div className="container max-w-4xl">
        <Link href="/noticias" className="inline-flex items-center gap-1 text-sm mb-6 hover:underline" style={{ color: "var(--degase-blue-light)" }}>
          <ArrowLeft size={16} /> Voltar para notícias
        </Link>

        <article>
          {post.featuredImage && (
            <img src={post.featuredImage} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-6" />
          )}

          <h1 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: "var(--degase-blue-dark)" }}>
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(post.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {post.viewCount} visualizações
            </span>
            {post.authorId && (
              <span className="flex items-center gap-1">
                <User size={14} />
                Responsável: <AuthorName authorId={post.authorId} />
              </span>
            )}
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: any) => (
                <span key={tag.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-50" style={{ color: "var(--degase-blue-dark)" }}>
                  <Tag size={10} /> {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="prose-degase" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>
    </main>
  );
}

function AuthorName({ authorId }: { authorId: number }) {
  const { data: user } = trpc.users.getById.useQuery({ id: authorId });
  return <span>{user?.name || user?.email || "Desconhecido"}</span>;
}
