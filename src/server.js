import express from "express";
import "dotenv/config";
import pool from "./db.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:3001"
}));

app.use(express.json());

// Hello World
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello World" });
});

// Testar a conexão com o banco
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    res.json({
      api: "online",
      database: "connected",
      databaseTime: result.rows[0].database_time
    });
  } catch (error) {
    res.status(500).json({
      api: "online",
      database: "error",
      message: error.message
    });
  }
});

// Listar todos os produtos
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buscar produto pelo ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar produto
app.post("/api/products", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        message: "Os campos name e price são obrigatórios"
      });
    }

    const result = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Atualizar produto
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        message: "Os campos name e price são obrigatórios"
      });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1, price = $2
       WHERE id = $3
       RETURNING *`,
      [name, price, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Excluir produto
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json({
      message: "Produto excluído com sucesso",
      product: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API disponível em http://localhost:${PORT}`);
});