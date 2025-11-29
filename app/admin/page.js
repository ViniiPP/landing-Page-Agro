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
} from "firebase/firestore";
import {
  Trash2,
  Upload,
  LogOut,
  Pencil,
  XCircle,
  Save,
  Settings,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";

// ESTILOS PARA ESCONDER BARRA DE SCROLL 
const scrollHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
  ::-webkit-scrollbar {
  width: 7px;
}
`;

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Modais
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Configs
  const [configEmail, setConfigEmail] = useState("");
  const [configTelefone, setConfigTelefone] = useState("");
  const [configEndereco, setConfigEndereco] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Produtos
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("graos");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Cloudinary Config
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET; 

  // Função para pegar miniatura leve (Lista)
  const getThumbnail = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/w_150,h_150,c_fill,q_auto,f_auto/');
  };

  // Função para extrair public_id da URL
  const getPublicIdFromUrl = (url) => {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const afterUpload = parts[1];
      const versionParts = afterUpload.split('/'); 
      if (versionParts[0].startsWith('v')) versionParts.shift();
      const idWithExtension = versionParts.join('/');
      return idWithExtension.split('.')[0];
    } catch (e) {
      console.error("Erro ID", e);
      return null;
    }
  };

  // Função para abrir modais
  const openSuccessModal = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  // Função para confirmar exclusão
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Função para deletar
  const executeDelete = async () => {
    if (itemToDelete) {
      try {
        // Tenta apagar imagem via PHP se existir script
        if (itemToDelete.imagemUrl) {
          const publicId = getPublicIdFromUrl(itemToDelete.imagemUrl);
          if (publicId) {
            await fetch('/delete_img.php', {
              method: 'POST',
              body: JSON.stringify({ public_id: publicId })
            });
          }
        }
        await deleteDoc(doc(db, "produtos", itemToDelete.id));
        fetchProdutos();
        setShowDeleteModal(false);
        setItemToDelete(null);
        openSuccessModal("Produto removido com sucesso!");
      } catch (error) {
        alert("Erro ao deletar.");
      }
    }
  };

  // Buscar Configurações de Contato
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
    } catch (error) { console.error(error); }
  };

  // Buscar Produtos
  const fetchProdutos = async () => {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    setProdutos(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Monitorar autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProdutos();
        fetchConfig(); 
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Salvar Configurações de Contato
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoadingConfig(true);
    try {
      await setDoc(doc(db, "configuracoes", "contato"), {
        email: configEmail,
        telefone: configTelefone,
        endereco: configEndereco,
      });
      openSuccessModal("Dados de contato atualizados!");
    } catch (error) { alert("Erro: " + error.message); }
    setLoadingConfig(false);
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) { alert("Erro: " + error.message); }
  };

  // Preview da Imagem
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Editar Produto
  const handleEdit = (produto) => {
    setTitulo(produto.titulo);
    setDescricao(produto.descricao);
    setCategoria(produto.categoria);
    setPreview(produto.imagemUrl);
    setEditingId(produto.id);
    setImagem(null);
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  // Cancelar Edição
  const handleCancelEdit = () => {
    setTitulo(""); setDescricao(""); setCategoria("graos"); setImagem(null); setPreview(null); setEditingId(null);
  };

  // Salvar Produto (Novo ou Editar)
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let urlFinal = null;
      if (imagem) {
        const formData = new FormData();
        formData.append("file", imagem);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
        const data = await res.json();
        urlFinal = data.secure_url;
      } else if (editingId) {
        const produtoAtual = produtos.find((p) => p.id === editingId);
        urlFinal = produtoAtual.imagemUrl;
      } else {
        alert("Selecione uma imagem!"); setLoading(false); return;
      }
      
      const dadosProduto = { titulo, descricao, categoria, imagemUrl: urlFinal, updatedAt: new Date() };

      if (editingId) {
        await updateDoc(doc(db, "produtos", editingId), dadosProduto);
        openSuccessModal("Produto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "produtos"), { ...dadosProduto, createdAt: new Date() });
        openSuccessModal("Produto cadastrado com sucesso!");
      }
      handleCancelEdit(); fetchProdutos();
    } catch (error) { console.error(error); alert("Erro ao salvar."); }
    setLoading(false);
  };

  // TELA DE LOGIN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-4 text-center text-green-800">Admin AgroSoja</h2>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="admin@email.com" 
              className="w-full border p-2 rounded placeholder-gray-400 text-black" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              placeholder="******" 
              className="w-full border p-2 rounded placeholder-gray-400 text-black" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 cursor-pointer font-bold">Entrar</button>
        </form>
      </div>
    );
  }

  // PÁGINA ADMINISTRATIVA
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <style>{scrollHideStyle}</style>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 mt-4">
          <h1 className="text-3xl font-bold text-green-800">Painel Administrativo</h1>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-red-600 font-bold cursor-pointer hover:bg-red-50 p-2 rounded transition"><LogOut size={18} /> Sair</button>
        </div>

        {/* DADOS DE CONTATO */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10 border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 border-b pb-2"><Settings size={20} /> Dados de Contato do Site</h2>
          <form onSubmit={handleSaveConfig} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  value={configTelefone} 
                  onChange={(e) => setConfigTelefone(e.target.value)} 
                  placeholder="Ex: (00) 00000-0000"
                  className="border p-2 rounded w-full text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 outline-none"  
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Email de Contato</label>
                <input 
                  type="email" 
                  value={configEmail} 
                  onChange={(e) => setConfigEmail(e.target.value)} 
                  placeholder="Ex: contato@empresa.com"
                  className="border p-2 rounded w-full text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 outline-none"  
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Endereço Completo</label>
              <input 
                type="text" 
                value={configEndereco} 
                onChange={(e) => setConfigEndereco(e.target.value)} 
                placeholder="Ex: Rodovia X, KM Y - Cidade/UF"
                className="border p-2 rounded w-full text-black placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 outline-none" 
              />
            </div>
            <button disabled={loadingConfig} className="bg-yellow-500 text-white p-2 rounded font-bold hover:bg-yellow-600 w-full md:w-auto cursor-pointer transition mt-2">{loadingConfig ? "Salvando..." : "Atualizar Dados de Contato"}</button>
          </form>
        </div>

        {/* FORMULÁRIO DE PRODUTOS */}
        <div className={`p-6 rounded-lg shadow-md mb-10 transition-colors border-l-4 border-green-600 ${editingId ? "bg-blue-50 border-2 border-blue-200" : "bg-white"}`}>
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">{editingId ? <><Pencil size={20}/> Editar Produto</> : <><Upload size={20}/> Novo Produto</>}</h2>
            {editingId && <button onClick={handleCancelEdit} className="text-sm text-gray-500 flex items-center gap-1 hover:text-red-500 cursor-pointer"><XCircle size={16} /> Cancelar Edição</button>}
          </div>
          <form onSubmit={handleSave} className="grid gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Título do Produto</label>
              <input 
                type="text" 
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)} 
                placeholder="Ex: Soja Safra 2024"
                className="border p-2 rounded w-full text-black placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">Descrição Detalhada</label>
              <textarea 
                value={descricao} 
                onChange={(e) => setDescricao(e.target.value)} 
                placeholder="Descreva as qualidades da soja..."
                className="border p-2 rounded w-full text-black h-24 placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none" 
                required 
              />
            </div>
            <div className="flex gap-4 flex-col md:flex-row items-start">
              <div className="w-full md:w-1/3">
                <label className="text-sm font-bold text-gray-700 mb-1 block">Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="border p-2 rounded text-black bg-white w-full focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="graos">Soja em Grãos</option>
                  <option value="plantada">Soja Plantada</option>
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="text-sm font-bold text-gray-700 mb-1 block">Foto do Produto</label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <input type="file" onChange={handleFileChange} className="border p-2 rounded w-full text-black bg-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" accept="image/*" />
                  </div>
                  {preview && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-green-500 shadow-sm">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button disabled={loading} className={`text-white p-3 rounded flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer mt-4 font-bold ${editingId ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>{loading ? "Processando..." : editingId ? "Salvar Alterações" : "Cadastrar Produto"}</button>
          </form>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="grid gap-4">
          <h3 className="text-lg font-bold text-gray-600 mb-2 pl-1 border-l-4 border-gray-300">Produtos Cadastrados ({produtos.length})</h3>
          {produtos.length === 0 && <p className="text-gray-400 italic">Nenhum produto cadastrado.</p>}
          {produtos.map((prod) => (
            <div key={prod.id} className="bg-white p-4 rounded shadow flex items-center justify-between border-l-4 border-green-500 hover:bg-gray-200 transition">
              <div className="flex items-center gap-4">
                {/* getThumbnail para a lista não pesar */}
                <div className="w-20 h-20 rounded overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0">
                  <img src={getThumbnail(prod.imagemUrl)} alt={prod.titulo} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div><h3 className="font-bold text-gray-800 text-lg">{prod.titulo}</h3><span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${prod.categoria === 'graos' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{prod.categoria === "graos" ? "Grãos" : "Lavoura"}</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(prod)} className="bg-blue-100 text-blue-600 p-2 rounded hover:bg-blue-200 cursor-pointer transition" title="Editar"><Pencil size={20} /></button>
                <button onClick={() => confirmDelete(prod)} className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 cursor-pointer transition" title="Excluir"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Produto?</h3>
              <p className="text-gray-500 text-sm">Tem certeza que deseja remover este item? Essa ação não pode ser desfeita.</p>
            </div>
            <div className="flex border-t border-gray-100 bg-gray-50">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 text-gray-600 font-bold hover:bg-gray-100 transition border-r border-gray-100">Cancelar</button>
              <button onClick={executeDelete} className="flex-1 py-4 text-red-600 font-bold hover:bg-red-50 transition">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO  */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-start sm:justify-end p-6 pointer-events-none">
          <div className="mt-4 sm:mt-0 bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 flex items-center gap-4 animate-slideIn pointer-events-auto max-w-sm w-full">
            <div className="bg-green-100 p-2 rounded-full"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <div className="flex-1"><h4 className="font-bold text-gray-800">Sucesso!</h4><p className="text-sm text-gray-600">{successMessage}</p></div>
            <button onClick={() => setShowSuccessModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}