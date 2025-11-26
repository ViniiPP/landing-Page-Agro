"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; // Adicionado getDoc e doc
import { db } from '@/lib/firebase';
import { Phone, Target, Eye, Sprout, Tractor, MessageCircle } from 'lucide-react';

export default function LandingPage() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  
  // ESTADO PARA DADOS DE CONTATO (Com valores padrão iniciais)
  const [contato, setContato] = useState({
    telefone: '(00) 00000-0000',
    email: 'contato@agrosoja.com',
    endereco: 'Endereço não cadastrado'
  });

  // Busca dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      // 1. Buscar Produtos
      const querySnapshot = await getDocs(collection(db, "produtos"));
      setProdutos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 2. Buscar Configurações de Contato
      try {
        const docRef = doc(db, "configuracoes", "contato");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContato(docSnap.data());
        }
      } catch (error) {
        console.error("Erro ao carregar contato:", error);
      }
    };
    fetchData();
  }, []);

  const produtosFiltrados = filtro === 'todos' 
    ? produtos 
    : produtos.filter(p => p.categoria === filtro);

  // Formata numero para link do whats (remove tudo que não é numero)
  const whatsAppLink = `https://wa.me/55${contato.telefone.replace(/\D/g, '')}`;

  return (
    <main className="min-h-screen font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Sprout className="text-green-600" /> AgroSoja
          </h1>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#home" className="hover:text-green-600">Início</a>
            <a href="#planejamento" className="hover:text-green-600">Sobre</a>
            <a href="#produtos" className="hover:text-green-600">Produção</a>
            <a href="#contato" className="hover:text-green-600">Contato</a>
          </nav>
          <a href={whatsAppLink} target="_blank" className="bg-green-600 text-white px-4 py-2 rounded-full text-sm hover:bg-green-700 transition">
            Fale Conosco
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center blur-xs" style={{ backgroundImage: "url('/imgs/capa1.jpg')" }}></div>
        <div className="relative z-20 text-center text-white px-4">
          <h2 className="text-5xl font-bold mb-4">Excelência do Plantio à Colheita</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Soluções estratégicas e grãos de alta qualidade.</p>
          <a href="#produtos" className="bg-yellow-500 text-green-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition">
            Ver Nossa Produção
          </a>
        </div>
      </section>

      {/* SEÇÃO MISSÃO VISÃO VALORES (MANTIDA IGUAL) */}
      <section id="planejamento" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-green-800">Identidade Organizacional</h3>
            <p className="text-gray-600">Nossos pilares de sustentação</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-green-50 rounded-xl hover:shadow-lg transition">
              <Target className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Missão</h4>
              <p className="text-gray-600">Produzir soja com sustentabilidade e alta tecnologia.</p>
            </div>
            <div className="p-8 bg-green-50 rounded-xl hover:shadow-lg transition">
              <Eye className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Visão</h4>
              <p className="text-gray-600">Ser referência nacional em produtividade até 2030.</p>
            </div>
            <div className="p-8 bg-green-50 rounded-xl hover:shadow-lg transition">
              <Sprout className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Valores</h4>
              <p className="text-gray-600">Ética, Respeito à Terra e Inovação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUTOS (IGUAL AO ANTERIOR) */}
      <section id="produtos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-green-800 mb-10">Nossa Produção</h3>
          
          <div className="flex justify-center gap-4 mb-10">
            <button onClick={() => setFiltro('todos')} className={`px-4 py-2 rounded-full ${filtro === 'todos' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}>Todos</button>
            <button onClick={() => setFiltro('plantada')} className={`px-4 py-2 rounded-full ${filtro === 'plantada' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}>Lavoura</button>
            <button onClick={() => setFiltro('graos')} className={`px-4 py-2 rounded-full ${filtro === 'graos' ? 'bg-green-600 text-white' : 'bg-white text-gray-600'}`}>Grãos</button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {produtosFiltrados.length === 0 && <p className="text-center w-full col-span-3 text-gray-500">Nenhum produto cadastrado ainda.</p>}
            
            {produtosFiltrados.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="h-64 overflow-hidden">
                  <img src={item.imagemUrl} alt={item.titulo} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide bg-green-100 px-2 py-1 rounded">{item.categoria === 'graos' ? 'Grãos' : 'Lavoura'}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{item.titulo}</h4>
                  <p className="text-gray-600 text-sm">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTATO (AGORA DINÂMICO) */}
      <section id="contato" className="py-20 bg-green-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold mb-6">Entre em Contato</h3>
              <p className="mb-8 text-green-100">Fale diretamente com nossa equipe comercial.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-yellow-500" />
                  {/* Variável dinâmica aqui */}
                  <span>{contato.telefone}</span>
                </div>
                <div className="flex items-center gap-4">
                  <MessageCircle className="w-6 h-6 text-yellow-500" />
                  {/* Variável dinâmica aqui */}
                  <span>{contato.email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Tractor className="w-6 h-6 text-yellow-500" />
                  {/* Variável dinâmica aqui */}
                  <span>{contato.endereco}</span>
                </div>
              </div>
            </div>
            
            {/* FORMULÁRIO (APENAS VISUAL POR ENQUANTO) */}
            <form className="bg-white p-8 rounded-lg text-gray-800">
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Nome</label>
                <input type="text" className="w-full border p-2 rounded placeholder-gray-400" placeholder="Seu nome" />
              </div>
              <button type="button" onClick={() => window.open(whatsAppLink, '_blank')} className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition">
                Chamar no WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-950 text-green-200 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} AgroSoja. Todos os direitos reservados.</p>
        <p className="mt-2">{contato.email}</p>
      </footer>

      {/* BOTÃO WHATSAPP FLUTUANTE (DINÂMICO) */}
      <a 
        href={whatsAppLink}
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition z-50 animate-bounce"
        title="Fale no WhatsApp"
      >
        <MessageCircle size={32} />
      </a>
    </main>
  );
}