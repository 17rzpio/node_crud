"use client";

import { FormEvent, useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: string;
  created_at: string;
};

const API_URL = "http://127.0.0.1:3000";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error("Não foi possível carregar os produtos.");
      }

      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      setMessage("Erro ao conectar com a API.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const productData = {
      name,
      price: Number(price)
    };

    const url = editingId
      ? `${API_URL}/api/products/${editingId}`
      : `${API_URL}/api/products`;

    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível salvar.");
      }

      setMessage(
        editingId
          ? "Produto atualizado com sucesso."
          : "Produto criado com sucesso."
      );

      setName("");
      setPrice("");
      setEditingId(null);

      loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    }
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setMessage(`Editando o produto: ${product.name}`);
  }

  function cancelEditing() {
    setEditingId(null);
    setName("");
    setPrice("");
    setMessage("");
  }

  async function deleteProduct(id: number) {
    const confirmed = window.confirm("Deseja excluir este produto?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível excluir.");
      }

      setMessage("Produto excluído com sucesso.");
      loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    }
  }

  return (
    <main>
      <h1>Cadastro de Produtos</h1>

      <form onSubmit={handleSubmit}>
        <h2>{editingId ? "Editar produto" : "Novo produto"}</h2>

        <label htmlFor="name">Nome</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Teclado"
          required
        />

        <label htmlFor="price">Preço</label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Ex.: 159.90"
          required
        />

        <button type="submit">
          {editingId ? "Salvar alteração" : "Cadastrar produto"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEditing}>
            Cancelar
          </button>
        )}
      </form>

      {message && <p>{message}</p>}

      <section>
        <h2>Produtos cadastrados</h2>

        {products.length === 0 ? (
          <p>Nenhum produto cadastrado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    {Number(product.price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })}
                  </td>
                  <td>
                    <button onClick={() => startEditing(product)}>
                      Editar
                    </button>

                    <button onClick={() => deleteProduct(product.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}