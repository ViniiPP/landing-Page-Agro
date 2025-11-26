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
  setDoc,
  getDoc,
} from "firebase/firestore"; // Adicionei setDoc e getDoc
import {
  Trash2,
  Upload,
  LogOut,
  Pencil,
  XCircle,
  Save,
  Settings,
} from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- ESTADOS DE CONFIGURAÇÃO GERAL ---
  const [configEmail, setConfigEmail] = useState("");
  const [configTelefone, setConfigTelefone] = useState("");
  const [configEndereco, setConfigEndereco] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);

  // --- ESTADOS DE PRODUTOS ---
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("graos");
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // CONFIGURAÇÕES DO CLOUDINARY
  const CLOUD_NAME = "dzvaouj9v"; // acesso no painel https://console.cloudinary.com
  const UPLOAD_PRESET = "ml_default"; // acesso no painel https://console.cloudinary.com

  // --- FUNÇÕES DE CONFIGURAÇÃO (NOVO) ---
  const fetchConfig = async () => {
    try {
      const docRef = doc(db, "configuracoes", "contato");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfigEmail(data.email || "");
        setConfigTelefone(data.telefone || "");
        setConfigEndereco(data.endereco || "");
      }
    } catch (error) {
      console.error("Erro ao buscar configs:", error);
    }
  };

    // FUNÇÕES DE PRODUTOS
  const fetchProdutos = async () => {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    setProdutos(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProdutos();
        fetchConfig(); // Busca as configurações ao logar
      }
    });
    return () => unsubscribe();
  }, []);
  
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoadingConfig(true);
    try {
      // Usamos setDoc com o ID fixo "contato" para sempre sobrescrever o mesmo lugar
      await setDoc(doc(db, "configuracoes", "contato"), {
        email: configEmail,
        telefone: configTelefone,
        endereco: configEndereco,
      });
      alert("Dados de contato atualizados no site!");
    } catch (error) {
      alert("Erro ao salvar configs: " + error.message);
    }
    setLoadingConfig(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  const handleEdit = (produto) => {
    setTitulo(produto.titulo);
    setDescricao(produto.descricao);
    setCategoria(produto.categoria);
    setEditingId(produto.id);
    setImagem(null);
    window.scrollTo({ top: 500, behavior: "smooth" }); // Ajustei o scroll
  };

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

      if (imagem) {
        const formData = new FormData();
        formData.append("file", imagem);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        urlFinal = data.secure_url;
      } else if (editingId) {
        const produtoAtual = produtos.find((p) => p.id === editingId);
        urlFinal = produtoAtual.imagemUrl;
      } else {
        alert("Selecione uma imagem!");
        setLoading(false);
        return;
      }
      
      const dadosProduto = {
        titulo,
        descricao,
        categoria,
        imagemUrl: urlFinal,
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(db, "produtos", editingId), dadosProduto);
        alert("Atualizado!");
      } else {
        await addDoc(collection(db, "produtos"), {
          ...dadosProduto,
          createdAt: new Date(),
        });
        alert("Cadastrado!");
      }
      handleCancelEdit();
      fetchProdutos();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Apagar produto?")) {
      await deleteDoc(doc(db, "produtos", id));
      fetchProdutos();
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            Painel Administrativo
          </h1>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 text-red-600 font-bold cursor-pointer"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>

        {/* --- NOVO: FORMULÁRIO DE DADOS DE CONTATO --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10 border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Settings size={20} /> Dados de Contato do Site
          </h2>
          <form onSubmit={handleSaveConfig} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-600">
                  Telefone / WhatsApp (ex: (00) 00000-0000)
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={configTelefone}
                  onChange={(e) => setConfigTelefone(e.target.value)}
                  className="border p-2 rounded w-full placeholder-black text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600">
                  Email de Contato
                </label>
                <input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={configEmail}
                  onChange={(e) => setConfigEmail(e.target.value)}
                  className="border p-2 rounded w-full placeholder-black text-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600">
                Endereço Completo
              </label>
              <input
                type="text"
                placeholder="Rodovia X, KM Y - Cidade/UF"
                value={configEndereco}
                onChange={(e) => setConfigEndereco(e.target.value)}
                className="border p-2 rounded w-full placeholder-black text-gray-600"
              />
            </div>
            <button
              disabled={loadingConfig}
              className="bg-yellow-500 text-white p-2 rounded font-bold hover:bg-yellow-600 w-full md:w-auto cursor-pointer"
            >
              {loadingConfig ? "Salvando..." : "Atualizar Dados de Contato"}
            </button>
          </form>
        </div>

        {/* FORMULÁRIO DE PRODUTOS */}
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
                className="text-sm text-gray-500 flex items-center gap-1 hover:text-red-500 cursor-pointer"
              >
                <XCircle size={16} /> Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="grid gap-4">
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border p-2 rounded w-full placeholder-gray-600 text-black"
              required
            />
            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="border p-2 rounded w-full placeholder-gray-600 text-black"
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
                  className="border p-2 rounded w-full text-black bg-white cursor-pointer"
                  accept="image/*"
                />
              </div>
            </div>
            <button
              disabled={loading}
              className={`text-white p-3 rounded flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer ${
                editingId ? "bg-blue-600" : "bg-green-600"
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

        {/* LISTA DE PRODUTOS */}
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(prod)}
                  className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 cursor-pointer"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 cursor-pointer"
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
