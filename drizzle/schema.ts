import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  functionalId: varchar("functionalId", { length: 64 }), // ID Funcional do usuário
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "contributor"]).default("user").notNull(),
  categoryId: int("categoryId"), // Para contributors: categoria que podem editar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories for organizing content (notícias, comunicados, legislação, etc.)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  icon: varchar("icon", { length: 64 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Tags for content classification
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Posts - main content table (notícias, comunicados, etc.)
 */
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featuredImage"),
  categoryId: int("categoryId"),
  authorId: int("authorId"),
  status: mysqlEnum("status", ["draft", "published", "archived", "scheduled"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  scheduledAt: timestamp("scheduledAt"), // Data/hora agendada para publicação
  isScheduled: boolean("isScheduled").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Post-Tag relationship (many-to-many)
 */
export const postTags = mysqlTable("post_tags", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  tagId: int("tagId").notNull(),
});

export type PostTag = typeof postTags.$inferSelect;
export type InsertPostTag = typeof postTags.$inferInsert;

/**
 * Institutional pages (Sobre, Serviços, Legislação, etc.)
 */
export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featuredImage"),
  parentId: int("parentId"),
  sortOrder: int("sortOrder").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  showInMenu: boolean("showInMenu").default(false).notNull(),
  menuLabel: varchar("menuLabel", { length: 128 }),
  authorId: int("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

/**
 * Banners for homepage carousel
 */
export const banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("imageUrl").notNull(),
  linkUrl: text("linkUrl"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

/**
 * Videos (YouTube embeds)
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  youtubeUrl: text("youtubeUrl").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Transparency documents and links
 */
export const transparencyItems = mysqlTable("transparency_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  linkUrl: text("linkUrl"),
  icon: varchar("icon", { length: 64 }),
  section: varchar("section", { length: 128 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TransparencyItem = typeof transparencyItems.$inferSelect;
export type InsertTransparencyItem = typeof transparencyItems.$inferInsert;

/**
 * DEGASE units (unidades)
 */
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  type: mysqlEnum("type", ["internacao", "internacao_provisoria", "semiliberdade", "meio_aberto"]).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 64 }),
  email: varchar("email", { length: 320 }),
  visitDays: text("visitDays"),
  mapsUrl: text("mapsUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

/**
 * Site configuration (key-value store)
 */
export const siteConfig = mysqlTable("site_config", {
  id: int("id").autoincrement().primaryKey(),
  configKey: varchar("configKey", { length: 128 }).notNull().unique(),
  configValue: text("configValue"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = typeof siteConfig.$inferInsert;

/**
 * Post version history - tracks all changes to posts
 */
export const postHistory = mysqlTable("post_history", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featuredImage"),
  status: mysqlEnum("status", ["draft", "published", "archived", "scheduled"]).default("draft").notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  editorId: int("editorId"),
  changeDescription: varchar("changeDescription", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostHistory = typeof postHistory.$inferSelect;
export type InsertPostHistory = typeof postHistory.$inferInsert;

/**
 * Page version history - tracks all changes to pages
 */
export const pageHistory = mysqlTable("page_history", {
  id: int("id").autoincrement().primaryKey(),
  pageId: int("pageId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featuredImage"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  menuLabel: varchar("menuLabel", { length: 255 }),
  showInMenu: boolean("showInMenu").default(false).notNull(),
  editorId: int("editorId"),
  changeDescription: varchar("changeDescription", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageHistory = typeof pageHistory.$inferSelect;
export type InsertPageHistory = typeof pageHistory.$inferInsert;


/**
 * Temas/Esquemas de cores do portal
 */
export const colorThemes = mysqlTable("color_themes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  // Cores principais
  primaryColor: varchar("primaryColor", { length: 7 }).default("#003366").notNull(), // Azul DEGASE
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#D4AF37").notNull(), // Dourado
  accentColor: varchar("accentColor", { length: 7 }).default("#0066CC").notNull(), // Azul claro
  // Cores de texto
  textColor: varchar("textColor", { length: 7 }).default("#333333").notNull(),
  textLightColor: varchar("textLightColor", { length: 7 }).default("#666666").notNull(),
  // Cores de fundo
  backgroundColor: varchar("backgroundColor", { length: 7 }).default("#FFFFFF").notNull(),
  surfaceColor: varchar("surfaceColor", { length: 7 }).default("#F5F5F5").notNull(),
  // Cores de busca
  searchBgColor: varchar("searchBgColor", { length: 7 }).default("#003366").notNull(),
  searchTextColor: varchar("searchTextColor", { length: 7 }).default("#FFFFFF").notNull(),
  searchBorderColor: varchar("searchBorderColor", { length: 7 }).default("#D4AF37").notNull(),
  // Status
  isActive: boolean("isActive").default(false).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ColorTheme = typeof colorThemes.$inferSelect;
export type InsertColorTheme = typeof colorThemes.$inferInsert;


/**
 * Comentários em notícias
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "spam"]).default("pending").notNull(),
  moderatedBy: int("moderatedBy"), // ID do usuário que moderou
  moderationReason: text("moderationReason"), // Motivo da rejeição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Galeria de mídia (imagens e vídeos)
 */
export const mediaLibrary = mysqlTable("media_library", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: text("url").notNull(), // URL do S3
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // Chave do arquivo no S3
  fileType: mysqlEnum("fileType", ["image", "video"]).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize"), // Tamanho em bytes
  width: int("width"), // Para imagens
  height: int("height"), // Para imagens
  duration: int("duration"), // Para vídeos em segundos
  uploadedBy: int("uploadedBy").notNull(), // ID do usuário que fez upload
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MediaLibrary = typeof mediaLibrary.$inferSelect;
export type InsertMediaLibrary = typeof mediaLibrary.$inferInsert;



/**
 * Analytics - tracks page views and engagement
 */
export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId"),
  pageUrl: varchar("pageUrl", { length: 1024 }),
  viewCount: int("viewCount").default(0).notNull(),
  uniqueVisitors: int("uniqueVisitors").default(0).notNull(),
  avgTimeOnPage: int("avgTimeOnPage").default(0).notNull(),
  bounceRate: int("bounceRate").default(0).notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

/**
 * Social Media Sharing - tracks and manages social media posts
 */
export const socialMediaShares = mysqlTable("social_media_shares", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  externalId: varchar("externalId", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  sharedAt: timestamp("sharedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialMediaShare = typeof socialMediaShares.$inferSelect;
export type InsertSocialMediaShare = typeof socialMediaShares.$inferInsert;


/**
 * Services - cadastro de serviços exibidos na página inicial
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 500 }).notNull(), // URL da imagem do ícone
  link: varchar("link", { length: 1024 }).notNull(),
  color: varchar("color", { length: 7 }).default("#0066CC").notNull(), // Cor do card em hex
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Analytics para rastreamento de cliques em serviços
 */
export const serviceAnalytics = mysqlTable("service_analytics", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull().references(() => services.id, { onDelete: "cascade" }),
  clickCount: int("clickCount").default(0).notNull(),
  lastClickedAt: timestamp("lastClickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceAnalytics = typeof serviceAnalytics.$inferSelect;
export type InsertServiceAnalytics = typeof serviceAnalytics.$inferInsert;

/**
 * Log de cliques individuais em serviços para análise detalhada
 */
export const serviceClickLog = mysqlTable("service_click_log", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull().references(() => services.id, { onDelete: "cascade" }),
  userAgent: varchar("userAgent", { length: 500 }),
  referer: varchar("referer", { length: 1024 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
});

export type ServiceClickLog = typeof serviceClickLog.$inferSelect;
export type InsertServiceClickLog = typeof serviceClickLog.$inferInsert;


/**
 * Document Categories - categorias específicas para documentos
 */
export const documentCategories = mysqlTable("document_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentCategory = typeof documentCategories.$inferSelect;
export type InsertDocumentCategory = typeof documentCategories.$inferInsert;

/**
 * Documents - arquivos de documentos com categorização
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: int("categoryId").notNull().references(() => documentCategories.id, { onDelete: "restrict" }),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  fileKey: varchar("fileKey", { length: 1024 }).notNull(), // Chave no S3
  fileSize: int("fileSize").notNull(), // Tamanho em bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id, { onDelete: "restrict" }),
  isActive: boolean("isActive").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(), // Destaque na home
  sortOrder: int("sortOrder").default(0).notNull(), // Ordem de exibição em destaque
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;


/**
 * Document Versions - histórico de versões de documentos
 */
export const documentVersions = mysqlTable("document_versions", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => documents.id, { onDelete: "cascade" }),
  versionNumber: int("versionNumber").notNull(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  fileKey: varchar("fileKey", { length: 1024 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  uploadedBy: int("uploadedBy").notNull().references(() => users.id, { onDelete: "restrict" }),
  changeDescription: text("changeDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = typeof documentVersions.$inferInsert;

/**
 * Document Downloads - rastreamento de downloads
 */
export const documentDownloads = mysqlTable("document_downloads", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => documents.id, { onDelete: "cascade" }),
  versionId: int("versionId").references(() => documentVersions.id, { onDelete: "cascade" }),
  userAgent: varchar("userAgent", { length: 500 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export type DocumentDownload = typeof documentDownloads.$inferSelect;
export type InsertDocumentDownload = typeof documentDownloads.$inferInsert;

/**
 * Document Download Statistics - agregação de estatísticas
 */
export const documentDownloadStats = mysqlTable("document_download_stats", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => documents.id, { onDelete: "cascade" }),
  totalDownloads: int("totalDownloads").default(0).notNull(),
  lastDownloadedAt: timestamp("lastDownloadedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentDownloadStats = typeof documentDownloadStats.$inferSelect;
export type InsertDocumentDownloadStats = typeof documentDownloadStats.$inferInsert;


/**
 * Page Blocks - blocos personalizáveis para páginas
 */
export const pageBlocks = mysqlTable("page_blocks", {
  id: int("id").autoincrement().primaryKey(),
  pageId: int("pageId").notNull().references(() => pages.id, { onDelete: "cascade" }),
  blockType: mysqlEnum("blockType", ["services", "documentCategories", "images", "text", "html"]).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  config: json("config"), // Configurações específicas do bloco (filtros, limites, etc)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PageBlock = typeof pageBlocks.$inferSelect;
export type InsertPageBlock = typeof pageBlocks.$inferInsert;

/**
 * Page Block Items - itens específicos dentro de cada bloco
 */
export const pageBlockItems = mysqlTable("page_block_items", {
  id: int("id").autoincrement().primaryKey(),
  blockId: int("blockId").notNull().references(() => pageBlocks.id, { onDelete: "cascade" }),
  itemType: mysqlEnum("itemType", ["service", "documentCategory", "image"]).notNull(),
  itemId: int("itemId"), // ID do serviço, categoria de documento ou imagem
  sortOrder: int("sortOrder").default(0).notNull(),
  customData: json("customData"), // Dados customizados (título override, descrição, etc)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PageBlockItem = typeof pageBlockItems.$inferSelect;
export type InsertPageBlockItem = typeof pageBlockItems.$inferInsert;

/**
 * Images Bank - banco de imagens do site (imagens de posts, etc)
 */
export const imagesBank = mysqlTable("images_bank", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 1024 }).notNull(),
  fileKey: varchar("fileKey", { length: 1024 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  width: int("width"),
  height: int("height"),
  alt: varchar("alt", { length: 255 }),
  title: varchar("title", { length: 255 }),
  sourceType: mysqlEnum("sourceType", ["post", "service", "document", "banner", "manual"]).notNull(),
  sourceId: int("sourceId"), // ID da fonte (post ID, service ID, etc)
  uploadedBy: int("uploadedBy").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImagesBank = typeof imagesBank.$inferSelect;
export type InsertImagesBank = typeof imagesBank.$inferInsert;


/**
 * Menu Items - Itens do menu do site com suporte a hierarquia
 */
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  linkType: mysqlEnum("linkType", ["internal", "external"]).notNull(),
  internalPageId: int("internalPageId").references(() => pages.id, { onDelete: "set null" }),
  externalUrl: varchar("externalUrl", { length: 1024 }),
  parentId: int("parentId").references((): any => menuItems.id, { onDelete: "cascade" }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  openInNewTab: boolean("openInNewTab").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type MenuItemInsert = typeof menuItems.$inferInsert;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Post View Limits - rate limiting para visualizações (1 por IP em 24h)
 */
export const postViewLimits = mysqlTable("post_view_limits", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull().references(() => posts.id, { onDelete: "cascade" }),
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type PostViewLimit = typeof postViewLimits.$inferSelect;
export type InsertPostViewLimit = typeof postViewLimits.$inferInsert;

/**
 * Social Shares - rastreamento de compartilhamentos em redes sociais
 */
export const socialShares = mysqlTable("social_shares", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull().references(() => posts.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(), // 'whatsapp', 'facebook', 'twitter'
  ipAddress: varchar("ipAddress", { length: 45 }).notNull(),
  userAgent: varchar("userAgent", { length: 500 }),
  sharedAt: timestamp("sharedAt").defaultNow().notNull(),
});

export type SocialShare = typeof socialShares.$inferSelect;
export type InsertSocialShare = typeof socialShares.$inferInsert;


