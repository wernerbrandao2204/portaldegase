import { eq, like, or, desc, asc, and, sql, inArray, ilike, gte, lte, getTableColumns, isNull, gt, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  categories, InsertCategory,
  tags, InsertTag,
  posts, InsertPost,
  postTags, InsertPostTag,
  pages, InsertPage,
  banners, InsertBanner,
  videos, InsertVideo,
  transparencyItems, InsertTransparencyItem,
  units, InsertUnit,
  siteConfig, InsertSiteConfig,
  postHistory, InsertPostHistory,
  pageHistory, InsertPageHistory,
  comments, InsertComment,
  mediaLibrary, InsertMediaLibrary,
  colorThemes, InsertColorTheme,
  services, InsertService,
  serviceAnalytics, InsertServiceAnalytics,
  serviceClickLog, InsertServiceClickLog,
  documents, InsertDocument,
  documentCategories, InsertDocumentCategory,
  documentVersions, InsertDocumentVersion,
  documentDownloads, InsertDocumentDownload,
  documentDownloadStats, InsertDocumentDownloadStats,
  pageBlocks, InsertPageBlock,
  pageBlockItems, InsertPageBlockItem,
  imagesBank, InsertImagesBank,
  menuItems, InsertMenuItem,
  postViewLimits, InsertPostViewLimit,
  socialShares, InsertSocialShare,
  passwordResetTokens, InsertPasswordResetToken,
  auditLogs, InsertAuditLog,
  menuAccessPermissions, InsertMenuAccessPermission,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set(data).where(eq(users.id, id));
  return db.select().from(users).where(eq(users.id, id)).limit(1).then(r => r[0]);
}

// ==================== CATEGORIES ====================
export async function listCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(categories).values(data);
  return result[0].insertId;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ==================== TAGS ====================
export async function listTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tags).orderBy(asc(tags.name));
}

export async function createTag(data: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(tags).values(data);
  return result[0].insertId;
}

export async function deleteTag(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(postTags).where(eq(postTags.tagId, id));
  await db.delete(tags).where(eq(tags.id, id));
}

// ==================== POSTS ====================
export async function listPosts(opts: { status?: string; categoryId?: number; limit?: number; offset?: number; search?: string; featured?: boolean; visibility?: string } = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const conditions = [];
  if (opts.status) conditions.push(eq(posts.status, opts.status as any));
  if (opts.categoryId) conditions.push(eq(posts.categoryId, opts.categoryId));
  if (opts.featured) conditions.push(eq(posts.isFeatured, true));
  if (opts.visibility) conditions.push(inArray(posts.visibility, opts.visibility === "both" ? ["both", "site", "intranet"] : [opts.visibility, "both"]));
  if (opts.search) {
    const searchLower = opts.search.toLowerCase();
    conditions.push(or(
      ilike(posts.title, `%${searchLower}%`),
      ilike(posts.content, `%${searchLower}%`)
    ));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [items, countResult] = await Promise.all([
    db.select().from(posts).where(where).orderBy(desc(posts.publishedAt), desc(posts.createdAt)).limit(opts.limit ?? 20).offset(opts.offset ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(posts).where(where),
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}

export async function getPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return result[0];
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0];
}

export async function createPost(data: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(posts).values(data);
  const postId = result[0].insertId;
  // Retornar o post criado
  const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  return post[0];
}

export async function updatePost(id: number, data: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(posts).set(data).where(eq(posts.id, id));
  // Retornar o post atualizado
  const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return post[0];
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(postTags).where(eq(postTags.postId, id));
  await db.delete(posts).where(eq(posts.id, id));
}

export async function incrementPostViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(posts).set({ viewCount: sql`${posts.viewCount} + 1` }).where(eq(posts.id, id));
}

// ==================== POST TAGS ====================
export async function setPostTags(postId: number, tagIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (tagIds.length > 0) {
    await db.insert(postTags).values(tagIds.map(tagId => ({ postId, tagId })));
  }
}

export async function getPostTags(postId: number) {
  const db = await getDb();
  if (!db) return [];
  const pts = await db.select().from(postTags).where(eq(postTags.postId, postId));
  if (pts.length === 0) return [];
  const tagIds = pts.map(pt => pt.tagId);
  return db.select().from(tags).where(inArray(tags.id, tagIds));
}

// ==================== PAGES ====================
export async function listPages(opts: { status?: string; showInMenu?: boolean } = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts.status) conditions.push(eq(pages.status, opts.status as any));
  if (opts.showInMenu !== undefined) conditions.push(eq(pages.showInMenu, opts.showInMenu));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(pages).where(where).orderBy(asc(pages.sortOrder));
}

export async function getPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return result[0];
}

export async function getPageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  return result[0];
}

export async function createPage(data: InsertPage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(pages).values(data);
  const pageId = result[0].insertId as number;
  const page = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
  return page[0];
}

export async function updatePage(id: number, data: Partial<InsertPage>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(pages).set(data).where(eq(pages.id, id));
  return getPageById(id);
}

export async function deletePage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(pages).where(eq(pages.id, id));
}

// ==================== BANNERS ====================
export async function listBanners(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const where = activeOnly ? eq(banners.isActive, true) : undefined;
  return db.select().from(banners).where(where).orderBy(asc(banners.sortOrder));
}

export async function createBanner(data: InsertBanner) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(banners).values(data);
  return result[0].insertId;
}

export async function updateBanner(id: number, data: Partial<InsertBanner>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(banners).set(data).where(eq(banners.id, id));
}

export async function deleteBanner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(banners).where(eq(banners.id, id));
}

// ==================== VIDEOS ====================
export async function listVideos(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const where = activeOnly ? eq(videos.isActive, true) : undefined;
  return db.select().from(videos).where(where).orderBy(asc(videos.sortOrder));
}

export async function createVideo(data: InsertVideo) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(videos).values(data);
  return result[0].insertId;
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(videos).set(data).where(eq(videos.id, id));
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(videos).where(eq(videos.id, id));
}

// ==================== TRANSPARENCY ====================
export async function listTransparencyItems(section?: string) {
  const db = await getDb();
  if (!db) return [];
  const where = section ? and(eq(transparencyItems.section, section), eq(transparencyItems.isActive, true)) : eq(transparencyItems.isActive, true);
  return db.select().from(transparencyItems).where(where).orderBy(asc(transparencyItems.sortOrder));
}

export async function createTransparencyItem(data: InsertTransparencyItem) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(transparencyItems).values(data);
  return result[0].insertId;
}

export async function updateTransparencyItem(id: number, data: Partial<InsertTransparencyItem>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(transparencyItems).set(data).where(eq(transparencyItems.id, id));
}

export async function deleteTransparencyItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(transparencyItems).where(eq(transparencyItems.id, id));
}

// ==================== UNITS ====================
export async function listUnits(type?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(units.isActive, true)];
  if (type) conditions.push(eq(units.type, type as any));
  return db.select().from(units).where(and(...conditions)).orderBy(asc(units.sortOrder), asc(units.name));
}

export async function createUnit(data: InsertUnit) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(units).values(data);
  return result[0].insertId;
}

export async function updateUnit(id: number, data: Partial<InsertUnit>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(units).set(data).where(eq(units.id, id));
}

export async function deleteUnit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(units).where(eq(units.id, id));
}

// ==================== SITE CONFIG ====================
export async function getSiteConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteConfig).where(eq(siteConfig.configKey, key)).limit(1);
  return result[0]?.configValue;
}

export async function setSiteConfig(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(siteConfig).values({ configKey: key, configValue: value, description }).onDuplicateKeyUpdate({ set: { configValue: value } });
}

export async function getAllSiteConfig() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteConfig);
}

// ==================== SEARCH ====================
export async function searchContent(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return { posts: [], pages: [] };
  const searchLower = query.toLowerCase();
  const searchTerm = `%${searchLower}%`;
  const [postResults, pageResults] = await Promise.all([
    db.select().from(posts).where(and(eq(posts.status, "published"), or(ilike(posts.title, searchTerm), ilike(posts.content, searchTerm)))).orderBy(desc(posts.publishedAt)).limit(limit),
    db.select().from(pages).where(and(eq(pages.status, "published"), or(ilike(pages.title, searchTerm), ilike(pages.content, searchTerm)))).orderBy(asc(pages.sortOrder)).limit(limit),
  ]);
  return { posts: postResults, pages: pageResults };
}

// ==================== USERS MANAGEMENT ====================
export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.createdAt);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(id: number, role: string, categoryId?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set({ role: role as any, categoryId }).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(users).where(eq(users.id, id));
}

export async function updateUserPassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, id));
}

// ===== POST HISTORY FUNCTIONS =====

export async function createPostHistory(
  postId: number,
  post: Omit<InsertPostHistory, 'postId'>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(postHistory).values({
    ...post,
    postId,
  } as InsertPostHistory);
}

export async function getPostHistory(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(postHistory)
    .where(eq(postHistory.postId, postId))
    .orderBy(desc(postHistory.createdAt));
}

export async function getPostHistoryById(historyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(postHistory)
    .where(eq(postHistory.id, historyId))
    .limit(1);

  return result[0];
}

export async function revertPostToVersion(postId: number, historyId: number, editorId?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the version to revert to
  const version = await getPostHistoryById(historyId);
  if (!version || version.postId !== postId) {
    throw new Error("Version not found");
  }

  // Create a new history entry before reverting (backup current state)
  const currentPost = await getPostById(postId);
  if (currentPost) {
    await createPostHistory(postId, {
      title: currentPost.title,
      excerpt: currentPost.excerpt,
      content: currentPost.content,
      featuredImage: currentPost.featuredImage,
      status: currentPost.status,
      isFeatured: currentPost.isFeatured,
      editorId,
      changeDescription: `Revertido para versão de ${version.createdAt.toLocaleDateString("pt-BR")}`,
    });
  }

  // Revert the post to the selected version
  await db.update(posts).set({
    title: version.title,
    excerpt: version.excerpt,
    content: version.content,
    featuredImage: version.featuredImage,
    status: version.status,
    isFeatured: version.isFeatured,
    updatedAt: new Date(),
  }).where(eq(posts.id, postId));
}

// ===== PAGE HISTORY FUNCTIONS =====

export async function createPageHistory(
  pageId: number,
  page: Omit<InsertPageHistory, 'pageId'>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pageHistory).values({
    ...page,
    pageId,
  } as InsertPageHistory);
}

export async function getPageHistory(pageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(pageHistory)
    .where(eq(pageHistory.pageId, pageId))
    .orderBy(desc(pageHistory.createdAt));
}

export async function getPageHistoryById(historyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(pageHistory)
    .where(eq(pageHistory.id, historyId))
    .limit(1);

  return result[0];
}

export async function revertPageToVersion(pageId: number, historyId: number, editorId?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the version to revert to
  const version = await getPageHistoryById(historyId);
  if (!version || version.pageId !== pageId) {
    throw new Error("Version not found");
  }

  // Create a new history entry before reverting (backup current state)
  const currentPage = await getPageById(pageId);
  if (currentPage) {
    await createPageHistory(pageId, {
      title: currentPage.title,
      content: currentPage.content,
      excerpt: currentPage.excerpt,
      featuredImage: currentPage.featuredImage,
      status: currentPage.status,
      menuLabel: currentPage.menuLabel,
      showInMenu: currentPage.showInMenu,
      editorId,
      changeDescription: `Revertido para versão de ${version.createdAt.toLocaleDateString("pt-BR")}`,
    });
  }

  // Revert the page to the selected version
  await db.update(pages).set({
    title: version.title,
    content: version.content,
    excerpt: version.excerpt,
    featuredImage: version.featuredImage,
    status: version.status,
    menuLabel: version.menuLabel,
    showInMenu: version.showInMenu,
    updatedAt: new Date(),
  }).where(eq(pages.id, pageId));
}


// ==================== AGENDAMENTO DE POSTS ====================
export async function schedulePost(postId: number, scheduledAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.update(posts).set({
    status: 'scheduled',
    scheduledAt,
    isScheduled: true,
    updatedAt: new Date(),
  }).where(eq(posts.id, postId));
}

export async function getScheduledPosts() {
  const db = await getDb();
  if (!db) return [];
  
  // Retorna posts agendados cuja data de publicação é menor ou igual a agora
  return db.select().from(posts).where(
    and(
      eq(posts.status, 'scheduled'),
      eq(posts.isScheduled, true),
      sql`${posts.scheduledAt} <= NOW()`
    )
  ).orderBy(asc(posts.scheduledAt));
}

export async function publishScheduledPost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.update(posts).set({
    status: 'published',
    publishedAt: new Date(),
    isScheduled: false,
    updatedAt: new Date(),
  }).where(eq(posts.id, postId));
}

export async function cancelScheduledPost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.update(posts).set({
    status: 'draft',
    scheduledAt: null,
    isScheduled: false,
    updatedAt: new Date(),
  }).where(eq(posts.id, postId));
}

export async function getScheduledPostsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(posts).where(
    and(
      eq(posts.authorId, userId),
      eq(posts.isScheduled, true)
    )
  ).orderBy(asc(posts.scheduledAt));
}


// ==================== TEMAS DE CORES ====================
export async function createColorTheme(theme: InsertColorTheme) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  const result = await db.insert(colorThemes).values(theme);
  return result;
}

export async function getColorThemes() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(colorThemes).orderBy(desc(colorThemes.createdAt));
}

export async function getActiveColorTheme() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(colorThemes).where(eq(colorThemes.isActive, true)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateColorTheme(id: number, theme: Partial<InsertColorTheme>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.update(colorThemes).set({
    ...theme,
    updatedAt: new Date(),
  }).where(eq(colorThemes.id, id));
}

export async function activateColorTheme(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  // Desativar todos os outros temas
  await db.update(colorThemes).set({ isActive: false });
  
  // Ativar o tema selecionado
  await db.update(colorThemes).set({ isActive: true }).where(eq(colorThemes.id, id));
}

export async function deleteColorTheme(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.delete(colorThemes).where(eq(colorThemes.id, id));
}


// ==================== COMENTÁRIOS ====================
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  const result = await db.insert(comments).values(comment);
  return result;
}

export async function getPostComments(postId: number, onlyApproved = true) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(comments.postId, postId)];
  if (onlyApproved) {
    conditions.push(eq(comments.status, 'approved'));
  }
  return db.select().from(comments).where(and(...conditions)).orderBy(desc(comments.createdAt));
}

export async function getPendingComments() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(comments).where(eq(comments.status, 'pending')).orderBy(desc(comments.createdAt));
}

export async function updateCommentStatus(id: number, status: 'approved' | 'rejected' | 'spam', moderatedBy: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.update(comments).set({
    status,
    moderatedBy,
    moderationReason: reason,
    updatedAt: new Date(),
  }).where(eq(comments.id, id));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.delete(comments).where(eq(comments.id, id));
}

// ==================== MÍDIA ====================
export async function createMediaItem(media: InsertMediaLibrary) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  const result = await db.insert(mediaLibrary).values(media);
  return result;
}

export async function getMediaLibrary(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(mediaLibrary).orderBy(desc(mediaLibrary.createdAt)).limit(limit).offset(offset);
}

export async function getMediaByType(fileType: 'image' | 'video', limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(mediaLibrary).where(eq(mediaLibrary.fileType, fileType)).orderBy(desc(mediaLibrary.createdAt)).limit(limit).offset(offset);
}

export async function getMediaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateMediaItem(id: number, media: Partial<InsertMediaLibrary>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.update(mediaLibrary).set({
    ...media,
    updatedAt: new Date(),
  }).where(eq(mediaLibrary.id, id));
}

export async function deleteMediaItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
}


// ==================== BUSCA ====================
export async function searchPosts(query: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const searchLower = query.toLowerCase();
  const searchTerm = `%${searchLower}%`;
  return db.select().from(posts)
    .where(
      and(
        or(
          ilike(posts.title, searchTerm),
          ilike(posts.content, searchTerm),
          ilike(posts.excerpt, searchTerm)
        ),
        eq(posts.status, 'published')
      )
    )
    .limit(limit)
    .orderBy(desc(posts.createdAt));
}


export async function addTagToPost(postId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.insert(postTags).values({ postId, tagId }).onDuplicateKeyUpdate({ set: {} });
}

export async function removeTagFromPost(postId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.delete(postTags).where(and(eq(postTags.postId, postId), eq(postTags.tagId, tagId)));
}


export async function getPostsByTag(tagId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({ post: posts }).from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(and(eq(postTags.tagId, tagId), eq(posts.status, 'published')))
    .limit(limit)
    .orderBy(desc(posts.createdAt));
  
  return result.map(r => r.post);
}


// ==================== SERVIÇOS ====================
export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  const result = await db.insert(services).values(service);
  return result;
}

export async function listServices(activeOnly = true, visibility?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (activeOnly) conditions.push(eq(services.isActive, true));
  if (visibility) conditions.push(inArray(services.visibility, visibility === "both" ? ["both", "site", "intranet"] : [visibility, "both"]));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(services).where(where).orderBy(asc(services.sortOrder));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateService(id: number, service: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.update(services).set({
    ...service,
    updatedAt: new Date(),
  }).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  await db.delete(services).where(eq(services.id, id));
}


// ==================== SERVICE ANALYTICS ====================
export async function recordServiceClick(serviceId: number, userAgent?: string, referer?: string, ipAddress?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  // Registrar click no log detalhado
  await db.insert(serviceClickLog).values({
    serviceId,
    userAgent,
    referer,
    ipAddress,
  });
  
  // Atualizar ou criar registro de analytics
  const existing = await db.select().from(serviceAnalytics).where(eq(serviceAnalytics.serviceId, serviceId)).limit(1);
  
  if (existing.length > 0) {
    await db.update(serviceAnalytics)
      .set({
        clickCount: (existing[0].clickCount || 0) + 1,
        lastClickedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(serviceAnalytics.serviceId, serviceId));
  } else {
    await db.insert(serviceAnalytics).values({
      serviceId,
      clickCount: 1,
      lastClickedAt: new Date(),
    });
  }
}

export async function getServiceAnalytics(serviceId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(serviceAnalytics).where(eq(serviceAnalytics.serviceId, serviceId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllServicesAnalytics() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    service: services,
    analytics: serviceAnalytics,
  })
  .from(services)
  .leftJoin(serviceAnalytics, eq(services.id, serviceAnalytics.serviceId))
  .orderBy(desc(serviceAnalytics.clickCount));
}

export async function getServiceClickStats(serviceId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const analytics = await getServiceAnalytics(serviceId);
  if (!analytics) return null;
  
  // Contar clicks nos últimos 7 dias
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentClicks = await db.select({ count: sql`COUNT(*)` })
    .from(serviceClickLog)
    .where(and(
      eq(serviceClickLog.serviceId, serviceId),
      gte(serviceClickLog.clickedAt, sevenDaysAgo)
    ));
  
  return {
    totalClicks: analytics.clickCount,
    recentClicks: recentClicks[0]?.count || 0,
    lastClickedAt: analytics.lastClickedAt,
  };
}


// ==================== DOCUMENT CATEGORIES ====================
export async function listDocumentCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documentCategories).where(eq(documentCategories.isActive, true)).orderBy(asc(documentCategories.sortOrder));
}

export async function createDocumentCategory(data: InsertDocumentCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documentCategories).values(data);
  const id = result[0].insertId;
  return db.select().from(documentCategories).where(eq(documentCategories.id, Number(id))).limit(1).then(r => r[0]);
}

export async function updateDocumentCategory(id: number, data: Partial<InsertDocumentCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documentCategories).set(data).where(eq(documentCategories.id, id));
  return db.select().from(documentCategories).where(eq(documentCategories.id, id)).limit(1).then(r => r[0]);
}

export async function deleteDocumentCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documentCategories).where(eq(documentCategories.id, id));
}

// ==================== DOCUMENTS ====================
export async function listDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.isActive, true)).orderBy(desc(documents.createdAt));
}

export async function listDocumentsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents)
    .where(and(eq(documents.categoryId, categoryId), eq(documents.isActive, true)))
    .orderBy(desc(documents.createdAt));
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  const id = result[0].insertId;
  return db.select().from(documents).where(eq(documents.id, Number(id))).limit(1).then(r => r[0]);
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documents).set(data).where(eq(documents.id, id));
  return db.select().from(documents).where(eq(documents.id, id)).limit(1).then(r => r[0]);
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDocumentsWithCategories() {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    ...getTableColumns(documents),
    category: {
      id: documentCategories.id,
      name: documentCategories.name,
      description: documentCategories.description,
    }
  })
    .from(documents)
    .innerJoin(documentCategories, eq(documents.categoryId, documentCategories.id))
    .where(and(eq(documents.isActive, true), eq(documentCategories.isActive, true)))
    .orderBy(asc(documentCategories.sortOrder), desc(documents.createdAt));
  return results;
}


// ==================== DOCUMENT VERSIONS ====================
export async function createDocumentVersion(data: InsertDocumentVersion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documentVersions).values(data);
  const id = result[0].insertId;
  return db.select().from(documentVersions).where(eq(documentVersions.id, Number(id))).limit(1).then(r => r[0]);
}

export async function getDocumentVersions(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documentVersions).where(eq(documentVersions.documentId, documentId)).orderBy(desc(documentVersions.versionNumber));
}

export async function getLatestDocumentVersion(documentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.versionNumber))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getNextVersionNumber(documentId: number) {
  const db = await getDb();
  if (!db) return 1;
  const result = await db.select({ maxVersion: sql<number>`MAX(${documentVersions.versionNumber})` })
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId));
  const maxVersion = result[0]?.maxVersion || 0;
  return maxVersion + 1;
}

// ==================== DOCUMENT DOWNLOADS ====================
export async function recordDocumentDownload(data: InsertDocumentDownload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(documentDownloads).values(data);
  
  // Atualizar estatísticas
  const stats = await db.select().from(documentDownloadStats)
    .where(eq(documentDownloadStats.documentId, data.documentId))
    .limit(1);
  
  if (stats.length > 0) {
    await db.update(documentDownloadStats)
      .set({ totalDownloads: sql`totalDownloads + 1`, lastDownloadedAt: new Date() })
      .where(eq(documentDownloadStats.documentId, data.documentId));
  } else {
    await db.insert(documentDownloadStats).values({
      documentId: data.documentId,
      totalDownloads: 1,
      lastDownloadedAt: new Date(),
    });
  }
}

export async function getDocumentDownloadStats(documentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(documentDownloadStats)
    .where(eq(documentDownloadStats.documentId, documentId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllDocumentDownloadStats() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documentDownloadStats).orderBy(desc(documentDownloadStats.totalDownloads));
}

export async function getDocumentDownloadsCount(documentId: number, days?: number) {
  const db = await getDb();
  if (!db) return 0;
  
  let whereConditions: any[] = [eq(documentDownloads.documentId, documentId)];
  
  if (days) {
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    whereConditions.push(gte(documentDownloads.downloadedAt, daysAgo));
  }
  
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(documentDownloads)
    .where(and(...whereConditions));
  
  return result[0]?.count || 0;
}

export async function searchDocuments(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;
  return db.select().from(documents)
    .where(and(
      or(
        ilike(documents.name, searchPattern),
        ilike(documents.description, searchPattern)
      ),
      eq(documents.isActive, true)
    ))
    .orderBy(desc(documents.createdAt));
}


export async function getFeaturedDocuments(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    ...getTableColumns(documents),
    category: {
      id: documentCategories.id,
      name: documentCategories.name,
    }
  })
    .from(documents)
    .leftJoin(documentCategories, eq(documents.categoryId, documentCategories.id))
    .where(and(
      eq(documents.isFeatured, true),
      eq(documents.isActive, true)
    ))
    .orderBy(asc(documents.sortOrder), desc(documents.createdAt))
    .limit(limit);
}


export async function searchDocumentsAdvanced(filters: {
  query?: string;
  categoryId?: number;
  minSize?: number;
  maxSize?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [eq(documents.isActive, true)];
  
  if (filters.query) {
    const searchPattern = `%${filters.query}%`;
    conditions.push(or(
      ilike(documents.name, searchPattern),
      ilike(documents.description, searchPattern)
    ));
  }
  
  if (filters.categoryId) {
    conditions.push(eq(documents.categoryId, filters.categoryId));
  }
  
  if (filters.minSize !== undefined) {
    conditions.push(gte(documents.fileSize, filters.minSize));
  }
  
  if (filters.maxSize !== undefined) {
    conditions.push(lte(documents.fileSize, filters.maxSize));
  }
  
  if (filters.startDate) {
    conditions.push(gte(documents.createdAt, filters.startDate));
  }
  
  if (filters.endDate) {
    conditions.push(lte(documents.createdAt, filters.endDate));
  }
  
  return db.select().from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt));
}

export async function getRecentDocuments(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(documents)
    .where(eq(documents.isActive, true))
    .orderBy(desc(documents.createdAt))
    .limit(limit);
}

export async function getMostDownloadedDocuments(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    ...getTableColumns(documents),
    downloadCount: documentDownloadStats.totalDownloads,
  })
    .from(documents)
    .leftJoin(documentDownloadStats, eq(documents.id, documentDownloadStats.documentId))
    .where(eq(documents.isActive, true))
    .orderBy(desc(documentDownloadStats.totalDownloads))
    .limit(limit);
}


// ==================== DOCUMENT ORDER ====================
export async function updateDocumentOrder(documentId: number, sortOrder: number): Promise<void> {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot update document order: database not available"); return; }
  try {
    await db.update(documents)
      .set({ sortOrder })
      .where(eq(documents.id, documentId));
  } catch (error) {
    console.error("[Database] Error updating document order:", error);
    throw error;
  }
}

export async function reorderFeaturedDocuments(documentOrders: Array<{ id: number; sortOrder: number }>): Promise<void> {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot reorder documents: database not available"); return; }
  try {
    for (const { id, sortOrder } of documentOrders) {
      await db.update(documents)
        .set({ sortOrder })
        .where(eq(documents.id, id));
    }
  } catch (error) {
    console.error("[Database] Error reordering documents:", error);
    throw error;
  }
}

export async function getFeaturedDocumentsOrdered(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    ...getTableColumns(documents),
    category: {
      id: documentCategories.id,
      name: documentCategories.name,
    }
  })
    .from(documents)
    .innerJoin(documentCategories, eq(documents.categoryId, documentCategories.id))
    .where(and(eq(documents.isFeatured, true), eq(documents.isActive, true)))
    .orderBy(asc(documents.sortOrder))
    .limit(limit);
}


// ==================== PAGE BLOCKS ====================
export async function createPageBlock(data: InsertPageBlock) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pageBlocks).values(data);
  const id = result[0].insertId;
  return db.select().from(pageBlocks).where(eq(pageBlocks.id, Number(id))).limit(1).then(r => r[0]);
}

export async function getPageBlocks(pageId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageBlocks)
    .where(eq(pageBlocks.pageId, pageId))
    .orderBy(asc(pageBlocks.sortOrder));
}

export async function updatePageBlock(id: number, data: Partial<InsertPageBlock>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pageBlocks).set(data).where(eq(pageBlocks.id, id));
  return db.select().from(pageBlocks).where(eq(pageBlocks.id, id)).limit(1).then(r => r[0]);
}

export async function deletePageBlock(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(pageBlocks).where(eq(pageBlocks.id, id));
}

export async function reorderPageBlocks(pageId: number, blockIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < blockIds.length; i++) {
    await db.update(pageBlocks).set({ sortOrder: i }).where(eq(pageBlocks.id, blockIds[i]));
  }
  return getPageBlocks(pageId);
}

// ==================== PAGE BLOCK ITEMS ====================
export async function createPageBlockItem(data: InsertPageBlockItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pageBlockItems).values(data);
  const id = result[0].insertId;
  return db.select().from(pageBlockItems).where(eq(pageBlockItems.id, Number(id))).limit(1).then(r => r[0]);
}

export async function getPageBlockItems(blockId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageBlockItems)
    .where(eq(pageBlockItems.blockId, blockId))
    .orderBy(asc(pageBlockItems.sortOrder));
}

export async function deletePageBlockItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(pageBlockItems).where(eq(pageBlockItems.id, id));
}

export async function reorderPageBlockItems(blockId: number, itemIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < itemIds.length; i++) {
    await db.update(pageBlockItems).set({ sortOrder: i }).where(eq(pageBlockItems.id, itemIds[i]));
  }
  return getPageBlockItems(blockId);
}

// ==================== IMAGES BANK ====================
export async function createImageInBank(data: InsertImagesBank) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(imagesBank).values(data);
  const id = result[0].insertId;
  return db.select().from(imagesBank).where(eq(imagesBank.id, Number(id))).limit(1).then(r => r[0]);
}

export async function getImagesBank(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(imagesBank)
    .orderBy(desc(imagesBank.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getImagesBySourceType(sourceType: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(imagesBank)
    .where(eq(imagesBank.sourceType, sourceType as any))
    .orderBy(desc(imagesBank.createdAt));
}

export async function deleteImageFromBank(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(imagesBank).where(eq(imagesBank.id, id));
}


// Menu Items
export async function getMenuItems() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(menuItems).orderBy(menuItems.parentId, menuItems.sortOrder);
}

export async function getMenuItemsHierarchy() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const items = await db.select().from(menuItems).orderBy(menuItems.parentId, menuItems.sortOrder);
  
  const itemsMap = new Map();
  const rootItems: any[] = [];

  items.forEach(item => {
    itemsMap.set(item.id, { ...item, children: [] });
  });

  items.forEach(item => {
    if (item.parentId === null) {
      rootItems.push(itemsMap.get(item.id));
    } else {
      const parent = itemsMap.get(item.parentId);
      if (parent) {
        parent.children.push(itemsMap.get(item.id));
      }
    }
  });

  return rootItems;
}

export async function createMenuItem(data: InsertMenuItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(menuItems).values(data);
  return result;
}

export async function updateMenuItem(id: number, data: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(menuItems).set(data).where(eq(menuItems.id, id));
  return await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(menuItems).where(eq(menuItems.id, id));
}

export async function updateMenuItemOrder(items: Array<{ id: number; parentId: number | null; sortOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const item of items) {
    await db.update(menuItems)
      .set({ parentId: item.parentId, sortOrder: item.sortOrder })
      .where(eq(menuItems.id, item.id));
  }
}


// ==================== ANALYTICS ====================

export async function getAnalyticsMetrics(range: "7days" | "30days" | "90days" | "all") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  let startDate = new Date();
  
  if (range === "7days") startDate.setDate(now.getDate() - 7);
  else if (range === "30days") startDate.setDate(now.getDate() - 30);
  else if (range === "90days") startDate.setDate(now.getDate() - 90);
  else startDate = new Date(0);
  
  // Get service analytics
  const serviceAnalyticsData = await db
    .select()
    .from(serviceAnalytics)
    .where(range === "all" ? undefined : gte(serviceAnalytics.createdAt, startDate));
  
  const totalClicks = serviceAnalyticsData.reduce((sum, item) => sum + (item.clickCount || 0), 0);
  
  return {
    totalViews: totalClicks || 0,
    totalClicks: totalClicks || 0,
    viewsGrowth: 12, // Placeholder
    clicksGrowth: 8, // Placeholder
    averageEngagement: totalClicks > 0 ? 5 : 0,
  };
}

export async function getTopPostsByViews(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const topServices = await db
    .select({
      id: services.id,
      title: services.name,
      clicks: sql<number>`COALESCE(SUM(${serviceAnalytics.clickCount}), 0)`,
    })
    .from(services)
    .leftJoin(serviceAnalytics, eq(services.id, serviceAnalytics.serviceId))
    .groupBy(services.id, services.name)
    .orderBy(desc(sql<number>`COALESCE(SUM(${serviceAnalytics.clickCount}), 0)`))
    .limit(limit);
  
  return topServices;
}

export async function getEngagementTrend(range: "7days" | "30days" | "90days" | "all") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  let startDate = new Date();
  
  if (range === "7days") startDate.setDate(now.getDate() - 7);
  else if (range === "30days") startDate.setDate(now.getDate() - 30);
  else if (range === "90days") startDate.setDate(now.getDate() - 90);
  else startDate = new Date(0);
  
  const data = await db
    .select({
      date: sql<string>`DATE(${serviceAnalytics.createdAt})`,
      clicks: sql<number>`COALESCE(SUM(${serviceAnalytics.clickCount}), 0)`,
    })
    .from(serviceAnalytics)
    .where(range === "all" ? undefined : gte(serviceAnalytics.createdAt, startDate))
    .groupBy(sql<string>`DATE(${serviceAnalytics.createdAt})`)
    .orderBy(asc(sql<string>`DATE(${serviceAnalytics.createdAt})`))
  
  return data.map(item => ({
    date: item.date || new Date().toISOString().split('T')[0],
    views: item.clicks || 0,
    clicks: item.clicks || 0,
  }));
}



export async function recordPostView(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const post = await db.select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  
  if (!post || post.length === 0) throw new Error("Post not found");
  
  await db.update(posts)
    .set({ viewCount: (post[0].viewCount || 0) + 1 })
    .where(eq(posts.id, postId));
  
  return { success: true };
}


export async function getDocumentCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(documentCategories)
    .where(eq(documentCategories.isActive, true))
    .orderBy(asc(documentCategories.sortOrder));
}

export async function getFeaturedDocumentsByCategory(categoryId?: number, limit: number = 3, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(documents.isActive, true)
  ];
  
  if (categoryId) {
    conditions.push(eq(documents.categoryId, categoryId));
  }
  
  return db.select({
    ...getTableColumns(documents),
    category: {
      id: documentCategories.id,
      name: documentCategories.name,
    }
  })
    .from(documents)
    .leftJoin(documentCategories, eq(documents.categoryId, documentCategories.id))
    .where(and(...conditions))
    .orderBy(asc(documents.sortOrder), desc(documents.createdAt))
    .limit(limit)
    .offset(offset);
}


// ==================== RATE LIMITING PARA VISUALIZAÇÕES ====================
/**
 * Verifica se o IP já visualizou o post nas últimas 24 horas
 */
export async function hasViewedInLast24Hours(postId: number, ipAddress: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await db.select()
    .from(postViewLimits)
    .where(
      and(
        eq(postViewLimits.postId, postId),
        eq(postViewLimits.ipAddress, ipAddress),
        gte(postViewLimits.viewedAt, twentyFourHoursAgo)
      )
    )
    .limit(1);
  
  return result.length > 0;
}

/**
 * Registra a visualização com rate limiting (1 por IP em 24h)
 */
export async function recordPostViewWithLimit(postId: number, ipAddress: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    // Verifica se já visualizou nas últimas 24h
    const hasViewed = await hasViewedInLast24Hours(postId, ipAddress);
    
    if (hasViewed) {
      return false; // Não registra visualização
    }
    
    // Registra a visualização
    await db.insert(postViewLimits).values({
      postId,
      ipAddress,
    });
    
    // Incrementa o contador de visualizações do post
    const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (post.length > 0) {
      await db.update(posts)
        .set({ viewCount: (post[0].viewCount || 0) + 1 })
        .where(eq(posts.id, postId));
    }
    
    return true; // Visualização registrada com sucesso
  } catch (error) {
    console.error("[Database] Failed to record post view with limit:", error);
    return false;
  }
}

// ==================== TRENDING TOPICS ====================
/**
 * Obtém os posts mais visualizados dos últimos 7 dias
 */
export async function getTrendingPosts(days: number = 7, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return db.select({
    ...getTableColumns(posts),
    author: {
      id: users.id,
      name: users.name,
    },
    category: {
      id: categories.id,
      name: categories.name,
    },
  })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(
      and(
        eq(posts.status, 'published'),
        gte(posts.publishedAt, startDate)
      )
    )
    .orderBy(desc(posts.viewCount))
    .limit(limit);
}

/**
 * Obtém estatísticas de engajamento por período para um post específico
 */
export async function getPostEngagementTrend(postId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return { viewsByDay: [], sharesByDay: [] };
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  // Agrupa visualizações por dia
  const viewsByDay = await db.select({
    date: sql<string>`DATE(${postViewLimits.viewedAt})`,
    count: sql<number>`COUNT(*)`,
  })
    .from(postViewLimits)
    .where(
      and(
        eq(postViewLimits.postId, postId),
        gte(postViewLimits.viewedAt, startDate)
      )
    )
    .groupBy(sql`DATE(${postViewLimits.viewedAt})`)
    .orderBy(asc(sql`DATE(${postViewLimits.viewedAt})`));
  
  // Agrupa compartilhamentos por dia
  const sharesByDay = await db.select({
    date: sql<string>`DATE(${socialShares.sharedAt})`,
    count: sql<number>`COUNT(*)`,
  })
    .from(socialShares)
    .where(
      and(
        eq(socialShares.postId, postId),
        gte(socialShares.sharedAt, startDate)
      )
    )
    .groupBy(sql`DATE(${socialShares.sharedAt})`)
    .orderBy(asc(sql`DATE(${socialShares.sharedAt})`))
  
  return { viewsByDay, sharesByDay };
}

// ==================== SOCIAL SHARES ====================
/**
 * Registra um compartilhamento em rede social
 */
export async function recordSocialShare(postId: number, platform: string, ipAddress: string, userAgent?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  
  try {
    await db.insert(socialShares).values({
      postId,
      platform,
      ipAddress,
      userAgent: userAgent || undefined,
    });
  } catch (error) {
    console.error("[Database] Failed to record social share:", error);
    throw error;
  }
}

/**
 * Obtém estatísticas de compartilhamento para um post
 */
export async function getSocialShareStats(postId: number) {
  const db = await getDb();
  if (!db) return { total: 0, byPlatform: {} };
  
  const shares = await db.select({
    platform: socialShares.platform,
    count: sql<number>`COUNT(*)`,
  })
    .from(socialShares)
    .where(eq(socialShares.postId, postId))
    .groupBy(socialShares.platform);
  
  const byPlatform: Record<string, number> = {};
  let total = 0;
  
  shares.forEach(share => {
    byPlatform[share.platform] = share.count;
    total += share.count;
  });
  
  return { total, byPlatform };
}

/**
 * Obtém os posts mais compartilhados
 */
export async function getMostSharedPosts(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    ...getTableColumns(posts),
    shareCount: sql<number>`COUNT(${socialShares.id})`,
  })
    .from(posts)
    .leftJoin(socialShares, eq(posts.id, socialShares.postId))
    .where(eq(posts.status, 'published'))
    .groupBy(posts.id)
    .orderBy(desc(sql`COUNT(${socialShares.id})`))
    .limit(limit);
}


// ==================== ADVANCED ANALYTICS ====================
/**
 * Obtém compartilhamentos por plataforma
 */
export async function getSharesByPlatform(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return db.select({
    platform: socialShares.platform,
    count: sql<number>`COUNT(*)`,
  })
    .from(socialShares)
    .where(gte(socialShares.sharedAt, startDate))
    .groupBy(socialShares.platform)
    .orderBy(desc(sql`COUNT(*)`));
}

/**
 * Calcula taxa de conversão (visualizações → compartilhamentos)
 */
export async function getConversionRate(days: number = 30) {
  const db = await getDb();
  if (!db) return { totalViews: 0, totalShares: 0, conversionRate: 0 };
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  // Total de visualizações
  const viewsResult = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(postViewLimits)
    .where(gte(postViewLimits.viewedAt, startDate));
  
  const totalViews = viewsResult[0]?.count || 0;
  
  // Total de compartilhamentos
  const sharesResult = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(socialShares)
    .where(gte(socialShares.sharedAt, startDate));
  
  const totalShares = sharesResult[0]?.count || 0;
  
  // Taxa de conversão
  const conversionRate = totalViews > 0 ? (totalShares / totalViews) * 100 : 0;
  
  return {
    totalViews,
    totalShares,
    conversionRate: parseFloat(conversionRate.toFixed(2)),
  };
}

/**
 * Compara desempenho entre dois períodos
 */
export async function getPerformanceComparison(currentDays: number = 30, previousDays: number = 30) {
  const db = await getDb();
  if (!db) return { current: {}, previous: {}, comparison: {} };
  
  const now = new Date();
  const currentStart = new Date(now.getTime() - currentDays * 24 * 60 * 60 * 1000);
  const previousEnd = new Date(currentStart.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - previousDays * 24 * 60 * 60 * 1000);
  
  // Período atual
  const currentViews = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(postViewLimits)
    .where(and(gte(postViewLimits.viewedAt, currentStart), lte(postViewLimits.viewedAt, now)));
  
  const currentShares = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(socialShares)
    .where(and(gte(socialShares.sharedAt, currentStart), lte(socialShares.sharedAt, now)));
  
  // Período anterior
  const previousViews = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(postViewLimits)
    .where(and(gte(postViewLimits.viewedAt, previousStart), lte(postViewLimits.viewedAt, previousEnd)));
  
  const previousShares = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(socialShares)
    .where(and(gte(socialShares.sharedAt, previousStart), lte(socialShares.sharedAt, previousEnd)));
  
  const currentViewsCount = currentViews[0]?.count || 0;
  const currentSharesCount = currentShares[0]?.count || 0;
  const previousViewsCount = previousViews[0]?.count || 0;
  const previousSharesCount = previousShares[0]?.count || 0;
  
  // Calcular variação percentual
  const viewsChange = previousViewsCount > 0 
    ? ((currentViewsCount - previousViewsCount) / previousViewsCount) * 100 
    : 0;
  
  const sharesChange = previousSharesCount > 0 
    ? ((currentSharesCount - previousSharesCount) / previousSharesCount) * 100 
    : 0;
  
  return {
    current: {
      views: currentViewsCount,
      shares: currentSharesCount,
    },
    previous: {
      views: previousViewsCount,
      shares: previousSharesCount,
    },
    comparison: {
      viewsChange: parseFloat(viewsChange.toFixed(2)),
      sharesChange: parseFloat(sharesChange.toFixed(2)),
    },
  };
}

/**
 * Obtém posts mais engajados (combinando visualizações e compartilhamentos)
 */
export async function getTopPostsByEngagement(days: number = 30, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return db.select({
    ...getTableColumns(posts),
    views: sql<number>`COUNT(DISTINCT ${postViewLimits.id})`,
    shares: sql<number>`COUNT(DISTINCT ${socialShares.id})`,
    engagementScore: sql<number>`COUNT(DISTINCT ${postViewLimits.id}) + (COUNT(DISTINCT ${socialShares.id}) * 2)`,
  })
    .from(posts)
    .leftJoin(postViewLimits, and(
      eq(posts.id, postViewLimits.postId),
      gte(postViewLimits.viewedAt, startDate)
    ))
    .leftJoin(socialShares, and(
      eq(posts.id, socialShares.postId),
      gte(socialShares.sharedAt, startDate)
    ))
    .where(eq(posts.status, 'published'))
    .groupBy(posts.id)
    .orderBy(desc(sql`COUNT(DISTINCT ${postViewLimits.id}) + (COUNT(DISTINCT ${socialShares.id}) * 2)`))
    .limit(limit);
}

/**
 * Obtém dados de engajamento por dia (para gráfico temporal)
 */
export async function getEngagementByDay(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  // Combinar visualizações e compartilhamentos por dia
  const viewsByDay = await db.select({
    date: sql<string>`DATE(${postViewLimits.viewedAt})`,
    views: sql<number>`COUNT(*)`,
  })
    .from(postViewLimits)
    .where(gte(postViewLimits.viewedAt, startDate))
    .groupBy(sql`DATE(${postViewLimits.viewedAt})`)
    .orderBy(asc(sql`DATE(${postViewLimits.viewedAt})`));
  
  const sharesByDay = await db.select({
    date: sql<string>`DATE(${socialShares.sharedAt})`,
    shares: sql<number>`COUNT(*)`,
  })
    .from(socialShares)
    .where(gte(socialShares.sharedAt, startDate))
    .groupBy(sql`DATE(${socialShares.sharedAt})`)
    .orderBy(asc(sql`DATE(${socialShares.sharedAt})`));
  
  // Mesclar dados
  const dateMap = new Map<string, { date: string; views: number; shares: number }>();
  
  viewsByDay.forEach(item => {
    if (item.date) {
      dateMap.set(item.date, {
        date: item.date,
        views: item.views || 0,
        shares: 0,
      });
    }
  });
  
  sharesByDay.forEach(item => {
    if (item.date) {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.shares = item.shares || 0;
      } else {
        dateMap.set(item.date, {
          date: item.date,
          views: 0,
          shares: item.shares || 0,
        });
      }
    }
  });
  
  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}


/**
 * Password Reset Functions
 */
export async function createPasswordResetToken(userId: number, token: string, expiresInHours: number = 24) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  return db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });
}

export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  const result = await db.select().from(passwordResetTokens).where(
    and(eq(passwordResetTokens.token, token), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date()))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markPasswordResetTokenAsUsed(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  return db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, tokenId));
}

/**
 * Audit Log Functions
 */
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  return db.insert(auditLogs).values(data);
}

export async function getAuditLogs(filters?: {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  let query: any = db.select().from(auditLogs);
  
  if (filters?.userId) {
    query = query.where(eq(auditLogs.userId, filters.userId));
  }
  if (filters?.action) {
    query = query.where(eq(auditLogs.action, filters.action));
  }
  if (filters?.entityType) {
    query = query.where(eq(auditLogs.entityType, filters.entityType));
  }
  if (filters?.startDate) {
    query = query.where(gte(auditLogs.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    query = query.where(lte(auditLogs.createdAt, filters.endDate));
  }
  
  query = query.orderBy(desc(auditLogs.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }
  
  return query;
}

export async function getAuditLogCount(filters?: {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  
  let query: any = db.select({ count: sql<number>`COUNT(*)` }).from(auditLogs);
  
  if (filters?.userId) {
    query = query.where(eq(auditLogs.userId, filters.userId));
  }
  if (filters?.action) {
    query = query.where(eq(auditLogs.action, filters.action));
  }
  if (filters?.entityType) {
    query = query.where(eq(auditLogs.entityType, filters.entityType));
  }
  if (filters?.startDate) {
    query = query.where(gte(auditLogs.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    query = query.where(lte(auditLogs.createdAt, filters.endDate));
  }
  
  const result = await query;
  return result[0]?.count || 0;
}


// Menu Access Permissions
export async function getMenuPermissions(role: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(menuAccessPermissions).where(eq(menuAccessPermissions.role, role as any));
}

export async function getMenuPermissionsByRole(role: string) {
  const db = await getDb();
  if (!db) return { allowedMenuItems: [], deniedMenuItems: [] };
  
  const permissions = await db.select().from(menuAccessPermissions)
    .where(eq(menuAccessPermissions.role, role as any));
  
  const allowedMenuItems = permissions.filter(p => p.canAccess).map(p => p.menuItemId);
  const deniedMenuItems = permissions.filter(p => !p.canAccess).map(p => p.menuItemId);
  
  return { allowedMenuItems, deniedMenuItems };
}

export async function setMenuPermission(role: string, menuItemId: number, canAccess: boolean) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if permission already exists
  const existing = await db.select().from(menuAccessPermissions)
    .where(and(eq(menuAccessPermissions.role, role as any), eq(menuAccessPermissions.menuItemId, menuItemId)));
  
  if (existing.length > 0) {
    // Update existing
    return await db.update(menuAccessPermissions)
      .set({ canAccess })
      .where(and(eq(menuAccessPermissions.role, role as any), eq(menuAccessPermissions.menuItemId, menuItemId)));
  } else {
    // Create new
    return await db.insert(menuAccessPermissions).values({
      role: role as 'user' | 'admin' | 'contributor',
      menuItemId,
      canAccess,
    });
  }
}

export async function deleteMenuPermission(role: string, menuItemId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.delete(menuAccessPermissions)
    .where(and(eq(menuAccessPermissions.role, role as any), eq(menuAccessPermissions.menuItemId, menuItemId)));
}

export async function updateMenuPermissionsBatch(role: string, menuItemIds: number[], canAccess: boolean) {
  const db = await getDb();
  if (!db) return null;
  
  // Delete existing permissions for this role
  await db.delete(menuAccessPermissions).where(eq(menuAccessPermissions.role, role as any));
  
  // Insert new permissions
  if (menuItemIds.length > 0) {
    const values = menuItemIds.map(menuItemId => ({
      role: role as 'user' | 'admin' | 'contributor',
      menuItemId,
      canAccess,
    }));
    
    return await db.insert(menuAccessPermissions).values(values);
  }
}

// ==================== BACKUP ====================
export async function getDatabaseDump(): Promise<string> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");
  
  // Parse MySQL URL: mysql://user:password@host:port/database
  const url = new URL(dbUrl);
  const host = url.hostname;
  const port = url.port || "3306";
  const user = url.username;
  const password = url.password;
  const database = url.pathname.replace("/", "");
  
  const { execSync } = await import("child_process");
  
  try {
    // Usar mysqldump para gerar o backup
    const command = `mysqldump -h ${host} -P ${port} -u ${user} ${password ? `-p${password}` : ""} ${database}`;
    const dump = execSync(command, { encoding: "utf8", maxBuffer: 100 * 1024 * 1024 }); // 100MB buffer
    return dump;
  } catch (error) {
    console.error("[Database] Dump failed:", error);
    throw new Error("Falha ao gerar backup do banco de dados");
  }
}
