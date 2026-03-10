import { parse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';
import * as db from './db';
import { hashPassword } from './password';

export interface CSVUserRow {
  email: string;
  name?: string;
  functionalId?: string;
  category?: string;
}

export async function importUsersFromCSV(csvContent: string): Promise<{
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
}> {
  const errors: Array<{ row: number; email: string; error: string }> = [];
  let success = 0;
  let failed = 0;

  try {
    // Parse CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as CSVUserRow[];

    // Process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because of header and 0-based index

      try {
        // Validate required fields
        if (!row.email || !row.email.trim()) {
          errors.push({
            row: rowNumber,
            email: row.email || 'N/A',
            error: 'Email é obrigatório',
          });
          failed++;
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push({
            row: rowNumber,
            email: row.email,
            error: 'Formato de email inválido',
          });
          failed++;
          continue;
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(row.email);
        if (existingUser) {
          errors.push({
            row: rowNumber,
            email: row.email,
            error: 'Usuário já existe no sistema',
          });
          failed++;
          continue;
        }

        // Generate openId and hash password
        const openId = `csv_${uuidv4()}`;
        const passwordHash = await hashPassword('12345678');

        // Create user
        await db.upsertUser({
          openId,
          email: row.email.trim(),
          name: row.name?.trim() || null,
          functionalId: row.functionalId?.trim() || null,
          role: 'user', // Default role
          categoryId: row.category ? parseInt(row.category) : null,
          passwordHash,
        });

        success++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          email: row.email || 'N/A',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
        failed++;
      }
    }

    return { success, failed, errors };
  } catch (error) {
    throw new Error(
      `Erro ao processar arquivo CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}
