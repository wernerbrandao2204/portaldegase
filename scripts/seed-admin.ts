import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

async function seedAdmin() {
  let connection;
  try {
    // Conectar ao banco de dados
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "portaldegase",
    });

    // Verificar se o usuário admin já existe
    const [existingAdmin] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      ["admin@degase.local"]
    );

    if (Array.isArray(existingAdmin) && existingAdmin.length > 0) {
      console.log("✓ Usuário admin já existe no banco de dados");
      await connection.end();
      return;
    }

    // Hash da senha "admin"
    const passwordHash = await bcrypt.hash("admin", 10);

    // Criar usuário admin
    await connection.execute(
      `INSERT INTO users (openId, email, name, passwordHash, role, loginMethod, lastSignedIn, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      ["admin-local-user", "admin@degase.local", "Administrador", passwordHash, "admin", "local"]
    );

    console.log("✓ Usuário admin criado com sucesso!");
    console.log("  Email: admin@degase.local");
    console.log("  Senha: admin");

    await connection.end();
  } catch (error) {
    console.error("✗ Erro ao criar usuário admin:", error);
    process.exit(1);
  }
}

seedAdmin();
