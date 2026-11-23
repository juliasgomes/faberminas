import { Category, Product } from "../types";

const BASE_CATEGORIES: Category[] = [
  { id: "limpeza", label: "Limpeza", icon: "droplets", desc: "Rodos, vassouras, panos, fibras e acessórios de higienização" },
  { id: "higiene-pessoal", label: "Higiene Pessoal", icon: "sparkles", desc: "Sabonetes, shampoos, desodorantes, higiene bucal e cuidados pessoais" },
  { id: "hospitalar", label: "Hospitalar", icon: "stethoscope", desc: "Imobilização, curativos, neonatologia e insumos clínicos" },
  { id: "higiene-absorventes", label: "Higiene & Absorventes", icon: "shield-check", desc: "Fraldas infantis, geriátricas e absorventes higiênicos" },
  { id: "ferramentas", label: "Ferramentas", icon: "wrench", desc: "Baldes graduados, ferramentas manuais e medição" },
  { id: "epi", label: "EPI", icon: "hard-hat", desc: "Equipamentos de proteção individual e segurança" },
  { id: "embalagens", label: "Embalagens", icon: "package", desc: "Caixas térmicas e berços protetores em isopor (EPS)" },
  { id: "diversos", label: "Diversos", icon: "box", desc: "Suprimentos gerais e itens complementares" }
];

export interface SubTypeFilter {
  id: string;
  label: string;
  match: (p: Product) => boolean;
}

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const PRODUCT_SUBTYPE_FILTERS: SubTypeFilter[] = [
  { id: "luva", label: "Luvas", match: (p) => /\bluva\b/.test(norm(p.name)) },
  { id: "rodo", label: "Rodos", match: (p) => /\brodo\b/.test(norm(p.name)) },
  { id: "fralda", label: "Fraldas", match: (p) => /\bfralda\b/.test(norm(p.name)) },
  { id: "vassoura", label: "Vassouras & Vasculhos", match: (p) => /\b(vassoura|vassourao|vasculho)\b/.test(norm(p.name)) },
  { id: "escova", label: "Escovas", match: (p) => /\bescova\b/.test(norm(p.name)) },
  { id: "pano-flanela", label: "Panos & Flanelas", match: (p) => /\b(pano|flanela)\b/.test(norm(p.name)) },
  { id: "esponja-fibra", label: "Esponjas, Fibras & Capachos", match: (p) => /\b(esponja|fibra|palha de aco|capacho)\b/.test(norm(p.name)) },
  { id: "lixeira-pa", label: "Lixeiras & Pás de Lixo", match: (p) => /\b(lixeira|pa de lixo)\b/.test(norm(p.name)) },
  { id: "sabonete-sabao", label: "Sabonetes, Sabão & Pastas", match: (p) => /\b(sabonete|sabao|saponaceo|pasta)\b/.test(norm(p.name)) },
  { id: "desentupidor", label: "Desentupidores", match: (p) => /\bdesentupidor\b/.test(norm(p.name)) },
  { id: "disco", label: "Discos p/ Enceradeira", match: (p) => /\bdisco\b/.test(norm(p.name)) },
  { id: "mop", label: "Mops & Refis", match: (p) => /\bmop\b/.test(norm(p.name)) },
  { id: "cabo", label: "Cabos & Extensores", match: (p) => /^(cabo|prolongador)\b/.test(norm(p.name)) },
  { id: "balde", label: "Baldes", match: (p) => /\bbalde\b/.test(norm(p.name)) },
  { id: "absorvente", label: "Absorventes", match: (p) => /\babsorvente\b/.test(norm(p.name)) },
  { id: "avental-touca", label: "Aventais & Toucas TNT", match: (p) => /\b(avental|touca)\b/.test(norm(p.name)) },
  { id: "compressa", label: "Curativos, Meias & Malha Tubular", match: (p) => /\b(compressa|malha tubular|meia termica)\b/.test(norm(p.name)) },
  { id: "mamadeira-bico", label: "Mamadeiras, Bicos & Chupetas", match: (p) => /^(mamadeira|bico|chupeta)\b/.test(norm(p.name)) },
  { id: "tala-colar", label: "Talas, Splints & Colares Cervicais", match: (p) => /\b(tala|colar|splint)\b/.test(norm(p.name)) },
  { id: "gelo-isopor", label: "Caixas & Berços de Isopor", match: (p) => /\b(gelo|isopor)\b/.test(norm(p.name)) },
  { id: "shampoo-cuidado", label: "Shampoos, Higiene Bucal & Pessoais", match: (p) => /\b(shampoo|condicionador|creme|desodorante|repelente|protetor|cortador|haste|aparelho|fio dental|banheira)\b/.test(norm(p.name)) },
  { id: "ferramenta-manual", label: "Ferramentas Manuais", match: (p) => /\b(martelo|arco de serra|trena)\b/.test(norm(p.name)) }
];

interface RawCatalogEntry {
  codigo: string;
  nome: string;
  categoria?: string;
  medidas?: string;
  especificacoes?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  "Higiene Pessoal": "higiene-pessoal",
  "Limpeza": "limpeza",
  "Hospitalar": "hospitalar",
  "Ferramentas": "ferramentas",
  "EPI": "epi",
  "Higiene & Absorventes": "higiene-absorventes",
  "Embalagens": "embalagens",
  "Diversos": "diversos"
};

function cleanProductTitle(rawName: string): string {
  return (rawName || "").trim().replace(/\s{2,}/g, " ");
}

function buildAbout(catLabel: string, cleanName: string, rawName: string): string {
  const n = norm(rawName);
  if (n.includes("fralda geriatrica")) return `${cleanName} de alta absorção, projetado para oferecer conforto prolongado, segurança contra vazamentos e praticidade na troca diária.`;
  if (n.includes("fralda")) return `${cleanName} com ajuste anatômico e toque macio, desenvolvido para manter a pele seca e protegida com máxima mobilidade.`;
  if (n.includes("absorvente")) return `${cleanName} com cobertura suave e alta capacidade de retenção para proteção segura no pós-operatório ou uso diário.`;
  if (n.includes("rodo")) return `${cleanName} desenvolvido para escoamento eficiente de água e secagem uniforme de pisos sem deixar marcas.`;
  if (n.includes("vassoura") || n.includes("vassourao") || n.includes("vasculho")) return `${cleanName} com cerdas resistentes para varrição eficiente de poeira, resíduos e sujidades em diferentes superfícies.`;
  if (n.includes("mop")) return `${cleanName} prático para higienização rápida de pisos, reduzindo o esforço operacional e otimizando o consumo de água.`;
  if (n.includes("cabo") || n.includes("prolongador")) return `${cleanName} com encaixe firme para acoplamento seguro de rodos, vassouras e acessórios de limpeza.`;
  if (n.includes("pano") || n.includes("flanela")) return `${cleanName} de alta absorção e resistência a lavagens frequentes, ideal para secar e dar acabamento sem riscar superfícies.`;
  if (n.includes("esponja") || n.includes("fibra")) return `${cleanName} desenvolvido para agilizar a remoção de gorduras, incrustações e sujeiras do dia a dia com ótimo rendimento.`;
  if (n.includes("capacho")) return `${cleanName} resistente para retenção de poeira e umidade em acessos de alto fluxo.`;
  if (n.includes("lixeira") || n.includes("pa de lixo")) return `${cleanName} estruturado para coleta e acondicionamento higiênico de resíduos com praticidade no esvaziamento.`;
  if (n.includes("sabonete") || n.includes("sabao") || n.includes("pasta para limpeza")) return `${cleanName} com formulação equilibrada para limpeza eficaz, promovendo remoção de sujidades e higienização confiável.`;
  if (n.includes("desentupidor")) return `${cleanName} de vedação eficiente, desenvolvido para desobstruir pias e vasos sanitários de forma mecânica e rápida.`;
  if (n.includes("disco enceradeira")) return `${cleanName} de alta performance para enceradeiras conservadoras, garantindo tratamento uniforme de pisos.`;
  if (n.includes("escova dental") || n.includes("fio dental")) return `${cleanName} voltado à higiene bucal diária com conforto, alcance eficiente e suavidade.`;
  if (n.includes("escova")) return `${cleanName} com ergonomia funcional e cerdas duráveis para limpeza precisa e sem esforço excessivo.`;
  if (n.includes("shampoo") || n.includes("condicionador") || n.includes("desodorante") || n.includes("haste flexivel") || n.includes("aparelho de barbear") || n.includes("cortador de unhas")) {
    return `${cleanName} selecionado para rotinas de cuidado pessoal, hotelaria, vestiários corporativos e uso doméstico.`;
  }
  if (n.includes("touca")) return `${cleanName} leve e respirável para controle sanitário e higiene em cozinhas, clínicas e áreas técnicas.`;
  if (n.includes("balde")) return `${cleanName} reforçado para preparo de soluções, transporte de água e apoio em serviços de manutenção.`;
  if (n.includes("martelo") || n.includes("arco de serra") || n.includes("trena")) return `${cleanName} robusto e preciso, projetado para rotinas de manutenção predial, reparos e medições profissionais.`;
  if (n.includes("isopor")) return `${cleanName} em poliestireno expandido (EPS) para isolamento térmico seguro e proteção física no transporte.`;
  if (n.includes("mamadeira") || n.includes("chupeta") || n.includes("bico")) return `${cleanName} fabricado com material atóxico e acabamento suave para segurança neonatal e pediátrica.`;
  if (n.includes("tala") || n.includes("colar") || n.includes("splint") || n.includes("malha tubular") || n.includes("meia termica")) {
    return `${cleanName} de padrão clínico-hospitalar, desenvolvido para oferecer conforto, imobilização segura e suporte assistencial.`;
  }
  return `${cleanName} pertencente à linha ${catLabel}, selecionado pela Faberminas para suprimento contínuo com excelente custo-benefício.`;
}

function buildDescription(rawName: string, catLabel: string, measures: string): string {
  const n = norm(rawName);
  const medidaInfo = measures && measures !== "Padrão comercial" ? ` Formato disponível: ${measures}.` : "";

  if (n.includes("fralda")) {
    return `Indicado para rotinas assistenciais em clínicas, residências e instituições.${medidaInfo} Verifique o ajuste nas abas laterais e elásticos após a colocação para garantir vedação completa e bem-estar.`;
  }
  if (n.includes("absorvente")) {
    return `Indicado para cuidados pós-operatórios e proteção íntima prolongada.${medidaInfo} Posicione de forma centralizada e realize trocas periódicas para manter a pele limpa e seca.`;
  }
  if (n.includes("rodo") || n.includes("mop") || n.includes("cabo") || n.includes("prolongador")) {
    return `Aplicado na manutenção de pisos frios, porcelanatos, corredores corporativos e áreas externas.${medidaInfo} Enxágue e deixe secar após o uso para prolongar a vida útil da base, borracha ou refil.`;
  }
  if (n.includes("vassoura") || n.includes("vassourao") || n.includes("vasculho")) {
    return `Recomendado para varrição interna e externa em condomínios, escritórios, comércios e residências.${medidaInfo} Armazene suspenso pelo cabo para preservar o alinhamento original das cerdas.`;
  }
  if (n.includes("pano") || n.includes("flanela") || n.includes("capacho")) {
    return `Ideal para higienização de bancadas, vidros, pisos e áreas de circulação em empresas e lares.${medidaInfo} Lave separadamente após o expediente de limpeza para manter a eficiência das fibras.`;
  }
  if (n.includes("esponja") || n.includes("fibra")) {
    return `Indicado para copas, cozinhas industriais, banheiros e manutenção geral.${medidaInfo} Quando utilizar fibras abrasivas em superfícies polidas ou antiaderentes, realize teste prévio em área discreta.`;
  }
  if (n.includes("lixeira") || n.includes("pa de lixo")) {
    return `Adequado para escritórios, sanitários, consultórios e áreas comuns condominiais.${medidaInfo} Combine com sacos plásticos compatíveis à capacidade para agilizar o descarte diário.`;
  }
  if (n.includes("disco enceradeira")) {
    return `Projetado para acoplamento em conservadoras e enceradeiras industriais em hospitais, shoppings e galpões.${medidaInfo} Centralize no prato suporte antes de iniciar a operação e higienize após o uso.`;
  }
  if (n.includes("martelo") || n.includes("arco de serra") || n.includes("trena") || n.includes("balde")) {
    return `Indicado para equipes de manutenção predial, zeladoria condominial, oficinas e uso doméstico.${medidaInfo} Utilize sempre conforme a capacidade e especificação técnica de trabalho.`;
  }
  if (n.includes("isopor")) {
    return `Indicado para acondicionamento térmico e transporte seguro de insumos sensíveis, medicamentos ou ampolas.${medidaInfo} Mantenha tampado durante todo o trajeto para preservar a estabilidade interna.`;
  }
  if (norm(catLabel) === "hospitalar") {
    return `Destinado ao suporte de procedimentos clínicos, ambulatoriais e cuidados hospitalares ou domiciliares.${medidaInfo} Armazenar em local limpo, seco e protegido da umidade, seguindo boas práticas de higiene.`;
  }
  if (norm(catLabel) === "higiene pessoal") {
    return `Indicado para abastecimento de sanitários, kits individuais, hotéis, clínicas e uso residencial.${medidaInfo} Disponível para cotação unitária (CPF) ou em lotes corporativos (CNPJ) com entrega própria.`;
  }
  return `Aplicável em rotinas profissionais e residenciais da linha ${catLabel}, atendendo pedidos avulsos (CPF) e reposições empresariais (CNPJ).${medidaInfo} Consulte disponibilidade e prazos de entrega em BH e Região via WhatsApp.`;
}

const RAW_ENTRIES: RawCatalogEntry[] = [
  { codigo: "00393", nome: "Fralda Descartável c/ Barreira e Indicador Karicia Infantil", categoria: "Diversos", medidas: "Tamanho PP", especificacoes: "Com barreira antivazamento e indicador de umidade, marca Karicia" },
  { codigo: "01689444", nome: "Martelo Tipo de Unha", categoria: "Ferramentas", medidas: "305 x 110 x 33mm | Cabo 300mm", especificacoes: "Tipo unha, cabo de 300mm, marca Tekfund" },
  { codigo: "1047698", nome: "Balde Plástico Graduado Alça Metal", categoria: "Ferramentas", medidas: "Capacidade 20 Litros", especificacoes: "Plástico graduado, alça metálica, marca Bremen" },
  { codigo: "1152629-E1", nome: "Pano de Chão Lavado Alvejado 100% Algodão", categoria: "Limpeza", medidas: "60cm x 80cm", especificacoes: "Lavado, alvejado, 100% algodão, marca Intextil" },
  { codigo: "1161784-PL", nome: "Pano de Prato Alvejado 100% Algodão", categoria: "Limpeza", medidas: "40cm x 65cm", especificacoes: "Alvejado, 100% algodão, acabamento nas laterais, marca Intextil" },
  { codigo: "1175858", nome: "Balde Plástico Preto Alça Metal", categoria: "Ferramentas", medidas: "Capacidade 12 Litros", especificacoes: "Cor preta, alça metálica, marca Ecoplastic" },
  { codigo: "1200410", nome: "Vassourão Gari Cerdas Nylon", categoria: "Limpeza", medidas: "Base 40cm | Cabo 1,60m", especificacoes: "Cerdas de nylon, cabo de madeira revestido em plástico, marca Halley" },
  { codigo: "1247298", nome: "Lixeira Plástica Retangular c/ Tampa e Pedal Branca", categoria: "Limpeza", medidas: "Capacidade 15 Litros", especificacoes: "Plástica, cor branca, retangular, com tampa e pedal, marca Jaguar" },
  { codigo: "1260405", nome: "Pá de Lixo Plástica c/ Tampa", categoria: "Limpeza", medidas: "Cabo 90cm", especificacoes: "Com tampa, plástica, cabo de madeira revestido, marca Perfect Pro" },
  { codigo: "126160-F4", nome: "Flanela de Limpeza 100% Algodão Laranja", categoria: "Limpeza", medidas: "40cm x 60cm", especificacoes: "100% algodão, cor laranja, marca Intextil" },
  { codigo: "1271326", nome: "Lixeira Plástica Cilíndrica c/ Tampa Neutra", categoria: "Limpeza", medidas: "Capacidade 60 Litros", especificacoes: "Plástica, cor neutra, cilíndrica com tampa, marca Arqplast" },
  { codigo: "1402757", nome: "Esponja para Banho Espuma c/ Manta Abrasiva", categoria: "Higiene Pessoal", medidas: "Padrão banho", especificacoes: "Espuma com manta abrasiva, marca Mais Banho" },
  { codigo: "1485415", nome: "Lixeira Escritório Retangular Preta", categoria: "Limpeza", medidas: "Capacidade 08 Litros", especificacoes: "Cor preta, retangular, linha Office" },
  { codigo: "1545116", nome: "Shampoo para Cabelos 2 em 1", categoria: "Higiene Pessoal", medidas: "350ml", especificacoes: "Fórmula 2 em 1, marca Darling" },
  { codigo: "1640046", nome: "Fibra Sintética Verde Retangular Limpeza Geral", categoria: "Limpeza", medidas: "Retangular", especificacoes: "Fibra sintética verde para limpeza geral, marca Nobre" },
  { codigo: "1666223", nome: "Rodo Base Plástica 2 Borrachas", categoria: "Limpeza", medidas: "Base 60cm | Cabo 120cm", especificacoes: "Base plástica, 2 borrachas, cabo de madeira revestido, marca King" },
  { codigo: "1686844", nome: "Absorvente Higiênico Pós-Operatório", categoria: "Higiene & Absorventes", medidas: "10cm x 40cm | Pct c/ 20un", especificacoes: "Uso pós-operatório, pacote com 20 unidades, marca Incontinence" },
  { codigo: "1687140", nome: "Vassoura Cerdas Piaçava Sintética", categoria: "Limpeza", medidas: "Base 20cm | Cabo 1,20m", especificacoes: "Cerdas piaçava sintética, cabo de madeira revestido com rosca, marca Halley" },
  { codigo: "1689533", nome: "Sabão de Coco em Barra", categoria: "Limpeza", medidas: "200g", especificacoes: "Em barra, marca Atlas" },
  { codigo: "1693360", nome: "Sabão em Pó", categoria: "Limpeza", medidas: "1kg", especificacoes: "Em pó, marca Atlas" },
  { codigo: "175781-F3", nome: "Flanela de Limpeza 100% Algodão Laranja", categoria: "Limpeza", medidas: "40cm x 40cm", especificacoes: "100% algodão, cor laranja, marca Intextil" },
  { codigo: "1810340", nome: "Vassoura Cerdas Piaçava Sintética", categoria: "Limpeza", medidas: "Base 60cm | Cabo 1,20m", especificacoes: "Cerdas piaçava sintética, cabo de madeira revestido, marca Halley" },
  { codigo: "1810472", nome: "Vassoura Cerdas Pelo Natural", categoria: "Limpeza", medidas: "Base 40cm | Cabo 1,50m", especificacoes: "Cerdas pelo natural, cabo de madeira revestido, marca Halley" },
  { codigo: "1810561", nome: "Fibra Sintética Azul Limpeza Pesada", categoria: "Limpeza", medidas: "Retangular", especificacoes: "Fibra sintética azul para limpeza pesada, marca SuperPro" },
  { codigo: "1810634", nome: "Vassoura Cerdas Piaçava c/ Rosca", categoria: "Limpeza", medidas: "Base 40cm | Cabo 1,50m", especificacoes: "Cerdas de piaçava, cabo de madeira revestido com rosca, marca Halley" },
  { codigo: "1844628", nome: "Vassoura Cerdas Piaçava Nº 05", categoria: "Limpeza", medidas: "Base Nº 05 | Cabo 1,50m", especificacoes: "Cerdas de piaçava, cabo de madeira revestido, marca Halley" },
  { codigo: "1851225-A4", nome: "Pano de Chão Lavado Alvejado 100% Algodão", categoria: "Limpeza", medidas: "50cm x 70cm", especificacoes: "Lavado, alvejado, 100% algodão, marca Intextil" },
  { codigo: "1852833", nome: "Vassoura Cerdas Pelo Natural", categoria: "Limpeza", medidas: "Base 60cm | Cabo 1,50m", especificacoes: "Cerdas pelo natural, cabo de madeira revestido, marca Halley" },
  { codigo: "1852868", nome: "Vasculho Limpa-Teto Cerdas Nylon", categoria: "Limpeza", medidas: "Cabo 2,20m", especificacoes: "Cerdas de nylon, cabo de madeira revestido, marca Halley" },
  { codigo: "1861093", nome: "Vassoura Cerdas Palha", categoria: "Limpeza", medidas: "Base 30cm x 50cm | Cabo 1,00m", especificacoes: "Cerdas de palha, cabo de madeira, marca Halley" },
  { codigo: "372447-F4", nome: "Flanela de Limpeza 100% Algodão Laranja", categoria: "Limpeza", medidas: "38cm x 58cm", especificacoes: "100% algodão, cor laranja, marca Intextil" },
  { codigo: "549045", nome: "Escova p/ Vaso Sanitário c/ Estojo", categoria: "Limpeza", medidas: "Padrão sanitário", especificacoes: "Material plástico com estojo, cerdas de nylon, marca Halley" },
  { codigo: "554391", nome: "Disco Enceradeira Limpador Verde", categoria: "Limpeza", medidas: "Diâmetro 350mm", especificacoes: "Disco limpador cor verde, marca SuperPro" },
  { codigo: "556076", nome: "Disco Enceradeira Limpador Preto", categoria: "Limpeza", medidas: "Diâmetro 350mm", especificacoes: "Disco limpador cor preta, marca SuperPro" },
  { codigo: "556084", nome: "Disco Enceradeira Removedor Preto", categoria: "Limpeza", medidas: "Diâmetro 440mm", especificacoes: "Disco removedor cor preta, marca SuperPro" },
  { codigo: "56235", nome: "Arco de Serra Aço Temperado Cabo Plástico", categoria: "Ferramentas", medidas: "Serra 12 polegadas", especificacoes: "Aço temperado, cabo de plástico, marca Mega" },
  { codigo: "675539-A7", nome: "Pano de Chão Lavado Alvejado 100% Algodão", categoria: "Limpeza", medidas: "50cm x 80cm", especificacoes: "Lavado, alvejado, 100% algodão, marca Intextil" },
  { codigo: "723177", nome: "Balde Plástico Alça Metal", categoria: "Ferramentas", medidas: "Capacidade 15 Litros", especificacoes: "Plástico, alça metálica, marca Arqplast" },
  { codigo: "749079", nome: "Vasculho Limpa-Teto Cerdas Sisal", categoria: "Limpeza", medidas: "Cabo 2,20m", especificacoes: "Cerdas de sisal, cabo de madeira revestido, marca Halley" },
  { codigo: "79790-F1", nome: "Flanela de Limpeza 100% Algodão Laranja", categoria: "Limpeza", medidas: "30cm x 40cm", especificacoes: "100% algodão, cor laranja, marca Intextil" },
  { codigo: "85480-C3", nome: "Pano de Chão Cru 100% Algodão", categoria: "Limpeza", medidas: "45cm x 75cm", especificacoes: "Tecido cru, 100% algodão, marca Intextil" },
  { codigo: "935026", nome: "Desodorante Spray Antiperspirante e Antisséptico", categoria: "Higiene Pessoal", medidas: "90ml", especificacoes: "Spray sem perfume, ação antiperspirante e antisséptica" },
  { codigo: "976261", nome: "Disco Enceradeira Removedor Preto", categoria: "Limpeza", medidas: "Diâmetro 510mm", especificacoes: "Disco removedor cor preta, marca SuperPro" },
  { codigo: "985368", nome: "Capacho em Fibra Vinil", categoria: "Limpeza", medidas: "70cm x 40cm x 1cm", especificacoes: "Fibra de vinil, marca Master" },
  { codigo: "ARQ22", nome: "Balde Plástico Alça Metal", categoria: "Ferramentas", medidas: "Capacidade 20 Litros", especificacoes: "Plástico resistente, alça metálica, marca Arqplast" },
  { codigo: "BKL-0.205", nome: "Pá de Lixo Cabo Curto", categoria: "Limpeza", medidas: "Cabo curto", especificacoes: "Uso manual" },
  { codigo: "BLK-0.011", nome: "Rodo Base Metal 2 Borrachas s/ Cabo", categoria: "Limpeza", medidas: "Base 40cm", especificacoes: "Base metálica, 2 borrachas, sistema rosca, sem cabo" },
  { codigo: "BLK-0.027", nome: "Rodo Base Plástica 2 Borrachas s/ Cabo", categoria: "Limpeza", medidas: "Base 30cm", especificacoes: "Base plástica, 2 borrachas, sistema rosca, sem cabo" },
  { codigo: "BLK-0.028", nome: "Rodo Base Plástica 2 Borrachas s/ Cabo", categoria: "Limpeza", medidas: "Base 40cm", especificacoes: "Base plástica, 2 borrachas, sistema rosca, sem cabo" },
  { codigo: "BLK-0.029", nome: "Rodo Base Plástica 2 Borrachas s/ Cabo", categoria: "Limpeza", medidas: "Base 60cm", especificacoes: "Base plástica, 2 borrachas, sistema rosca, sem cabo" },
  { codigo: "BLK-0.206", nome: "Pá de Lixo 90° s/ Cabo", categoria: "Limpeza", medidas: "Articulação 90°", especificacoes: "Coletora 90 graus, sem cabo" },
  { codigo: "BLK-0.222", nome: "Desentupidor Vaso Sanitário s/ Cabo", categoria: "Limpeza", medidas: "Padrão sanitário", especificacoes: "Borracha flexível, sem cabo" },
  { codigo: "C 000053", nome: "Haste Flexível sem Visor", categoria: "Higiene Pessoal", medidas: "Pacote c/ 75 unidades", especificacoes: "Pontas de algodão, caixa sem visor, marca Cotton Line" },
  { codigo: "CRI001", nome: "Pasta para Limpeza Pesada em Geral", categoria: "Limpeza", medidas: "Pote padrão", especificacoes: "Desengraxante e limpeza pesada multiuso" },
  { codigo: "CYN002", nome: "Escova Dental Macia Infantil", categoria: "Higiene Pessoal", medidas: "Tamanho Infantil", especificacoes: "Cerdas macias, marca CYN" },
  { codigo: "DESP23", nome: "Desentupidor de Pia Borracha", categoria: "Limpeza", medidas: "Padrão pia", especificacoes: "Ventosa de borracha, marca Halley" },
  { codigo: "DPG0116", nome: "Escova Higienização Recipientes Cerdas Nylon", categoria: "Limpeza", medidas: "Haste 30cm | Cerdas 20mm", especificacoes: "Cerdas de nylon 20mm para recipientes, marca Facilita" },
  { codigo: "DST23", nome: "Desentupidor Sanitário de Borracha Cabo Madeira", categoria: "Limpeza", medidas: "Padrão sanitário", especificacoes: "Ventosa de borracha com cabo de madeira, marca Halley" },
  { codigo: "EF2299", nome: "Esponja Sanitária Dupla Face Espuma c/ Manta Abrasiva", categoria: "Limpeza", medidas: "Padrão dupla face", especificacoes: "Espuma com manta abrasiva para uso sanitário, marca Esponflora" },
  { codigo: "EMB001", nome: "Aparelho de Barbear Descartável 2 Lâminas", categoria: "Higiene Pessoal", medidas: "2 lâminas", especificacoes: "Descartável, cabo ergonômico, marca Persomax" },
  { codigo: "EMB002", nome: "Mop para Limpeza Úmido", categoria: "Limpeza", medidas: "40cm x 12cm", especificacoes: "Mop úmido completo, marca Bompack" },
  { codigo: "EMB003", nome: "Refil Mop para Limpeza Chenille Úmido", categoria: "Limpeza", medidas: "40cm x 12cm", especificacoes: "Microfibra chenille para mop úmido, marca Bompack" },
  { codigo: "FLY350HO", nome: "Bico de Mamadeira Mamasil Silicone", categoria: "Hospitalar", medidas: "Padrão mamadeira", especificacoes: "Silicone atóxico, marca Fly Colors" },
  { codigo: "FLY353HO", nome: "Bico de Mamadeira Mini-Ortodôntico Silicone", categoria: "Hospitalar", medidas: "Mini-ortodôntico", especificacoes: "Silicone atóxico, marca Fly Colors" },
  { codigo: "FLY370HO", nome: "Bico de Mamadeira Ortodôntico Silicone", categoria: "Hospitalar", medidas: "Ortodôntico", especificacoes: "Silicone atóxico, marca Fly Colors" },
  { codigo: "FM0001", nome: "Fralda Infantil Neonatus", categoria: "Higiene & Absorventes", medidas: "Neonatal (0,8 a 2kg) | Pct c/ 20un", especificacoes: "Pacote com 20 unidades, linha Neonatus" },
  { codigo: "FM0142", nome: "Escova p/ Higienização de Mamadeiras", categoria: "Limpeza", medidas: "Para recipientes 240ml", especificacoes: "Cerdas especiais para limpeza interna, marca Facilita" },
  { codigo: "FM22", nome: "Escova de Roupa Base Plástica Cerdas Nylon", categoria: "Limpeza", medidas: "Padrão anatômica", especificacoes: "Base plástica, cabo e cerdas em nylon, marca FM" },
  { codigo: "FM23", nome: "Rodo Base Plástica 2 Borrachas", categoria: "Limpeza", medidas: "Base 40cm | Cabo 160cm", especificacoes: "Base plástica, 2 borrachas, cabo de madeira revestido, marca Halley" },
  { codigo: "FM25", nome: "Escova Limpeza das Unhas Cerdas Nylon", categoria: "Limpeza", medidas: "Compacta", especificacoes: "Corpo plástico, cerdas em nylon, marca Escobel" },
  { codigo: "FM28", nome: "Rodo Base Metal 2 Borrachas", categoria: "Limpeza", medidas: "Base 40cm | Cabo 160cm", especificacoes: "Base metálica, 2 borrachas, cabo de madeira revestido, marca Halley" },
  { codigo: "FM30", nome: "Rodo Base Plástica 2 Borrachas", categoria: "Limpeza", medidas: "Base 30cm | Cabo 120cm", especificacoes: "Base plástica, 2 borrachas, cabo de madeira revestido, marca Halley" },
  { codigo: "FM31", nome: "Pá de Lixo 90° Plástica", categoria: "Limpeza", medidas: "Articulação 90°", especificacoes: "Coletora plástica 90 graus, cabo de madeira revestido, marca Halley" },
  { codigo: "FM32", nome: "Desentupidor Vaso Sanitário Cabo Revestido", categoria: "Limpeza", medidas: "Cabo 60cm", especificacoes: "Ventosa de borracha, cabo revestido, marca Halley" },
  { codigo: "FM40", nome: "Escova p/ Vaso Sanitário c/ Estojo", categoria: "Limpeza", medidas: "Padrão sanitário", especificacoes: "Material plástico com estojo, cerdas de nylon, marca Original" },
  { codigo: "FM42", nome: "Desentupidor de Pia Borracha", categoria: "Limpeza", medidas: "Padrão pia", especificacoes: "Borracha flexível, marca FM" },
  { codigo: "FM43", nome: "Desentupidor de Pia Borracha Sanfonado", categoria: "Limpeza", medidas: "Padrão pia", especificacoes: "Modelo sanfonado de alta pressão, borracha, marca FM" },
  { codigo: "HAL901", nome: "Cabo de Madeira Revestimento Plástico c/ Rosca", categoria: "Limpeza", medidas: "Comprimento 1,50m", especificacoes: "Madeira com revestimento plástico e ponteira de rosca" },
  { codigo: "HAL902", nome: "Cabo de Madeira Revestimento Plástico c/ Rosca", categoria: "Limpeza", medidas: "Comprimento 60cm", especificacoes: "Madeira com revestimento plástico e ponteira de rosca" },
  { codigo: "HAL903", nome: "Cabo de Madeira Revestimento Plástico c/ Rosca", categoria: "Limpeza", medidas: "Comprimento 1,20m", especificacoes: "Madeira com revestimento plástico e ponteira de rosca" },
  { codigo: "HF0120", nome: "Fralda Infantil Cherito", categoria: "Higiene & Absorventes", medidas: "Neonatal (0,8 a 2kg) | Pct c/ 20un", especificacoes: "Pacote com 20 unidades, marca Cherito" },
  { codigo: "IB001", nome: "Sabonete Sachê", categoria: "Higiene Pessoal", medidas: "10g", especificacoes: "Embalagem individual sachê para hotelaria/hospitais, marca Mahy" },
  { codigo: "IB002", nome: "Sabonete Sachê", categoria: "Higiene Pessoal", medidas: "11g", especificacoes: "Embalagem individual sachê para hotelaria/hospitais, marca Grion" },
  { codigo: "L01/30P", nome: "Shampoo 2 em 1 Sachê Perolado", categoria: "Higiene Pessoal", medidas: "30ml", especificacoes: "Fórmula perolada 2 em 1, embalagem sachê, marca Dovely" },
  { codigo: "L5630P2", nome: "Sabonete Líquido Sachê Neutro sem Cheiro", categoria: "Higiene Pessoal", medidas: "30ml", especificacoes: "Neutro, sem fragrância, embalagem sachê, marca Dovely / Dolce Brazilis" },
  { codigo: "LOLLY1", nome: "Chupeta Silicone Bebês", categoria: "Hospitalar", medidas: "0 a 6 meses", especificacoes: "Silicone macio atóxico, marca Lolly" },
  { codigo: "LOLLY1971-00-AZ", nome: "Mamadeira Mini Tip Bico Silicone Redondo", categoria: "Hospitalar", medidas: "50ml", especificacoes: "Bico de silicone redondo, marca Lolly" },
  { codigo: "MAR004", nome: "Sabonete em Tablete Comum", categoria: "Higiene Pessoal", medidas: "90g", especificacoes: "Em barra/tablete, marca Marluce" },
  { codigo: "MH00393", nome: "Fralda Infantil Karicia c/ Barreira e Indicador", categoria: "Higiene & Absorventes", medidas: "Tamanho PP | Pct c/ 16un", especificacoes: "Com barreira antivazamento e indicador de umidade, marca Karicia" },
  { codigo: "MH00401", nome: "Fralda Infantil Karicia c/ Barreira e Indicador", categoria: "Higiene & Absorventes", medidas: "Tamanho P | Pct c/ 14un", especificacoes: "Com barreira antivazamento e indicador de umidade, marca Karicia" },
  { codigo: "MH00402", nome: "Fralda Infantil Karicia c/ Barreira e Indicador", categoria: "Higiene & Absorventes", medidas: "Tamanho M | Pct c/ 12un", especificacoes: "Com barreira antivazamento e indicador de umidade, marca Karicia" },
  { codigo: "MH00403", nome: "Fralda Infantil Karicia c/ Barreira e Indicador", categoria: "Higiene & Absorventes", medidas: "Tamanho G | Pct c/ 10un", especificacoes: "Com barreira antivazamento e indicador de umidade, marca Karicia" },
  { codigo: "MH00404", nome: "Fralda Infantil Karicia c/ Barreira e Indicador", categoria: "Higiene & Absorventes", medidas: "Tamanho EG | Pct c/ 10un", especificacoes: "Com barreira antivazamento e indicador de umidade, marca Karicia" },
  { codigo: "MH00430", nome: "Fralda Geriátrica Incontinence", categoria: "Higiene & Absorventes", medidas: "Tamanho G | Pct c/ 08un", especificacoes: "Uso geriátrico/adulto, marca Incontinence" },
  { codigo: "MH00431", nome: "Fralda Geriátrica Incontinence", categoria: "Higiene & Absorventes", medidas: "Tamanho EG | Pct c/ 08un", especificacoes: "Uso geriátrico/adulto, marca Incontinence" },
  { codigo: "MH00432", nome: "Fralda Geriátrica Incontinence", categoria: "Higiene & Absorventes", medidas: "Tamanho P | Pct c/ 08un", especificacoes: "Uso geriátrico/adulto, marca Incontinence" },
  { codigo: "MH00453", nome: "Fralda Infantil Karicia c/ Barreira e Indicador", categoria: "Higiene & Absorventes", medidas: "Tamanho SEG | Pct c/ 08un", especificacoes: "Com barreira antivazamento e indicador de umidade, marca Karicia" },
  { codigo: "MH00465", nome: "Fralda Geriátrica Medifral Plus Sec c/ Barreira", categoria: "Higiene & Absorventes", medidas: "Tamanho P | Pct c/ 08un", especificacoes: "Gel absorvente, barreira antivazamento e indicador de umidade, marca Medifral Plus" },
  { codigo: "MH00466", nome: "Fralda Geriátrica Medifral Plus Sec c/ Barreira", categoria: "Higiene & Absorventes", medidas: "Tamanho M | Pct c/ 08un", especificacoes: "Gel absorvente, barreira antivazamento e indicador de umidade, marca Medifral Plus" },
  { codigo: "MH00467", nome: "Fralda Geriátrica Medifral Plus Sec c/ Barreira", categoria: "Higiene & Absorventes", medidas: "Tamanho G | Pct c/ 08un", especificacoes: "Gel absorvente, barreira antivazamento e indicador de umidade, marca Medifral Plus" },
  { codigo: "MH101148", nome: "Splint Intranasal Especial", categoria: "Hospitalar", medidas: "Cartela c/ 02 unidades", especificacoes: "Silicone grau médico, modelo especial, marca Medi House" },
  { codigo: "MSO45", nome: "Malha Tubular para Dedos Cru", categoria: "Hospitalar", medidas: "Rolo 25 metros", especificacoes: "Algodão cru tubular para curativos digitais" },
  { codigo: "MSO55", nome: "Tala Metálica Imobilizadora c/ Espuma", categoria: "Hospitalar", medidas: "19mm x 180mm", especificacoes: "Alumínio moldável revestido com espuma, marca MSO" },
  { codigo: "MSO70", nome: "Colar Cervical de Espuma", categoria: "Hospitalar", medidas: "Tamanho P", especificacoes: "Espuma anatômica com fecho aderente, marca MSO" },
  { codigo: "MSO71", nome: "Colar Cervical de Espuma", categoria: "Hospitalar", medidas: "Tamanho M", especificacoes: "Espuma anatômica com fecho aderente, marca MSO" },
  { codigo: "MSO72", nome: "Colar Cervical de Espuma", categoria: "Hospitalar", medidas: "Tamanho G", especificacoes: "Espuma anatômica com fecho aderente, marca MSO" },
  { codigo: "MSO730", nome: "Meia Térmica de Algodão", categoria: "Hospitalar", medidas: "Tamanho único", especificacoes: "Algodão térmico para conforto hospitalar, marca MSO" },
  { codigo: "NC001", nome: "Cortador de Unhas dos Pés Aço Inox", categoria: "Higiene Pessoal", medidas: "Tamanho grande (pés)", especificacoes: "Aço inoxidável de alta precisão, marca Premium" },
  { codigo: "PAS23", nome: "Pasta para Limpeza Pesada", categoria: "Limpeza", medidas: "500g", especificacoes: "Desengraxante para limpeza pesada, marca Cristal" },
  { codigo: "PR_AERO_001", nome: "Desodorante Spray Antiperspirante e Antisséptico", categoria: "Higiene Pessoal", medidas: "140ml", especificacoes: "Spray sem perfume, ação antiperspirante e antisséptica, marca Mood" },
  { codigo: "PR00028", nome: "Disco Enceradeira Limpador Verde", categoria: "Limpeza", medidas: "Diâmetro 350mm", especificacoes: "Disco limpador cor verde, marca Certec" },
  { codigo: "PRD00001", nome: "Fralda Geriátrica Medifral Plus Sec c/ Barreira", categoria: "Higiene & Absorventes", medidas: "Tamanho EG | Pct c/ 08un", especificacoes: "Gel absorvente, barreira antivazamento e indicador de umidade, marca Medifral Plus" },
  { codigo: "PRD00002", nome: "Shampoo Neutro Todos os Tipos de Cabelo Adulto", categoria: "Higiene Pessoal", medidas: "Frasco padrão", especificacoes: "Fórmula neutra uso adulto, marca Palmolive" },
  { codigo: "PRD00003", nome: "Condicionador Cabelos Normais", categoria: "Higiene Pessoal", medidas: "Frasco padrão", especificacoes: "Hidratação para cabelos normais, marca Neutrox" },
  { codigo: "PRD00007", nome: "Fibra Sintética Verde Retangular Limpeza Pesada", categoria: "Limpeza", medidas: "Retangular", especificacoes: "Fibra sintética verde abrasiva para limpeza pesada, marca Esponflora" },
  { codigo: "PRD00012", nome: "Esponja Sintética Dupla Face", categoria: "Limpeza", medidas: "Padrão multiuso", especificacoes: "Espuma macia e fibra abrasiva, marca Esponflora" },
  { codigo: "PRD00014", nome: "Escova Dental Adulto Média Cerdas Nylon Macia", categoria: "Higiene Pessoal", medidas: "Tamanho Adulto", especificacoes: "Cabeça média, cerdas de nylon macias, marca CYN" },
  { codigo: "PRD00015", nome: "Fibra Sintética Azul Limpeza Pesada", categoria: "Limpeza", medidas: "Retangular", especificacoes: "Fibra sintética azul para limpeza pesada, marca Esponflora" },
  { codigo: "PRD00016", nome: "Fibra Sintética Branca Limpeza Leve", categoria: "Limpeza", medidas: "Retangular", especificacoes: "Fibra sintética branca não abrasiva para limpeza leve/superfícies delicadas, marca Esponflora" },
  { codigo: "PRD00017", nome: "Fio Dental Encerado", categoria: "Higiene Pessoal", medidas: "Rolo 100 metros", especificacoes: "Fio encerado resistente ao desfiamento, marca Predent" },
  { codigo: "PRD00026", nome: "Esponja Sintética Dupla Face", categoria: "Limpeza", medidas: "Padrão multiuso", especificacoes: "Espuma e fibra sintética, marca Fuzuê" },
  { codigo: "PRD00027", nome: "Aparelho de Barbear Descartável 2 Lâminas", categoria: "Higiene Pessoal", medidas: "2 lâminas", especificacoes: "Descartável, marca Original" },
  { codigo: "PRD00029", nome: "Refil Mop Spray Microfibra Úmido", categoria: "Limpeza", medidas: "43cm x 15cm", especificacoes: "Microfibra lavável para mop spray, marca Bompack" },
  { codigo: "PRD00030", nome: "Caixa Térmica Isopor", categoria: "Embalagens", medidas: "Capacidade 500g", especificacoes: "Poliestireno expandido (EPS) com tampa, marca Isofort" },
  { codigo: "PRD00031", nome: "Berço Isopor p/ 05 Ampolas", categoria: "Embalagens", medidas: "Para 05 ampolas", especificacoes: "Suporte protetor em isopor (EPS) para transporte de ampolas, marca Isofort" },
  { codigo: "PRD00032", nome: "Escova de Roupa Base Plástica Cerdas Nylon", categoria: "Limpeza", medidas: "Padrão anatômica", especificacoes: "Base plástica, cabo e cerdas em nylon, marca Esfregona" },
  { codigo: "PRD00033", nome: "Esponja Sintética Poliuretano", categoria: "Limpeza", medidas: "22cm x 13cm x 06cm", especificacoes: "Bloco de espuma de poliuretano de alta absorção, marca Esponflora" },
  { codigo: "PRD00034", nome: "Rodo Base Alumínio 2 Borrachas s/ Cabo", categoria: "Limpeza", medidas: "Base 40cm", especificacoes: "Base reforçada em alumínio, 2 borrachas, sistema rosca, sem cabo" },
  { codigo: "PRD00035", nome: "Rodo Base Alumínio 2 Borrachas s/ Cabo", categoria: "Limpeza", medidas: "Base 60cm", especificacoes: "Base reforçada em alumínio, 2 borrachas, sistema rosca, sem cabo" },
  { codigo: "PRD00036", nome: "Rodo Base Alumínio 2 Borrachas", categoria: "Limpeza", medidas: "Base 60cm | Cabo 120cm", especificacoes: "Base de alumínio, 2 borrachas, cabo de madeira revestido, marca Halley" },
  { codigo: "PRD00037", nome: "Rodo Base Alumínio 2 Borrachas", categoria: "Limpeza", medidas: "Base 40cm | Cabo 120cm", especificacoes: "Base de alumínio, 2 borrachas, cabo de madeira revestido, marca Halley" },
  { codigo: "PRD00038", nome: "Rodo Base Madeira c/ Espuma s/ Cabo", categoria: "Limpeza", medidas: "Base 30cm", especificacoes: "Base de madeira com espuma absorvente, rosca, sem cabo" },
  { codigo: "PRD00039", nome: "Rodo Base Madeira c/ Espuma", categoria: "Limpeza", medidas: "Base 30cm | Cabo 120cm", especificacoes: "Base de madeira com espuma, cabo de madeira revestido, marca Halley" },
  { codigo: "PRD00040", nome: "Rodo Base Plástica 2 Borrachas", categoria: "Limpeza", medidas: "Base 60cm | Cabo 120cm", especificacoes: "Base plástica, 2 borrachas, cabo de madeira revestido, marca Halley" },
  { codigo: "PRD00041", nome: "Cortador de Unhas das Mãos Aço Inox", categoria: "Higiene Pessoal", medidas: "Tamanho padrão (mãos)", especificacoes: "Aço inoxidável de alta precisão, marca Premium" },
  { codigo: "PRD00042", nome: "Lixeira Escritório Retangular Preta", categoria: "Limpeza", medidas: "Capacidade 12 Litros", especificacoes: "Cor preta, formato retangular, linha Eco" },
  { codigo: "PRD00043", nome: "Cabo de Madeira c/ Virola e Rosca", categoria: "Limpeza", medidas: "Comprimento 1,20m", especificacoes: "Madeira natural com virola reforçada e ponteira de rosca" },
  { codigo: "PRD00044", nome: "Prolongador de Cabo Extensor", categoria: "Limpeza", medidas: "Extensível", especificacoes: "Acoplamento universal para limpeza em altura" },
  { codigo: "PRD00045", nome: "Fibra Vinil Rolo", categoria: "Limpeza", medidas: "120cm x 12m", especificacoes: "Rolo de fibra vinílica para tapetes/capachos personalizados, marca Kapazi" },
  { codigo: "ROD22", nome: "Rodo Base Metal 2 Borrachas", categoria: "Limpeza", medidas: "Base 40cm | Cabo 160cm", especificacoes: "Base metálica, 2 borrachas, cabo de madeira revestido em plástico, marca FM" },
  { codigo: "THO-773", nome: "Trena Color c/ Trava", categoria: "Ferramentas", medidas: "Comprimento 05 metros", especificacoes: "Fita métrica retrátil com trava de segurança, marca Thompson" },
  { codigo: "TLG7364", nome: "Touca TNT Sanfonada Branca", categoria: "Higiene Pessoal", medidas: "Gramatura 10g/m² | Tamanho único", especificacoes: "TNT descartável sanfonada com elástico duplo, cor branca, marca Talge" },
  { codigo: "XFM22X", nome: "Escova para Roupa Plástica Cerdas Nylon", categoria: "Limpeza", medidas: "Padrão anatômica", especificacoes: "Corpo plástico, cabo ergonômico e cerdas em nylon, marca FM" }
];

export const REAL_CATALOG_PRODUCTS: Product[] = RAW_ENTRIES.map((item, idx) => {
  const catLabel = item.categoria && CATEGORY_MAP[item.categoria] ? item.categoria : "Diversos";
  const catId = CATEGORY_MAP[catLabel] || "diversos";
  const measures = (item.medidas || "").trim() || "Padrão comercial";
  const spec = (item.especificacoes || "").trim() || "Uso geral / padrão distribuidor";
  const cleanName = cleanProductTitle(item.nome);

  return {
    id: idx + 1,
    sku: item.codigo,
    name: cleanName,
    category: catId,
    rooms: [],
    segments: [],
    about: buildAbout(catLabel, cleanName, item.nome),
    description: buildDescription(item.nome, catLabel, measures),
    measures,
    spec,
    qtdMinima: 1,
    image: ""
  };
});

export const REAL_CATEGORIES: Category[] = BASE_CATEGORIES.filter((cat) =>
  REAL_CATALOG_PRODUCTS.some((product) => product.category === cat.id)
);
