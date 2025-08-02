export interface ManchesterFlow {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  defaultPriority: 'azul' | 'verde' | 'amarelo' | 'laranja' | 'vermelho';
  priorityRange: ('azul' | 'verde' | 'amarelo' | 'laranja' | 'vermelho')[];
  suggestedSpecialty?: 'ortopedia' | 'cirurgia-geral' | 'clinica-medica' | 'pediatria';
}

export const manchesterFlows: ManchesterFlow[] = [
  {
    id: 'chest_pain',
    name: 'Dor Torácica',
    description: 'Dor no peito, precordial ou torácica',
    keywords: ['dor no peito', 'dor torácica', 'precordial', 'angina', 'infarto'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'abdominal_pain',
    name: 'Dor Abdominal',
    description: 'Dor na região abdominal',
    keywords: ['dor abdominal', 'dor na barriga', 'cólica', 'abdome'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'headache',
    name: 'Cefaleia',
    description: 'Dor de cabeça',
    keywords: ['dor de cabeça', 'cefaleia', 'enxaqueca', 'migraine'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'breathing_problems',
    name: 'Problemas Respiratórios',
    description: 'Dificuldade respiratória, falta de ar',
    keywords: ['falta de ar', 'dispneia', 'dificuldade respiratória', 'asma', 'bronquite'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'fever',
    name: 'Febre',
    description: 'Temperatura corporal elevada',
    keywords: ['febre', 'temperatura', 'calor', 'hipertermia'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'vomiting',
    name: 'Vômitos e Náuseas',
    description: 'Episódios de vômito e náusea',
    keywords: ['vômito', 'náusea', 'enjoo', 'mal estar'],
    defaultPriority: 'verde',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'diarrhea',
    name: 'Diarreia',
    description: 'Evacuações líquidas frequentes',
    keywords: ['diarreia', 'evacuação', 'intestino', 'gastroenterite'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'back_pain',
    name: 'Dor nas Costas',
    description: 'Dor na região dorsal ou lombar',
    keywords: ['dor nas costas', 'lombar', 'dorsal', 'coluna'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'ortopedia'
  },
  {
    id: 'limb_problems',
    name: 'Problemas em Membros',
    description: 'Problemas em braços ou pernas',
    keywords: ['braço', 'perna', 'membro', 'articulação', 'fratura'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'ortopedia'
  },
  {
    id: 'wounds',
    name: 'Ferimentos',
    description: 'Cortes, lacerações ou feridas',
    keywords: ['ferimento', 'corte', 'laceração', 'ferida', 'machucado'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'burns',
    name: 'Queimaduras',
    description: 'Lesões por calor, frio ou químicos',
    keywords: ['queimadura', 'queimado', 'calor', 'fogo'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'eye_problems',
    name: 'Problemas Oculares',
    description: 'Problemas relacionados aos olhos',
    keywords: ['olho', 'visão', 'ocular', 'conjuntivite'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'ear_problems',
    name: 'Problemas Auriculares',
    description: 'Problemas relacionados aos ouvidos',
    keywords: ['ouvido', 'audição', 'otite', 'dor de ouvido'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'throat_problems',
    name: 'Problemas de Garganta',
    description: 'Dor de garganta e problemas relacionados',
    keywords: ['garganta', 'faringite', 'amigdalite', 'dor para engolir'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'skin_problems',
    name: 'Problemas de Pele',
    description: 'Erupções, alergias e problemas dermatológicos',
    keywords: ['pele', 'alergia', 'coceira', 'dermatite', 'erupção'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'urinary_problems',
    name: 'Problemas Urinários',
    description: 'Dificuldades urinárias e infecções',
    keywords: ['urina', 'bexiga', 'cistite', 'infecção urinária'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'pregnancy_problems',
    name: 'Problemas na Gravidez',
    description: 'Complicações relacionadas à gravidez',
    keywords: ['gravidez', 'gestação', 'grávida', 'sangramento vaginal'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'psychiatric_problems',
    name: 'Problemas Psiquiátricos',
    description: 'Problemas de saúde mental e comportamentais',
    keywords: ['ansiedade', 'depressão', 'psiquiátrico', 'mental', 'suicídio'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'allergic_reaction',
    name: 'Reação Alérgica',
    description: 'Reações alérgicas e anafilaxia',
    keywords: ['alergia', 'anafilaxia', 'urticária', 'reação alérgica'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'poisoning',
    name: 'Intoxicação',
    description: 'Intoxicação por substâncias',
    keywords: ['intoxicação', 'veneno', 'overdose', 'envenenamento'],
    defaultPriority: 'vermelho',
    priorityRange: ['laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'falls',
    name: 'Quedas',
    description: 'Lesões decorrentes de quedas',
    keywords: ['queda', 'caiu', 'tombou', 'acidente'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'ortopedia'
  },
  {
    id: 'assault',
    name: 'Agressão',
    description: 'Lesões por agressão ou violência',
    keywords: ['agressão', 'violência', 'briga', 'pancada'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'car_accident',
    name: 'Acidente de Trânsito',
    description: 'Lesões por acidentes de trânsito',
    keywords: ['acidente', 'carro', 'trânsito', 'colisão', 'atropelamento'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'work_accident',
    name: 'Acidente de Trabalho',
    description: 'Lesões ocorridas no ambiente de trabalho',
    keywords: ['trabalho', 'acidente trabalho', 'ocupacional'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'dental_problems',
    name: 'Problemas Dentários',
    description: 'Dor de dente e problemas odontológicos',
    keywords: ['dente', 'dental', 'dor de dente', 'odontológico'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'diabetes_problems',
    name: 'Problemas Diabéticos',
    description: 'Complicações relacionadas ao diabetes',
    keywords: ['diabetes', 'diabético', 'glicose', 'hipoglicemia', 'hiperglicemia'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'hypertension',
    name: 'Hipertensão',
    description: 'Pressão arterial elevada',
    keywords: ['pressão alta', 'hipertensão', 'pressão arterial'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'heart_problems',
    name: 'Problemas Cardíacos',
    description: 'Problemas relacionados ao coração',
    keywords: ['coração', 'cardíaco', 'palpitação', 'arritmia'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'seizures',
    name: 'Convulsões',
    description: 'Episódios convulsivos',
    keywords: ['convulsão', 'epilepsia', 'ataque'],
    defaultPriority: 'vermelho',
    priorityRange: ['laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'confusion',
    name: 'Estado Confusional',
    description: 'Alterações do estado mental',
    keywords: ['confusão', 'desorientado', 'alteração mental', 'demência'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'weakness',
    name: 'Fraqueza',
    description: 'Fraqueza generalizada ou focal',
    keywords: ['fraqueza', 'fraco', 'cansaço', 'fadiga'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'dizziness',
    name: 'Tontura',
    description: 'Sensação de tontura ou vertigem',
    keywords: ['tontura', 'vertigem', 'tonto', 'desequilíbrio'],
    defaultPriority: 'verde',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'cold_symptoms',
    name: 'Sintomas Gripais',
    description: 'Sintomas de resfriado ou gripe',
    keywords: ['gripe', 'resfriado', 'tosse', 'coriza', 'espirro'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'medication_review',
    name: 'Revisão de Medicação',
    description: 'Problemas relacionados a medicamentos',
    keywords: ['medicamento', 'remédio', 'efeito colateral', 'medicação'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'follow_up',
    name: 'Seguimento',
    description: 'Consulta de seguimento ou retorno',
    keywords: ['retorno', 'seguimento', 'revisão', 'consulta'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'blood_pressure_check',
    name: 'Verificação de Pressão',
    description: 'Verificação de pressão arterial',
    keywords: ['verificar pressão', 'medir pressão', 'pressão'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'routine_check',
    name: 'Consulta de Rotina',
    description: 'Consulta médica de rotina',
    keywords: ['rotina', 'check-up', 'consulta rotina'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'certificate',
    name: 'Atestado',
    description: 'Solicitação de atestado médico',
    keywords: ['atestado', 'licença', 'afastamento'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'prescription',
    name: 'Receita',
    description: 'Solicitação de receita médica',
    keywords: ['receita', 'prescrição', 'medicação'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'shock',
    name: 'Choque',
    description: 'Estado de choque',
    keywords: ['choque', 'hipotensão', 'pressão baixa'],
    defaultPriority: 'vermelho',
    priorityRange: ['vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'unconscious',
    name: 'Inconsciência',
    description: 'Paciente inconsciente',
    keywords: ['inconsciente', 'desacordado', 'coma'],
    defaultPriority: 'vermelho',
    priorityRange: ['vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'bleeding',
    name: 'Hemorragia',
    description: 'Sangramento importante',
    keywords: ['sangramento', 'hemorragia', 'sangue'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'stroke',
    name: 'AVC',
    description: 'Suspeita de acidente vascular cerebral',
    keywords: ['avc', 'derrame', 'paralisia', 'fala alterada'],
    defaultPriority: 'vermelho',
    priorityRange: ['vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'overdose_alcohol',
    name: 'Intoxicação Alcoólica',
    description: 'Intoxicação por álcool',
    keywords: ['álcool', 'bebida', 'embriagado', 'intoxicação alcoólica'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'heat_exhaustion',
    name: 'Exaustão por Calor',
    description: 'Problemas relacionados ao calor excessivo',
    keywords: ['calor', 'insolação', 'desidratação', 'exaustão'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'cold_exposure',
    name: 'Exposição ao Frio',
    description: 'Problemas por exposição ao frio',
    keywords: ['frio', 'hipotermia', 'congelamento'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'foreign_body',
    name: 'Corpo Estranho',
    description: 'Corpo estranho em orifícios',
    keywords: ['corpo estranho', 'engasgado', 'objeto', 'nariz', 'ouvido'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'cirurgia-geral'
  },
  {
    id: 'sexual_assault',
    name: 'Agressão Sexual',
    description: 'Casos de violência sexual',
    keywords: ['violência sexual', 'estupro', 'agressão sexual'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'domestic_violence',
    name: 'Violência Doméstica',
    description: 'Casos de violência doméstica',
    keywords: ['violência doméstica', 'violência familiar', 'maus tratos'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja'],
    suggestedSpecialty: 'clinica-medica'
  },
  {
    id: 'newborn_problems',
    name: 'Problemas Neonatais',
    description: 'Problemas em recém-nascidos',
    keywords: ['recém-nascido', 'bebê', 'neonatal', 'parto'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'pediatria'
  },
  {
    id: 'pediatric_fever',
    name: 'Febre Pediátrica',
    description: 'Febre em crianças',
    keywords: ['febre criança', 'febre infantil', 'pediatria'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'pediatria'
  },
  {
    id: 'elderly_problems',
    name: 'Problemas Geriátricos',
    description: 'Problemas específicos de idosos',
    keywords: ['idoso', 'terceira idade', 'geriátrico'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho'],
    suggestedSpecialty: 'clinica-medica'
  }
];

export const suggestManchesterFlow = (complaints: string, symptoms: string): ManchesterFlow[] => {
  const searchText = `${complaints} ${symptoms}`.toLowerCase();
  
  return manchesterFlows
    .map(flow => {
      const matchCount = flow.keywords.filter(keyword => 
        searchText.includes(keyword.toLowerCase())
      ).length;
      
      return { flow, matchCount };
    })
    .filter(item => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 5) // Retorna apenas os 5 mais relevantes
    .map(item => item.flow);
};

export const getSpecialtyLabel = (specialty: string): string => {
  const specialties = {
    'ortopedia': 'Ortopedia',
    'cirurgia-geral': 'Cirurgia Geral',
    'clinica-medica': 'Clínica Médica',
    'pediatria': 'Pediatria'
  };
  return specialties[specialty as keyof typeof specialties] || specialty;
};
