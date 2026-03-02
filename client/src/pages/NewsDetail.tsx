import { useParams, Link } from "wouter";
import { useEffect, useRef } from "react";
import { ArrowLeft, Calendar, Eye, Tag, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import Breadcrumb from "@/components/Breadcrumb";

export default function NewsDetail() {
  const params = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.posts.getBySlug.useQuery({ slug: params.slug || "" });
  const recordViewMutation = trpc.posts.recordView.useMutation();
  const hasRecordedView = useRef(false);

  useEffect(() => {
    if (post?.id && !hasRecordedView.current) {
      hasRecordedView.current = true;
      recordViewMutation.mutate({ postId: post.id });
    }
  }, [post?.id]);

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
    <>
      <Breadcrumb
        items={[
          { label: "Notícias", href: "/noticias" },
          { label: post.title, current: true },
        ]}
      />
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



          <div className="prose-degase" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="mt-8 pt-6 border-t">
            <SocialShareButtons
              postId={post.id}
              postTitle={post.title}
              postUrl={typeof window !== 'undefined' ? window.location.href : ''}
            />
          </div>
        </article>
      </div>
    </main>
    </>
  );
}

function AuthorName({ authorId }: { authorId: number }) {
  const { data: user } = trpc.users.getById.useQuery({ id: authorId });
  return <span>{user?.name || user?.email || "Desconhecido"}</span>;
}
