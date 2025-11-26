"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Trash2, Upload, LogOut, Pencil, XCircle } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado do formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("graos");
  const [imagem, setImagem] = useState(null);

  // Estado de controle
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // CONFIGURAÇÕES DO CLOUDINARY
  const CLOUD_NAME = "dzvaouj9v"; // acesso no painel https://console.cloudinary.com
  const UPLOAD_PRESET = "ml_default"; // acesso no painel https://console.cloudinary.com

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchProdutos();
    });
    return () => unsubscribe();
  }, []);

  const fetchProdutos = async () => {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    setProdutos(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Erro ao logar: " + error.message);
    }
  };

  // Preenche o formulário para edição
  const handleEdit = (produto) => {
    setTitulo(produto.titulo);
    setDescricao(produto.descricao);
    setCategoria(produto.categoria);
    setEditingId(produto.id);
    setImagem(null); // Reseta o input de arquivo (usuário só põe se quiser trocar)

    // Rola a página para cima suavemente
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancela a edição e limpa o form
  const handleCancelEdit = () => {
    setTitulo("");
    setDescricao("");
    setCategoria("graos");
    setImagem(null);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let urlFinal = null;

      // 1. Lógica da Imagem
      if (imagem) {
        // Se o usuário selecionou um arquivo, faz upload para o Cloudinary
        const formData = new FormData();
        formData.append("file", imagem);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (!data.secure_url) throw new Error("Falha no upload da imagem");
        urlFinal = data.secure_url;
      } else if (editingId) {
        // Se está editando e NÃO selecionou imagem nova, mantém a antiga
        const produtoAtual = produtos.find((p) => p.id === editingId);
        urlFinal = produtoAtual.imagemUrl;
      } else {
        // Se está criando e não tem imagem
        alert("Selecione uma imagem para criar um novo produto!");
        setLoading(false);
        return;
      }

      // 2. Salvar no Banco de Dados (Criar ou Atualizar)
      const dadosProduto = {
        titulo,
        descricao,
        categoria,
        imagemUrl: urlFinal,
        updatedAt: new Date(), // Atualiza a data
      };

      if (editingId) {
        // MODO EDIÇÃO: Atualiza o documento existente
        const docRef = doc(db, "produtos", editingId);
        await updateDoc(docRef, dadosProduto);
        alert("Produto atualizado com sucesso!");
      } else {
        // MODO CRIAÇÃO: Cria um novo documento
        await addDoc(collection(db, "produtos"), {
          ...dadosProduto,
          createdAt: new Date(),
        });
        alert("Produto cadastrado com sucesso!");
      }

      // 3. Limpar e atualizar
      handleCancelEdit(); // Limpa o form
      fetchProdutos(); // Recarrega a lista
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja apagar?")) {
      await deleteDoc(doc(db, "produtos", id));
      fetchProdutos();
    }
  };

  // TELA DE LOGIN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded shadow-md w-96"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-green-800">
            Admin AgroSoja
          </h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 mb-4 rounded placeholder-black text-black"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full border p-2 mb-6 rounded placeholder-black text-black"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 cursor-pointer">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  // TELA DO DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            Gerenciar Produtos
          </h1>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 text-red-600 font-bold cursor-pointer"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>

        {/* Formulário de Cadastro / Edição */}
        <div
          className={`p-6 rounded-lg shadow-md mb-10 transition-colors ${
            editingId ? "bg-blue-50 border-2 border-blue-200" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">
              {editingId ? "Editar Produto" : "Novo Produto"}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-sm text-gray-500 flex items-center gap-1 hover:text-red-500"
              >
                <XCircle size={16} /> Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="grid gap-4">
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border p-2 rounded w-full placeholder-black text-black"
              required
            />
            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="border p-2 rounded w-full placeholder-black text-black"
              required
            />
            <div className="flex gap-4 flex-col md:flex-row">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="border p-2 rounded text-black bg-white"
              >
                <option value="graos">Soja em Grãos</option>
                <option value="plantada">Soja Plantada</option>
              </select>
              <div className="flex-1">
                <input
                  type="file"
                  onChange={(e) => setImagem(e.target.files[0])}
                  className="border p-2 rounded w-full text-black bg-white cursoir-pointer"
                  accept="image/*"
                />
                {editingId && !imagem && (
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Deixe vazio para manter a imagem atual.
                  </p>
                )}
              </div>
            </div>

            <button
              disabled={loading}
              className={`text-white cursor-pointer p-3 rounded flex items-center justify-center gap-2 transition disabled:opacity-50 
                ${
                  editingId
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {loading
                ? "Salvando..."
                : editingId
                ? "Atualizar Produto"
                : "Cadastrar Produto"}
            </button>
          </form>
        </div>

        {/* Lista de Produtos */}
        <div className="grid gap-4">
          {produtos.map((prod) => (
            <div
              key={prod.id}
              className="bg-white p-4 rounded shadow flex items-center justify-between border-l-4 border-green-500"
            >
              <div className="flex items-center gap-4">
                <img
                  src={prod.imagemUrl}
                  alt={prod.titulo}
                  className="w-16 h-16 object-cover rounded bg-gray-200"
                />
                <div>
                  <h3 className="font-bold text-gray-800">{prod.titulo}</h3>
                  <p className="text-sm text-gray-500">
                    {prod.categoria === "graos" ? "Grãos" : "Lavoura"}
                  </p>
                </div>
              </div>

              {/* botoes de editar e excluir */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(prod)}
                  className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 transition cursor-pointer"
                  title="Editar"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 transition cursor-pointer"
                  title="Excluir"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
