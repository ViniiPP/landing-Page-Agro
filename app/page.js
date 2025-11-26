"use client";
import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Phone, Target, Eye, Sprout, Tractor, MessageCircle, X, ChevronLeft, ChevronRight, Hand } from 'lucide-react';

function FadeIn({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    const { current } = domRef;
    if (current) observer.observe(current);
    return () => observer.unobserve(current);
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  
  // PAGINAÇÃO RESPONSIVA
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [itensPorPagina, setItensPorPagina] = useState(6); // Começa com 6 (Desktop)
  
  // ESTADOS DO FORMULÁRIO
  const [formNome, setFormNome] = useState('');
  const [formAssunto, setFormAssunto] = useState('');

  const [contato, setContato] = useState({
    telefone: '(00) 00000-0000',
    email: 'contato@agrosoja.com',
    endereco: 'Endereço não cadastrado'
  });

  // DETECTAR TAMANHO DA TELA PARA AJUSTAR QUANTIDADE DE ITENS
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItensPorPagina(1); // Mobile: 1 item por vez
      } else {
        setItensPorPagina(6); // PC: 6 itens (3x2)
      }
    };

    // Executa ao carregar e quando redimensionar a tela
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      setProdutos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      try {
        const docRef = doc(db, "configuracoes", "contato");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setContato(docSnap.data());
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  const handleFiltroChange = (novoFiltro) => {
    setFiltro(novoFiltro);
    setPaginaAtual(0);
  };

  const produtosFiltrados = filtro === 'todos' ? produtos : produtos.filter(p => p.categoria === filtro);
  
  // LÓGICA DE CORTE DOS PRODUTOS
  const produtosVisiveis = produtosFiltrados.slice(
    paginaAtual * itensPorPagina,
    (paginaAtual + 1) * itensPorPagina
  );
  
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);

  // Se redimensionar e a página atual não existir mais, volta pra 0
  useEffect(() => {
    if (paginaAtual >= totalPaginas && totalPaginas > 0) {
      setPaginaAtual(0);
    }
  }, [itensPorPagina, totalPaginas]);

  const cleanPhone = contato.telefone.replace(/\D/g, '');
  const whatsAppLinkPadrao = `https://wa.me/55${cleanPhone}`;

  const handleEnviarMensagem = () => {
    let mensagem = "Olá! Vim pelo site da AgroSoja.";
    if (formNome || formAssunto) {
      mensagem = `Olá, me chamo *${formNome || 'Visitante'}*.\n\nGostaria de falar sobre: *${formAssunto || 'Assuntos gerais'}*.`;
    }
    const encodedMessage = encodeURIComponent(mensagem);
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <main className="min-h-screen font-sans text-gray-800 bg-gray-50 selection:bg-green-200 selection:text-green-900">
      
      {/* HEADER */}
      <header className="fixed w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2 hover:scale-105 transition-transform cursor-default">
            <Sprout className="text-green-600" /> AgroSoja
          </h1>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            {[
              { name: 'Início', id: 'home' },
              { name: 'Sobre', id: 'sobre' },
              { name: 'Produção', id: 'producao' },
              { name: 'Contato', id: 'contato' }
            ].map((item) => (
              <a key={item.name} href={`#${item.id}`} className="hover:text-green-600 hover:-translate-y-0.5 transition-all relative group">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>
          <a href={whatsAppLinkPadrao} target="_blank" className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-green-700 hover:shadow-green-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Fale Conosco
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-cover bg-center animate-slow-zoom blur-xs" style={{ backgroundImage: "url('/imgs/soja.jpg')" }}></div>
        <div className="relative z-20 text-center text-white px-4">
          <FadeIn>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg tracking-tight">Excelência do<br/>Plantio à Colheita</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto drop-shadow-md text-gray-100 font-light">Soluções estratégicas e grãos de alta qualidade para o mercado global.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href="#producao" className="bg-yellow-500 text-green-950 font-bold px-8 py-4 rounded-full hover:bg-yellow-400 hover:scale-105 transition-all shadow-lg hover:shadow-yellow-500/30">
                Ver Nossa Produção
              </a>
              <a href="#contato" className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-green-900 transition-all">
                Entrar em Contato
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* MISSÃO VISÃO VALORES */}
      <section id="sobre" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-green-800 mb-2">Identidade Organizacional</h3>
              <div className="w-20 h-1 bg-green-500 mx-auto rounded-full"></div>
              <p className="text-gray-500 mt-4">Nossos pilares de sustentação</p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={100}>
              <div className="p-10 bg-green-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-green-100 group">
                <Target className="w-14 h-14 text-green-600 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold mb-3 text-green-900">Missão</h4>
                <p className="text-gray-600 leading-relaxed">Produzir soja com sustentabilidade e alta tecnologia, garantindo segurança alimentar com responsabilidade.</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="p-10 bg-green-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-green-100 group">
                <Eye className="w-14 h-14 text-green-600 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold mb-3 text-green-900">Visão</h4>
                <p className="text-gray-600 leading-relaxed">Ser referência nacional em produtividade e qualidade de grãos, expandindo fronteiras até 2030.</p>
              </div>
            </FadeIn>
            <FadeIn delay={500}>
              <div className="p-10 bg-green-50 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-green-100 group">
                <Sprout className="w-14 h-14 text-green-600 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-bold mb-3 text-green-900">Valores</h4>
                <p className="text-gray-600 leading-relaxed">Ética em cada negócio, Respeito à Terra, Inovação Constante e Compromisso com o Cliente.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO DE PRODUTOS (UNIFICADA) --- */}
      <section id="producao" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-10">
              <h3 className="text-4xl font-bold text-green-800 mb-4">Nossa Produção</h3>
              <p className="text-gray-500 max-w-2xl mx-auto">Conheça a qualidade que vem do campo para a sua mesa.</p>
            </div>
            
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
              {['todos', 'plantada', 'graos'].map(tipo => (
                <button 
                  key={tipo}
                  onClick={() => handleFiltroChange(tipo)} 
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 border cursor-pointer 
                    ${filtro === tipo 
                      ? 'bg-green-600 text-white border-green-600 shadow-lg scale-105' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600'}`}
                >
                  {tipo === 'todos' ? 'Todos' : tipo === 'plantada' ? 'Lavoura' : 'Grãos'}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* padding lateral para caber as setas (px-12 mobile, px-20 desktop) */}
          <div className="relative px-12 md:px-20 min-h-[400px]">
            
            {/* Botão Anterior */}
            {paginaAtual > 0 && (
              <button 
                onClick={() => setPaginaAtual(prev => prev - 1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 md:p-3 rounded-full shadow-lg text-green-800 hover:bg-green-50 hover:scale-110 transition z-10 cursor-pointer border border-gray-100"
              >
                <ChevronLeft size={24} className="md:w-8 md:h-8" />
              </button>
            )}

            {/* O GRID: 
                - Mobile: grid-cols-1 (1 por vez)
                - Desktop: grid-cols-3 (3 colunas)
            */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {produtosVisiveis.length === 0 && <p className="text-center col-span-3 text-gray-400 py-10">Nenhum produto encontrado nesta categoria.</p>}
              
              {produtosVisiveis.map((item, index) => (
                <FadeIn key={item.id} delay={index * 50} className="h-full">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:-translate-y-2 h-full flex flex-col">
                    <div className="h-64 overflow-hidden cursor-pointer relative shrink-0" onClick={() => setProdutoSelecionado(item)}>
                      <img src={item.imagemUrl} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-white bg-white/20 border border-white/50 px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md hover:bg-white hover:text-black transition">Ver Detalhes</span>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${item.categoria === 'graos' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.categoria === 'graos' ? 'Grãos' : 'Lavoura'}</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-green-700 transition">{item.titulo}</h4>
                      <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">{item.descricao}</p>
                      <button onClick={() => setProdutoSelecionado(item)} className="text-green-600 font-bold hover:text-green-800 flex items-center gap-1 text-sm mt-auto">Saiba mais <ChevronRight size={16} /></button>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Botão Próximo */}
            {(paginaAtual + 1) < totalPaginas && (
              <button 
                onClick={() => setPaginaAtual(prev => prev + 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 md:p-3 rounded-full shadow-lg text-green-800 hover:bg-green-50 hover:scale-110 transition z-10 cursor-pointer border border-gray-100"
              >
                <ChevronRight size={24} className="md:w-8 md:h-8" />
              </button>
            )}

            {/* Indicador de Páginas */}
            {totalPaginas > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {[...Array(totalPaginas)].map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setPaginaAtual(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${idx === paginaAtual ? 'bg-green-600 scale-125' : 'bg-gray-300 hover:bg-green-400'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="py-24 bg-green-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-600 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 relative z-10">
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-4xl font-bold mb-6">Pronto para fechar negócio?</h3>
                <p className="mb-10 text-green-100 text-lg leading-relaxed">Nossa equipe comercial está à disposição para atender sua demanda com agilidade e transparência.</p>
                <div className="space-y-6">
                  <a href={`tel:${contato.telefone}`} className="flex items-center gap-6 p-4 rounded-xl hover:bg-green-800/50 transition border border-transparent hover:border-green-700">
                    <div className="bg-yellow-500 p-3 rounded-full text-green-900"><Phone size={24} /></div>
                    <div><p className="text-sm text-green-300 uppercase font-bold">Telefone</p><p className="text-xl font-medium">{contato.telefone}</p></div>
                  </a>
                  <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-green-800/50 transition border border-transparent hover:border-green-700">
                    <div className="bg-yellow-500 p-3 rounded-full text-green-900"><MessageCircle size={24} /></div>
                    <div><p className="text-sm text-green-300 uppercase font-bold">Email</p><p className="text-xl font-medium">{contato.email}</p></div>
                  </div>
                  <div className="flex items-center gap-6 p-4 rounded-xl hover:bg-green-800/50 transition border border-transparent hover:border-green-700">
                    <div className="bg-yellow-500 p-3 rounded-full text-green-900"><Tractor size={24} /></div>
                    <div><p className="text-sm text-green-300 uppercase font-bold">Localização</p><p className="text-xl font-medium">{contato.endereco}</p></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-3xl shadow-2xl text-gray-800">
                <h4 className="text-2xl font-bold mb-6 text-green-900">Envie uma mensagem</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-600">Seu Nome</label>
                    <input type="text" value={formNome} onChange={(e) => setFormNome(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" placeholder="Nome completo" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-600">Assunto</label>
                    <input type="text" value={formAssunto} onChange={(e) => setFormAssunto(e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" placeholder="Interesse em soja..." />
                  </div>
                  <button onClick={handleEnviarMensagem} className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition shadow-lg hover:shadow-green-200 mt-4 flex items-center justify-center gap-2 cursor-pointer">
                    <MessageCircle size={20} /> Iniciar Conversa no WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-950 text-green-400 py-12 text-center text-sm border-t border-green-900">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
            <Sprout size={24} />
            <span className="text-2xl font-bold text-white">AgroSoja</span>
          </div>
          <p className="mb-4">&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
          <p className="text-xs opacity-50">Desenvolvido com tecnologia de ponta para o agro.</p>
        </div>
      </footer>

      <a href={whatsAppLinkPadrao} target="_blank" className="fixed bottom-8 right-8 z-50 group">
        <div className="relative bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-transform hover:-translate-y-2 flex items-center justify-center">
          <MessageCircle size={32} />
        </div>
      </a>

      {/* MODAL */}
      {produtoSelecionado && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setProdutoSelecionado(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col md:flex-row relative animate-[scaleIn_0.3s_ease-out] max-h-[90vh] md:max-h-full overflow-y-auto md:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setProdutoSelecionado(null)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-gray-100 text-gray-800 z-10 transition-colors cursor-pointer shadow-sm">
              <X size={24} />
            </button>
            <div className="w-full md:w-1/2 h-48 md:h-auto bg-gray-100 relative shrink-0">
              <img src={produtoSelecionado.imagemUrl} alt={produtoSelecionado.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col relative">
              <span className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {produtoSelecionado.categoria === 'graos' ? 'Grãos' : 'Lavoura'}
              </span>
              <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">{produtoSelecionado.titulo}</h3>
              <div className="prose text-gray-600 mb-6 md:mb-8 max-h-[30vh] md:max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar leading-relaxed text-base md:text-lg">
                <p>{produtoSelecionado.descricao}</p>
              </div>
              <div className="mt-auto pt-4 md:pt-6 border-t border-gray-100">
                <button onClick={() => window.open(whatsAppLinkPadrao, '_blank')} className="w-full bg-green-600 text-white font-bold py-3 md:py-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-3 shadow-lg hover:shadow-green-200 hover:-translate-y-1 cursor-pointer text-sm md:text-base">
                  <MessageCircle size={20} />
                  Solicitar Cotação / Informações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}