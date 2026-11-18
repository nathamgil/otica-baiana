/* Dados da Ótica Baiana. O que veio do Instagram (18/11/2026) está marcado; o resto é "a confirmar". */
window.OTICA = {
  nome: 'Ótica Baiana',
  instagram: 'oticabaianaoficial',
  whatsapp: '5571981346969',          // (71) 98134-6969, do post da loja
  whatsappTexto: '(71) 98134-6969',
  bio: ['Óculos de grau, sol e lentes de contato.', 'Armações exclusivas e variadas.'],
  unidades: [{
    nome: 'Shopping Piedade',
    endereco: 'Shopping Piedade, piso L2, ao lado do balcão da Amávia',
    bairro: 'Centro, Salvador - BA',
    horario: 'Horário do shopping (a confirmar)',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Shopping+Piedade+Salvador'
  }],
  categorias: [
    { id: 'grau', nome: 'Óculos de grau' },
    { id: 'sol', nome: 'Óculos de sol' },
    { id: 'lentes', nome: 'Lentes de contato' }
  ],
  // Fotos reais dos posts. Nome, estilo e preço são de exemplo até a loja passar o catálogo.
  produtos: [
    { id: 'p1', cat: 'grau', nome: 'Armação gatinho translúcida', estilo: 'Gatinho', marca: 'A confirmar', foto: 'fotos/03.jpg', estoque: 6 },
    { id: 'p2', cat: 'grau', nome: 'Armação redonda leve', estilo: 'Redondo', marca: 'A confirmar', foto: 'fotos/09.jpg', estoque: 4 },
    { id: 'p3', cat: 'grau', nome: 'Armação oversized', estilo: 'Oversized', marca: 'A confirmar', foto: 'fotos/06.jpg', estoque: 3 },
    { id: 'p4', cat: 'grau', nome: 'Armação quadrada clássica', estilo: 'Quadrado', marca: 'A confirmar', foto: 'fotos/05.jpg', estoque: 2 },
    { id: 'p5', cat: 'grau', nome: 'Armação fina do dia a dia', estilo: 'Redondo', marca: 'A confirmar', foto: 'fotos/04.jpg', estoque: 8 },
    { id: 'p6', cat: 'sol', nome: 'Óculos de sol escuro', estilo: 'Quadrado', marca: 'A confirmar', foto: 'fotos/08.jpg', estoque: 5 },
    { id: 'p7', cat: 'sol', nome: 'Parede de óculos de sol', estilo: 'Variados', marca: 'A confirmar', foto: 'fotos/02.jpg', estoque: 12 },
    { id: 'p8', cat: 'lentes', nome: 'Lentes de contato', estilo: 'Sob receita', marca: 'A confirmar', foto: 'fotos/10.jpg', estoque: 0 }
  ]
};
