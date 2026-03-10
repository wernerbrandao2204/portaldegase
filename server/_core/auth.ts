import bcrypt from "bcryptjs";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

// Hash de senha com bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verificar senha
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Registrar rotas de autenticação local
export function registerAuthRoutes(app: Express) {
  // Rota de login com email e senha
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email e senha são obrigatórios" });
        return;
      }

      // Buscar usuário por email
      const user = await db.getUserByEmail(email);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Email ou senha inválidos" });
        return;
      }

      // Verificar senha
      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({ error: "Email ou senha inválidos" });
        return;
      }

      // Atualizar lastSignedIn
      await db.updateUser(user.id, { lastSignedIn: new Date() });

      // Criar session token usando o SDK do Manus
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || email,
        expiresInMs: ONE_YEAR_MS,
      });

      // Definir cookie de sessão
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Rota para verificar status de autenticação
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const sessionToken = req.cookies[COOKIE_NAME];

      if (!sessionToken) {
        res.status(401).json({ error: "Não autenticado" });
        return;
      }

      // Verificar token com SDK do Manus
      const userInfo = await sdk.verifySession(sessionToken);

      if (!userInfo) {
        res.status(401).json({ error: "Token inválido" });
        return;
      }

      // Buscar usuário no banco
      const user = await db.getUserByOpenId(userInfo.openId);

      if (!user) {
        res.status(401).json({ error: "Usuário não encontrado" });
        return;
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          openId: user.openId,
        },
      });
    } catch (error) {
      console.error("[Auth] Verify failed", error);
      res.status(401).json({ error: "Erro ao verificar autenticação" });
    }
  });

  // Rota de logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });
}
