import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { eq } from "drizzle-orm";
import { mediaLibrary } from "../drizzle/schema";
import { generateAnalyticsPDF, type AnalyticsReportData } from "./pdf-generator";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  return next({ ctx });
});

const editorProcedure = protectedProcedure;

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  users: router({
    list: adminProcedure.query(async () => db.listUsers()),
    getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getUserById(input.id)),
    create: adminProcedure.input(z.object({
      openId: z.string().min(1),
      name: z.string().optional(),
      email: z.string().email().optional(),
      functionalId: z.string().optional(),
      role: z.enum(['user', 'admin', 'contributor']).default('user'),
      categoryId: z.number().optional(),
    })).mutation(async ({ input }) => {
      const existingUser = await db.getUserByOpenId(input.openId);
      if (existingUser) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Usuário com este openId já existe' });
      }
      await db.upsertUser({
        openId: input.openId,
        name: input.name || null,
        email: input.email || null,
        role: input.role,
        categoryId: input.categoryId,
      });
      return { success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      functionalId: z.string().optional(),
      role: z.enum(['user', 'admin', 'contributor']).optional(),
      categoryId: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      const user = await db.getUserById(id);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      }
      await db.updateUser(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const user = await db.getUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuario nao encontrado' });
      }
      await db.updateUser(input.id, { role: 'user' });
      return { success: true };
    }),
  }),

  categories: router({
    // Tags
    listTags: publicProcedure.query(async () => db.listTags()),
    createTag: adminProcedure.input(z.object({
      name: z.string().min(1).max(128),
      slug: z.string().optional(),
    })).mutation(async ({ input }) => {
      const slug = input.slug || slugify(input.name);
      return db.createTag({ name: input.name, slug });
    }),
    deleteTag: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteTag(input.id);
      return { success: true };
    }),

    list: publicProcedure.query(async () => db.listCategories()),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => db.getCategoryBySlug(input.slug)),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      slug: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      sortOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      const slug = input.slug || slugify(input.name);
      return db.createCategory({ ...input, slug });
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateCategory(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deleteCategory(input.id)),
  }),

  tags: router({
    list: publicProcedure.query(async () => db.listTags()),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      slug: z.string().optional(),
    })).mutation(async ({ input }) => {
      const slug = input.slug || slugify(input.name);
      return db.createTag({ ...input, slug });
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deleteTag(input.id)),
  }),

  posts: router({
    list: publicProcedure.input(z.object({
      categoryId: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    })).query(async ({ input }) => db.listPosts(input)),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => db.getPostBySlug(input.slug)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getPostById(input.id)),
    search: publicProcedure.input(z.object({ q: z.string(), limit: z.number().default(10) })).query(async ({ input }) => db.searchPosts(input.q, input.limit)),
    create: editorProcedure.input(z.object({
      title: z.string().min(1),
      slug: z.string().optional(),
      excerpt: z.string().optional(),
      content: z.string().min(1),
      featuredImage: z.string().optional(),
      categoryId: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).default('draft'),
      isFeatured: z.boolean().optional(),
      tags: z.array(z.number()).optional(),
    })).mutation(async ({ input, ctx }) => {
      const slug = input.slug || slugify(input.title);
      const post = await db.createPost({
        ...input,
        slug,
        authorId: ctx.user.id,
      });
      if (input.tags && input.tags.length > 0) {
        await db.setPostTags(post.id, input.tags);
      }
      await db.createPostHistory(post.id, {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        status: post.status,
        isFeatured: post.isFeatured,
        editorId: ctx.user.id,
        changeDescription: 'Post criado',
      });
      return post;
    }),
    update: editorProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      featuredImage: z.string().optional(),
      categoryId: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      isFeatured: z.boolean().optional(),
      tags: z.array(z.number()).optional(),
      changeDescription: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const post = await db.getPostById(input.id);
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
      if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para editar este post' });
      }
      const { id, tags, changeDescription, ...data } = input;
      const updated = await db.updatePost(id, data);
      if (tags) await db.setPostTags(id, tags);
      await db.createPostHistory(id, {
        title: updated.title,
        excerpt: updated.excerpt,
        content: updated.content,
        featuredImage: updated.featuredImage,
        status: updated.status,
        isFeatured: updated.isFeatured,
        editorId: ctx.user.id,
        changeDescription: changeDescription || 'Post atualizado',
      });
      return updated;
    }),
    delete: editorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const post = await db.getPostById(input.id);
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
      if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para deletar este post' });
      }
      return db.deletePost(input.id);
    }),
    schedule: editorProcedure.input(z.object({
      id: z.number(),
      scheduledAt: z.date(),
    })).mutation(async ({ input, ctx }) => {
      const post = await db.getPostById(input.id);
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
      if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para agendar este post' });
      }
      if (input.scheduledAt <= new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Data agendada deve ser no futuro' });
      }
      await db.schedulePost(input.id, input.scheduledAt);
      return { success: true };
    }),
    cancelSchedule: editorProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const post = await db.getPostById(input.id);
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
      if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para cancelar este agendamento' });
      }
      await db.cancelScheduledPost(input.id);
      return { success: true };
    }),
    getScheduled: editorProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === 'admin') {
        return db.listPosts({ status: 'scheduled' });
      }
      return { items: await db.getScheduledPostsForUser(ctx.user.id), total: 0 };
    }),
    saveDraft: editorProcedure.input(z.object({
      id: z.number().optional(),
      title: z.string().min(1),
      excerpt: z.string().optional(),
      content: z.string().min(1),
      featuredImage: z.string().optional(),
      categoryId: z.number().optional(),
      isFeatured: z.boolean().optional(),
      slug: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (input.id) {
        const post = await db.getPostById(input.id);
        if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
        if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para editar este post' });
        }
        const updated = await db.updatePost(input.id, {
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
          featuredImage: input.featuredImage,
          categoryId: input.categoryId,
          isFeatured: input.isFeatured,
          status: 'draft',
        });
        await db.createPostHistory(input.id, {
          title: updated.title,
          excerpt: updated.excerpt,
          content: updated.content,
          featuredImage: updated.featuredImage,
          status: 'draft',
          isFeatured: updated.isFeatured,
          editorId: ctx.user.id,
          changeDescription: 'Rascunho salvo automaticamente',
        });
        return updated;
      } else {
        const slug = input.slug || slugify(input.title);
        const post = await db.createPost({
          title: input.title,
          slug,
          excerpt: input.excerpt,
          content: input.content,
          featuredImage: input.featuredImage,
          categoryId: input.categoryId,
          isFeatured: input.isFeatured,
          status: 'draft',
          authorId: ctx.user.id,
        });
        await db.createPostHistory(post.id, {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: post.featuredImage,
          status: 'draft',
          isFeatured: post.isFeatured,
          editorId: ctx.user.id,
          changeDescription: 'Rascunho criado automaticamente',
        });
        return post;
      }
    }),
    getHistory: editorProcedure.input(z.object({ postId: z.number() })).query(async ({ input, ctx }) => {
      const post = await db.getPostById(input.postId);
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
      if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para ver o historico deste post' });
      }
      return db.getPostHistory(input.postId);
    }),
    revertToDraft: editorProcedure.input(z.object({ postId: z.number(), historyId: z.number() })).mutation(async ({ input, ctx }) => {
      const post = await db.getPostById(input.postId);
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
      if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para reverter este post' });
      }
      await db.revertPostToVersion(input.postId, input.historyId, ctx.user.id);
      return { success: true };
    }),
    recordView: publicProcedure.input(z.object({ postId: z.number() })).mutation(async ({ input }) => {
      return db.recordPostView(input.postId);
    }),
  }),

  pages: router({
    list: publicProcedure.query(async () => db.listPages()),
    getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => db.getPageBySlug(input.slug)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getPageById(input.id)),
    create: adminProcedure.input(z.object({
      title: z.string().min(1),
      slug: z.string().optional(),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      featuredImage: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().optional(),
      status: z.enum(['draft', 'published']).default('published'),
      menuLabel: z.string().optional(),
      showInMenu: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const slug = input.slug || slugify(input.title);
      const page = await db.createPage({ ...input, slug });
      await db.createPageHistory(page.id, {
        title: page.title,
        content: page.content,
        excerpt: page.excerpt,
        featuredImage: page.featuredImage,
        status: page.status,
        menuLabel: page.menuLabel,
        showInMenu: page.showInMenu,
        editorId: ctx.user.id,
        changeDescription: 'Pagina criada',
      });
      return page;
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      featuredImage: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      menuLabel: z.string().optional(),
      showInMenu: z.boolean().optional(),
      changeDescription: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, changeDescription, ...data } = input;
      const page = await db.getPageById(id);
      if (!page) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pagina nao encontrada' });
      await db.updatePage(id, data);
      const updated = { ...page, ...data };
      await db.createPageHistory(id, {
        title: updated.title || page.title,
        content: updated.content || page.content,
        excerpt: updated.excerpt || page.excerpt,
        featuredImage: updated.featuredImage || page.featuredImage,
        status: (updated.status || page.status) as 'draft' | 'published' | 'archived',
        menuLabel: updated.menuLabel || page.menuLabel,
        showInMenu: updated.showInMenu !== undefined ? updated.showInMenu : (page.showInMenu ?? false),
        editorId: ctx.user.id,
        changeDescription: changeDescription || 'Pagina atualizada',
      });
      return updated;
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deletePage(input.id)),
    saveDraftPage: adminProcedure.input(z.object({
      id: z.number().optional(),
      title: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      featuredImage: z.string().optional(),
      menuLabel: z.string().optional(),
      showInMenu: z.boolean().optional(),
      slug: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (input.id) {
        const page = await db.getPageById(input.id);
        if (!page) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pagina nao encontrada' });
        const updated = await db.updatePage(input.id, {
          title: input.title,
          content: input.content,
          excerpt: input.excerpt,
          featuredImage: input.featuredImage,
          menuLabel: input.menuLabel,
          showInMenu: input.showInMenu,
          status: 'draft',
        });
        if (!updated) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao atualizar pagina' });
        await db.createPageHistory(input.id, {
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
          featuredImage: updated.featuredImage,
          status: 'draft',
          menuLabel: updated.menuLabel,
          showInMenu: updated.showInMenu,
          editorId: ctx.user.id,
          changeDescription: 'Rascunho salvo automaticamente',
        });
        return updated;
      } else {
        const slug = input.slug || slugify(input.title);
        const page = await db.createPage({
          title: input.title,
          slug,
          content: input.content,
          excerpt: input.excerpt,
          featuredImage: input.featuredImage,
          menuLabel: input.menuLabel,
          showInMenu: input.showInMenu,
          status: 'draft',
        });
        await db.createPageHistory(page.id, {
          title: page.title,
          content: page.content,
          excerpt: page.excerpt,
          featuredImage: page.featuredImage,
          status: 'draft',
          menuLabel: page.menuLabel,
          showInMenu: page.showInMenu,
          editorId: ctx.user.id,
          changeDescription: 'Rascunho criado automaticamente',
        });
        return page;
      }
    }),
    getPageHistory: adminProcedure.input(z.object({ pageId: z.number() })).query(async ({ input }) => {
      const page = await db.getPageById(input.pageId);
      if (!page) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pagina nao encontrada' });
      return db.getPageHistory(input.pageId);
    }),
  }),

  banners: router({
    list: publicProcedure.query(async () => db.listBanners()),
    create: editorProcedure.input(z.object({
      title: z.string().min(1),
      imageUrl: z.string().min(1),
      linkUrl: z.string().optional(),
      categoryId: z.number().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const banner = await db.createBanner(input);
      return banner;
    }),
    update: editorProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      imageUrl: z.string().optional(),
      linkUrl: z.string().optional(),
      categoryId: z.number().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateBanner(id, data);
    }),
    delete: editorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deleteBanner(input.id)),
  }),

  videos: router({
    list: publicProcedure.query(async () => db.listVideos()),
    create: editorProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      youtubeUrl: z.string().min(1),
      thumbnailUrl: z.string().optional(),
      categoryId: z.number().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    })).mutation(async ({ input }) => db.createVideo(input)),
    update: editorProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      youtubeUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      categoryId: z.number().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateVideo(id, data);
    }),
    delete: editorProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deleteVideo(input.id)),
  }),

  units: router({
    list: publicProcedure.query(async () => db.listUnits()),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      type: z.enum(['internacao', 'internacao_provisoria', 'semiliberdade', 'meio_aberto']),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      visitDays: z.string().optional(),
      mapsUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => db.createUnit(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(['internacao', 'internacao_provisoria', 'semiliberdade', 'meio_aberto']).optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      visitDays: z.string().optional(),
      mapsUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateUnit(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deleteUnit(input.id)),
  }),

  transparency: router({
    list: publicProcedure.query(async () => db.listTransparencyItems()),
    create: adminProcedure.input(z.object({
      title: z.string().min(1),
      section: z.string().min(1),
      description: z.string().optional(),
      linkUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => db.createTransparencyItem(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      section: z.string().optional(),
      description: z.string().optional(),
      linkUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateTransparencyItem(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deleteTransparencyItem(input.id)),
  }),

  upload: router({
    image: editorProcedure.input(z.object({
      file: z.instanceof(Uint8Array),
      filename: z.string(),
      mimetype: z.string(),
    })).mutation(async ({ input }) => {
      const maxSize = 10 * 1024 * 1024;
      if (input.file.length > maxSize) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Arquivo muito grande. Maximo 10MB.' });
      }
      try {
        const { storagePut } = await import('./storage');
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = input.filename.split('.').pop() || 'jpg';
        const fileKey = `degase-cms/images/${timestamp}-${randomStr}.${ext}`;
        const { url } = await storagePut(fileKey, input.file, input.mimetype);
        return { url, success: true };
      } catch (error) {
        console.error('[Upload] Erro ao fazer upload:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao fazer upload da imagem' });
      }
    }),
  }),

  admin: router({
    getSiteConfig: adminProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => db.getSiteConfig(input.key)),
    getAllSiteConfig: adminProcedure.query(async () => db.getAllSiteConfig()),
    setSiteConfig: adminProcedure.input(z.object({
      key: z.string().min(1),
      value: z.string(),
      description: z.string().optional(),
    })).mutation(async ({ input }) => db.setSiteConfig(input.key, input.value, input.description)),
    listUsers: adminProcedure.query(async () => db.listUsers()),
    getUserById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getUserById(input.id)),
    updateUserRole: adminProcedure.input(z.object({
      id: z.number(),
      role: z.enum(['user', 'admin', 'contributor']),
      categoryId: z.number().optional(),
    })).mutation(async ({ input }) => db.updateUserRole(input.id, input.role, input.categoryId)),
    deleteUser: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => db.deleteUser(input.id)),
  }),

  themes: router({
    list: publicProcedure.query(async () => db.getColorThemes()),
    getActive: publicProcedure.query(async () => db.getActiveColorTheme()),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      textColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      textLightColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      surfaceColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      searchBgColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      searchTextColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      searchBorderColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    })).mutation(async ({ input }) => db.createColorTheme(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      textColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      textLightColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      surfaceColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      searchBgColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      searchTextColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      searchBorderColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateColorTheme(id, data);
      return { success: true };
    }),
    activate: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.activateColorTheme(input.id);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteColorTheme(input.id);
      return { success: true };
    }),
  }),

  history: router({
    getPostHistory: editorProcedure.input(z.object({ postId: z.number() })).query(async ({ input }) => db.getPostHistory(input.postId)),
    getPostHistoryById: editorProcedure.input(z.object({ historyId: z.number() })).query(async ({ input }) => db.getPostHistoryById(input.historyId)),
    revertPostToVersion: editorProcedure.input(z.object({
      postId: z.number(),
      historyId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const post = await db.getPostById(input.postId);
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post nao encontrado' });
      if (ctx.user.role !== 'admin' && post.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Voce nao tem permissao para reverter este post' });
      }
      await db.revertPostToVersion(input.postId, input.historyId, ctx.user.id);
      return { success: true };
    }),
    getPageHistory: editorProcedure.input(z.object({ pageId: z.number() })).query(async ({ input }) => db.getPageHistory(input.pageId)),
    getPageHistoryById: editorProcedure.input(z.object({ historyId: z.number() })).query(async ({ input }) => db.getPageHistoryById(input.historyId)),
    revertPageToVersion: adminProcedure.input(z.object({
      pageId: z.number(),
      historyId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const page = await db.getPageById(input.pageId);
      if (!page) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pagina nao encontrada' });
      await db.revertPageToVersion(input.pageId, input.historyId, ctx.user.id);
      return { success: true };
    }),
  }),

  comments: router({
    getPostComments: publicProcedure.input(z.object({ postId: z.number() })).query(async ({ input }) => db.getPostComments(input.postId, true)),
    createComment: publicProcedure.input(z.object({
      postId: z.number(),
      authorName: z.string().min(1).max(255),
      authorEmail: z.string().email(),
      content: z.string().min(1).max(5000),
    })).mutation(async ({ input }) => {
      await db.createComment({ ...input, status: 'pending' });
      return { success: true, message: 'Comentário enviado para moderação' };
    }),
    getPendingComments: adminProcedure.query(async () => db.getPendingComments()),
    approveComment: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await db.updateCommentStatus(input.id, 'approved', ctx.user.id);
      return { success: true };
    }),
    rejectComment: adminProcedure.input(z.object({ id: z.number(), reason: z.string().optional() })).mutation(async ({ input, ctx }) => {
      await db.updateCommentStatus(input.id, 'rejected', ctx.user.id, input.reason);
      return { success: true };
    }),
    deleteComment: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteComment(input.id);
      return { success: true };
    }),
  }),

  search: router({
    query: publicProcedure.input(z.object({ q: z.string() })).query(async ({ input }) => {
      if (!input.q || input.q.trim().length === 0) {
        return { posts: [], pages: [] };
      }
      return db.searchContent(input.q);
    }),
  }),

  media: router({
    getLibrary: publicProcedure.input(z.object({ limit: z.number().default(50), offset: z.number().default(0) })).query(async ({ input }) => db.getMediaLibrary(input.limit, input.offset)),
    getByType: publicProcedure.input(z.object({ fileType: z.enum(['image', 'video']), limit: z.number().default(50), offset: z.number().default(0) })).query(async ({ input }) => db.getMediaByType(input.fileType, input.limit, input.offset)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getMediaById(input.id)),
    createMedia: editorProcedure.input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      url: z.string().url(),
      fileKey: z.string(),
      fileType: z.enum(['image', 'video']),
      mimeType: z.string(),
      fileSize: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      duration: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      await db.createMediaItem({ ...input, uploadedBy: ctx.user.id });
      return { success: true };
    }),
    updateMedia: editorProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
    })).mutation(async ({ input }) => {
      await db.updateMediaItem(input.id, { title: input.title, description: input.description });
      return { success: true };
    }),
    deleteMedia: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteMediaItem(input.id);
      return { success: true };
    }),
  }),

  services: router({
    list: publicProcedure.query(async () => db.listServices(true)),
    listAll: adminProcedure.query(async () => db.listServices(false)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => db.getServiceById(input.id)),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      icon: z.string().min(1),
      link: z.string().url(),
      color: z.string().default("#0066CC"),
      sortOrder: z.number().default(0),
      isActive: z.boolean().default(true),
    })).mutation(async ({ input }) => {
      await db.createService(input);
      return { success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      icon: z.string().optional(),
      link: z.string().url().optional(),
      color: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateService(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteService(input.id);
      return { success: true };
    }),
    getAnalytics: adminProcedure.query(async () => db.getAllServicesAnalytics()),
    recordClick: publicProcedure.input(z.object({ serviceId: z.number() })).mutation(async ({ input, ctx }) => {
      const userAgent = ctx.req.headers["user-agent"];
      const referer = ctx.req.headers["referer"];
      const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress;
      
      await db.recordServiceClick(
        input.serviceId,
        userAgent as string | undefined,
        referer as string | undefined,
        ipAddress as string | undefined
      );
      return { success: true };
    })
  }),

  documentCategories: router({
    list: publicProcedure.query(async () => db.listDocumentCategories()),
    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      sortOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      const slug = slugify(input.name);
      return db.createDocumentCategory({
        name: input.name,
        slug,
        description: input.description,
        sortOrder: input.sortOrder || 0,
      });
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateDocumentCategory(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteDocumentCategory(input.id);
      return { success: true };
    }),
  }),

  documents: router({
    list: publicProcedure.query(async () => {
      const docs = await db.getDocumentsWithCategories();
      return docs.map((doc: any) => ({
        ...doc,
        document_categories: doc.category
      }));
    }),
    listByCategory: publicProcedure.input(z.object({ categoryId: z.number() })).query(async ({ input }) => db.listDocumentsByCategory(input.categoryId)),
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      categoryId: z.number().min(1),
      fileUrl: z.string().min(1),
      fileKey: z.string().min(1),
      fileSize: z.number().min(1),
      mimeType: z.string().min(1),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'contributor') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      return db.createDocument({
        name: input.name,
        description: input.description,
        categoryId: input.categoryId,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        uploadedBy: ctx.user.id,
      });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      categoryId: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'contributor') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      const { id, ...data } = input;
      return db.updateDocument(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'contributor') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      await db.deleteDocument(input.id);
      return { success: true };
    }),
    search: publicProcedure.input(z.object({ query: z.string().min(1) })).query(async ({ input }) => db.searchDocuments(input.query)),
    recordDownload: publicProcedure.input(z.object({
      documentId: z.number(),
      versionId: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      const userAgent = ctx.req.headers["user-agent"];
      const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress;
      await db.recordDocumentDownload({
        documentId: input.documentId,
        versionId: input.versionId,
        userAgent: userAgent as string | undefined,
        ipAddress: ipAddress as string | undefined,
      });
      return { success: true };
    }),
    getDownloadStats: adminProcedure.query(async () => db.getAllDocumentDownloadStats()),
    getDocumentStats: adminProcedure.input(z.object({ documentId: z.number() })).query(async ({ input }) => db.getDocumentDownloadStats(input.documentId)),
    getFeatured: publicProcedure.query(async () => db.getFeaturedDocuments()),
    getCategories: publicProcedure.query(async () => db.getDocumentCategories()),
    getFeaturedByCategory: publicProcedure.input(z.object({ categoryId: z.number().optional(), limit: z.number().default(3), offset: z.number().default(0) })).query(async ({ input }) => db.getFeaturedDocumentsByCategory(input.categoryId, input.limit, input.offset)),
    toggleFeatured: adminProcedure.input(z.object({ id: z.number(), isFeatured: z.boolean() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      return db.updateDocument(input.id, { isFeatured: input.isFeatured });
    }),
    searchAdvanced: publicProcedure.input(z.object({
      query: z.string().optional(),
      categoryId: z.number().optional(),
      minSize: z.number().optional(),
      maxSize: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    })).query(async ({ input }) => db.searchDocumentsAdvanced(input)),
    getRecent: publicProcedure.query(async () => db.getRecentDocuments()),
    getMostDownloaded: publicProcedure.query(async () => db.getMostDownloadedDocuments()),
    updateOrder: adminProcedure.input(z.object({
      documentId: z.number(),
      sortOrder: z.number(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      await db.updateDocumentOrder(input.documentId, input.sortOrder);
      return { success: true };
    }),
    reorderFeatured: adminProcedure.input(z.object({
      orders: z.array(z.object({
        id: z.number(),
        sortOrder: z.number(),
      })),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      await db.reorderFeaturedDocuments(input.orders);
      return { success: true };
    }),
    getFeaturedOrdered: publicProcedure.query(async () => db.getFeaturedDocumentsOrdered()),
    updateName: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      return db.updateDocument(input.id, { name: input.name });
    }),
  }),

  documentVersions: router({
    list: publicProcedure.input(z.object({ documentId: z.number() })).query(async ({ input }) => db.getDocumentVersions(input.documentId)),
    create: protectedProcedure.input(z.object({
      documentId: z.number(),
      fileUrl: z.string().min(1),
      fileKey: z.string().min(1),
      fileSize: z.number().min(1),
      mimeType: z.string().min(1),
      changeDescription: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'contributor') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }
      const versionNumber = await db.getNextVersionNumber(input.documentId);
      return db.createDocumentVersion({
        documentId: input.documentId,
        versionNumber,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        uploadedBy: ctx.user.id,
        changeDescription: input.changeDescription,
      });
    }),
  }),

  pageBlocks: router({
    list: publicProcedure.input(z.object({ pageId: z.number() })).query(async ({ input }) => db.getPageBlocks(input.pageId)),
    create: protectedProcedure.input(z.object({
      pageId: z.number(),
      blockType: z.enum(["services", "documentCategories", "images", "text", "html"]),
      title: z.string().optional(),
      description: z.string().optional(),
      config: z.any().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.createPageBlock({
        pageId: input.pageId,
        blockType: input.blockType,
        title: input.title,
        description: input.description,
        config: input.config,
        sortOrder: 0,
      });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      config: z.any().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.updatePageBlock(input.id, {
        title: input.title,
        description: input.description,
        config: input.config,
      });
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.deletePageBlock(input.id);
    }),
  }),

  pageBlockItems: router({
    list: publicProcedure.input(z.object({ blockId: z.number() })).query(async ({ input }) => db.getPageBlockItems(input.blockId)),
    create: protectedProcedure.input(z.object({
      blockId: z.number(),
      itemType: z.enum(["service", "documentCategory", "image"]),
      itemId: z.number().optional(),
      customData: z.any().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.createPageBlockItem({
        blockId: input.blockId,
        itemType: input.itemType,
        itemId: input.itemId,
        customData: input.customData,
        sortOrder: 0,
      });
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.deletePageBlockItem(input.id);
    }),
  }),

  imagesBank: router({
    list: publicProcedure.input(z.object({ limit: z.number().default(100), offset: z.number().default(0) })).query(async ({ input }) => db.getImagesBank(input.limit, input.offset)),
    getBySourceType: publicProcedure.input(z.object({ sourceType: z.string() })).query(async ({ input }) => db.getImagesBySourceType(input.sourceType)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.deleteImageFromBank(input.id);
    }),
  }),

  menu: router({
    list: publicProcedure.query(async () => db.getMenuItems()),
    hierarchy: publicProcedure.query(async () => db.getMenuItemsHierarchy()),
    create: protectedProcedure.input(z.object({
      label: z.string().min(1),
      linkType: z.enum(["internal", "external"]).optional(),
      internalPageId: z.number().optional(),
      externalUrl: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().default(0),
      openInNewTab: z.boolean().default(false),
      isColumnTitle: z.boolean().default(false),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      
      if (!input.isColumnTitle && !input.linkType) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "linkType obrigatorio" });
      }
      
      if (!input.isColumnTitle) {
        if (input.linkType === "internal" && !input.internalPageId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Pagina obrigatoria" });
        }
        if (input.linkType === "external" && !input.externalUrl) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "URL obrigatoria" });
        }
      }
      
      return db.createMenuItem({
        label: input.label,
        linkType: input.linkType || "internal",
        internalPageId: input.internalPageId,
        externalUrl: input.externalUrl,
        parentId: input.parentId || null,
        sortOrder: input.sortOrder,
        openInNewTab: input.openInNewTab,
        isColumnTitle: input.isColumnTitle,
        isActive: true,
      });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      label: z.string().optional(),
      linkType: z.enum(["internal", "external"]).optional(),
      internalPageId: z.number().optional(),
      externalUrl: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().optional(),
      openInNewTab: z.boolean().optional(),
      isColumnTitle: z.boolean().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const { id, ...data } = input;
      return db.updateMenuItem(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.deleteMenuItem(input.id);
    }),
    reorder: protectedProcedure.input(z.object({
      items: z.array(z.object({
        id: z.number(),
        parentId: z.number().nullable(),
        sortOrder: z.number(),
      })),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return db.updateMenuItemOrder(input.items);
    }),
  }),

  analytics: router({
    getMetrics: publicProcedure.input(z.object({
      range: z.enum(["7days", "30days", "90days", "all"]).default("30days"),
    })).query(async ({ input }) => {
      const metrics = await db.getAnalyticsMetrics(input.range);
      return metrics;
    }),
    getTopPosts: publicProcedure.input(z.object({
      limit: z.number().default(10),
    })).query(async ({ input }) => {
      const posts = await db.getTopPostsByViews(input.limit);
      return posts;
    }),
    getEngagementTrend: publicProcedure.input(z.object({
      range: z.enum(["7days", "30days", "90days", "all"]).default("30days"),
    })).query(async ({ input }) => {
      const trend = await db.getEngagementTrend(input.range);
      return trend;
    }),
   }),

  postsRouter: router({
    recordViewWithLimit: publicProcedure.input(z.object({
      postId: z.number(),
      ipAddress: z.string(),
    })).mutation(async ({ input }) => {
      const success = await db.recordPostViewWithLimit(input.postId, input.ipAddress);
      return { success };
    }),
    getTrendingPosts: publicProcedure.input(z.object({
      days: z.number().default(7),
      limit: z.number().default(5),
    })).query(async ({ input }) => {
      const posts = await db.getTrendingPosts(input.days, input.limit);
      return posts;
    }),
    getPostEngagementTrend: publicProcedure.input(z.object({
      postId: z.number(),
      days: z.number().default(7),
    })).query(async ({ input }) => {
      const trend = await db.getPostEngagementTrend(input.postId, input.days);
      return trend;
    }),
  }),

  socialShares: router({
    recordShare: publicProcedure.input(z.object({
      postId: z.number(),
      platform: z.enum(["whatsapp", "facebook", "twitter"]),
      ipAddress: z.string(),
      userAgent: z.string().optional(),
    })).mutation(async ({ input }) => {
      await db.recordSocialShare(input.postId, input.platform, input.ipAddress, input.userAgent);
      return { success: true };
    }),
    getShareStats: publicProcedure.input(z.object({
      postId: z.number(),
    })).query(async ({ input }) => {
      const stats = await db.getSocialShareStats(input.postId);
      return stats;
    }),
    getMostShared: publicProcedure.input(z.object({
      limit: z.number().default(5),
    })).query(async ({ input }) => {
      const posts = await db.getMostSharedPosts(input.limit);
      return posts;
    }),
  }),

  advancedAnalytics: router({
    getSharesByPlatform: publicProcedure.input(z.object({
      days: z.number().default(30),
    })).query(async ({ input }) => {
      const shares = await db.getSharesByPlatform(input.days);
      return shares;
    }),
    getConversionRate: publicProcedure.input(z.object({
      days: z.number().default(30),
    })).query(async ({ input }) => {
      const rate = await db.getConversionRate(input.days);
      return rate;
    }),
    getPerformanceComparison: publicProcedure.input(z.object({
      currentDays: z.number().default(30),
      previousDays: z.number().default(30),
    })).query(async ({ input }) => {
      const comparison = await db.getPerformanceComparison(input.currentDays, input.previousDays);
      return comparison;
    }),
    getTopPostsByEngagement: publicProcedure.input(z.object({
      days: z.number().default(30),
      limit: z.number().default(10),
    })).query(async ({ input }) => {
      const posts = await db.getTopPostsByEngagement(input.days, input.limit);
      return posts;
    }),
    getEngagementByDay: publicProcedure.input(z.object({
      days: z.number().default(30),
    })).query(async ({ input }) => {
      const data = await db.getEngagementByDay(input.days);
      return data;
    }),
  }),

  reports: router({
    exportAnalyticsPDF: adminProcedure.input(z.object({
      period: z.string().default('Últimos 30 dias'),
      days: z.number().default(30),
    })).query(async ({ input }) => {
      try {
        // Coletar todos os dados necessários
        const sharesByPlatform = await db.getSharesByPlatform(input.days);
        const conversionRate = await db.getConversionRate(input.days);
        const performanceComparison = await db.getPerformanceComparison(input.days, input.days);
        const topPosts = await db.getTopPostsByEngagement(input.days, 10);

        const perfComp = performanceComparison || { current: { views: 0, shares: 0 }, previous: { views: 0, shares: 0 }, comparison: { viewsChange: 0, sharesChange: 0 } };
        
        const reportData: AnalyticsReportData = {
          period: input.period,
          generatedAt: new Date(),
          totalViews: conversionRate.totalViews,
          totalShares: conversionRate.totalShares,
          conversionRate: conversionRate.conversionRate,
          sharesByPlatform: sharesByPlatform || [],
          performanceComparison: perfComp as any,
          topPosts: (topPosts || []).map(p => ({
            title: p.title || 'Sem título',
            views: p.views || 0,
            shares: p.shares || 0,
            engagementScore: p.engagementScore || 0,
          })),
        };

        // Gerar PDF
        const pdfBuffer = generateAnalyticsPDF(reportData);
        const base64 = pdfBuffer.toString('base64');

        return {
          success: true,
          data: base64,
          filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`,
        };
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao gerar relatório em PDF',
        });
      }
    }),
  }),
});
export type AppRouter = typeof appRouter;
