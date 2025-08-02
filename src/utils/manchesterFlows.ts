
export interface ManchesterFlow {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  defaultPriority: 'azul' | 'verde' | 'amarelo' | 'laranja' | 'vermelho';
  priorityRange: ('azul' | 'verde' | 'amarelo' | 'laranja' | 'vermelho')[];
}

export const manchesterFlows: ManchesterFlow[] = [
  {
    id: 'chest_pain',
    name: 'Dor Torácica',
    description: 'Dor no peito, precordial ou torácica',
    keywords: ['dor no peito', 'dor torácica', 'precordial', 'angina', 'infarto'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'abdominal_pain',
    name: 'Dor Abdominal',
    description: 'Dor na região abdominal',
    keywords: ['dor abdominal', 'dor na barriga', 'cólica', 'abdome'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'headache',
    name: 'Cefaleia',
    description: 'Dor de cabeça',
    keywords: ['dor de cabeça', 'cefaleia', 'enxaqueca', 'migraine'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'breathing_problems',
    name: 'Problemas Respiratórios',
    description: 'Dificuldade respiratória, falta de ar',
    keywords: ['falta de ar', 'dispneia', 'dificuldade respiratória', 'asma', 'bronquite'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'fever',
    name: 'Febre',
    description: 'Temperatura corporal elevada',
    keywords: ['febre', 'temperatura', 'calor', 'hipertermia'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'vomiting',
    name: 'Vômitos e Náuseas',
    description: 'Episódios de vômito e náusea',
    keywords: ['vômito', 'náusea', 'enjoo', 'mal estar'],
    defaultPriority: 'verde',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'diarrhea',
    name: 'Diarreia',
    description: 'Evacuações líquidas frequentes',
    keywords: ['diarreia', 'evacuação', 'intestino', 'gastroenterite'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'back_pain',
    name: 'Dor nas Costas',
    description: 'Dor na região dorsal ou lombar',
    keywords: ['dor nas costas', 'lombar', 'dorsal', 'coluna'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'limb_problems',
    name: 'Problemas em Membros',
    description: 'Problemas em braços ou pernas',
    keywords: ['braço', 'perna', 'membro', 'articulação', 'fratura'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'wounds',
    name: 'Ferimentos',
    description: 'Cortes, lacerações ou feridas',
    keywords: ['ferimento', 'corte', 'laceração', 'ferida', 'machucado'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'burns',
    name: 'Queimaduras',
    description: 'Lesões por calor, frio ou químicos',
    keywords: ['queimadura', 'queimado', 'calor', 'fogo'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'eye_problems',
    name: 'Problemas Oculares',
    description: 'Problemas relacionados aos olhos',
    keywords: ['olho', 'visão', 'ocular', 'conjuntivite'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo', 'laranja']
  },
  {
    id: 'ear_problems',
    name: 'Problemas Auriculares',
    description: 'Problemas relacionados aos ouvidos',
    keywords: ['ouvido', 'audição', 'otite', 'dor de ouvido'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'throat_problems',
    name: 'Problemas de Garganta',
    description: 'Dor de garganta e problemas relacionados',
    keywords: ['garganta', 'faringite', 'amigdalite', 'dor para engolir'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'skin_problems',
    name: 'Problemas de Pele',
    description: 'Erupções, alergias e problemas dermatológicos',
    keywords: ['pele', 'alergia', 'coceira', 'dermatite', 'erupção'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'urinary_problems',
    name: 'Problemas Urinários',
    description: 'Dificuldades urinárias e infecções',
    keywords: ['urina', 'bexiga', 'cistite', 'infecção urinária'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'pregnancy_problems',
    name: 'Problemas na Gravidez',
    description: 'Complicações relacionadas à gravidez',
    keywords: ['gravidez', 'gestação', 'grávida', 'sangramento vaginal'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'psychiatric_problems',
    name: 'Problemas Psiquiátricos',
    description: 'Problemas de saúde mental e comportamentais',
    keywords: ['ansiedade', 'depressão', 'psiquiátrico', 'mental', 'suicídio'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'allergic_reaction',
    name: 'Reação Alérgica',
    description: 'Reações alérgicas e anafilaxia',
    keywords: ['alergia', 'anafilaxia', 'urticária', 'reação alérgica'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'poisoning',
    name: 'Intoxicação',
    description: 'Intoxicação por substâncias',
    keywords: ['intoxicação', 'veneno', 'overdose', 'envenenamento'],
    defaultPriority: 'vermelho',
    priorityRange: ['laranja', 'vermelho']
  },
  {
    id: 'falls',
    name: 'Quedas',
    description: 'Lesões decorrentes de quedas',
    keywords: ['queda', 'caiu', 'tombou', 'acidente'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'assault',
    name: 'Agressão',
    description: 'Lesões por agressão ou violência',
    keywords: ['agressão', 'violência', 'briga', 'pancada'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'car_accident',
    name: 'Acidente de Trânsito',
    description: 'Lesões por acidentes de trânsito',
    keywords: ['acidente', 'carro', 'trânsito', 'colisão', 'atropelamento'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'work_accident',
    name: 'Acidente de Trabalho',
    description: 'Lesões ocorridas no ambiente de trabalho',
    keywords: ['trabalho', 'acidente trabalho', 'ocupacional'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'dental_problems',
    name: 'Problemas Dentários',
    description: 'Dor de dente e problemas odontológicos',
    keywords: ['dente', 'dental', 'dor de dente', 'odontológico'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'diabetes_problems',
    name: 'Problemas Diabéticos',
    description: 'Complicações relacionadas ao diabetes',
    keywords: ['diabetes', 'diabético', 'glicose', 'hipoglicemia', 'hiperglicemia'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'hypertension',
    name: 'Hipertensão',
    description: 'Pressão arterial elevada',
    keywords: ['pressão alta', 'hipertensão', 'pressão arterial'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'heart_problems',
    name: 'Problemas Cardíacos',
    description: 'Problemas relacionados ao coração',
    keywords: ['coração', 'cardíaco', 'palpitação', 'arritmia'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'seizures',
    name: 'Convulsões',
    description: 'Episódios convulsivos',
    keywords: ['convulsão', 'epilepsia', 'ataque'],
    defaultPriority: 'vermelho',
    priorityRange: ['laranja', 'vermelho']
  },
  {
    id: 'confusion',
    name: 'Estado Confusional',
    description: 'Alterações do estado mental',
    keywords: ['confusão', 'desorientado', 'alteração mental', 'demência'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'weakness',
    name: 'Fraqueza',
    description: 'Fraqueza generalizada ou focal',
    keywords: ['fraqueza', 'fraco', 'cansaço', 'fadiga'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'dizziness',
    name: 'Tontura',
    description: 'Sensação de tontura ou vertigem',
    keywords: ['tontura', 'vertigem', 'tonto', 'desequilíbrio'],
    defaultPriority: 'verde',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'cold_symptoms',
    name: 'Sintomas Gripais',
    description: 'Sintomas de resfriado ou gripe',
    keywords: ['gripe', 'resfriado', 'tosse', 'coriza', 'espirro'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'medication_review',
    name: 'Revisão de Medicação',
    description: 'Problemas relacionados a medicamentos',
    keywords: ['medicamento', 'remédio', 'efeito colateral', 'medicação'],
    defaultPriority: 'verde',
    priorityRange: ['azul', 'verde', 'amarelo']
  },
  {
    id: 'follow_up',
    name: 'Seguimento',
    description: 'Consulta de seguimento ou retorno',
    keywords: ['retorno', 'seguimento', 'revisão', 'consulta'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde']
  },
  {
    id: 'blood_pressure_check',
    name: 'Verificação de Pressão',
    description: 'Verificação de pressão arterial',
    keywords: ['verificar pressão', 'medir pressão', 'pressão'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde']
  },
  {
    id: 'routine_check',
    name: 'Consulta de Rotina',
    description: 'Consulta médica de rotina',
    keywords: ['rotina', 'check-up', 'consulta rotina'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde']
  },
  {
    id: 'certificate',
    name: 'Atestado',
    description: 'Solicitação de atestado médico',
    keywords: ['atestado', 'licença', 'afastamento'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde']
  },
  {
    id: 'prescription',
    name: 'Receita',
    description: 'Solicitação de receita médica',
    keywords: ['receita', 'prescrição', 'medicação'],
    defaultPriority: 'azul',
    priorityRange: ['azul', 'verde']
  },
  {
    id: 'shock',
    name: 'Choque',
    description: 'Estado de choque',
    keywords: ['choque', 'hipotensão', 'pressão baixa'],
    defaultPriority: 'vermelho',
    priorityRange: ['vermelho']
  },
  {
    id: 'unconscious',
    name: 'Inconsciência',
    description: 'Paciente inconsciente',
    keywords: ['inconsciente', 'desacordado', 'coma'],
    defaultPriority: 'vermelho',
    priorityRange: ['vermelho']
  },
  {
    id: 'bleeding',
    name: 'Hemorragia',
    description: 'Sangramento importante',
    keywords: ['sangramento', 'hemorragia', 'sangue'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'stroke',
    name: 'AVC',
    description: 'Suspeita de acidente vascular cerebral',
    keywords: ['avc', 'derrame', 'paralisia', 'fala alterada'],
    defaultPriority: 'vermelho',
    priorityRange: ['vermelho']
  },
  {
    id: 'overdose_alcohol',
    name: 'Intoxicação Alcoólica',
    description: 'Intoxicação por álcool',
    keywords: ['álcool', 'bebida', 'embriagado', 'intoxicação alcoólica'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'heat_exhaustion',
    name: 'Exaustão por Calor',
    description: 'Problemas relacionados ao calor excessivo',
    keywords: ['calor', 'insolação', 'desidratação', 'exaustão'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'cold_exposure',
    name: 'Exposição ao Frio',
    description: 'Problemas por exposição ao frio',
    keywords: ['frio', 'hipotermia', 'congelamento'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'foreign_body',
    name: 'Corpo Estranho',
    description: 'Corpo estranho em orifícios',
    keywords: ['corpo estranho', 'engasgado', 'objeto', 'nariz', 'ouvido'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'sexual_assault',
    name: 'Agressão Sexual',
    description: 'Casos de violência sexual',
    keywords: ['violência sexual', 'estupro', 'agressão sexual'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja']
  },
  {
    id: 'domestic_violence',
    name: 'Violência Doméstica',
    description: 'Casos de violência doméstica',
    keywords: ['violência doméstica', 'violência familiar', 'maus tratos'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja']
  },
  {
    id: 'newborn_problems',
    name: 'Problemas Neonatais',
    description: 'Problemas em recém-nascidos',
    keywords: ['recém-nascido', 'bebê', 'neonatal', 'parto'],
    defaultPriority: 'laranja',
    priorityRange: ['amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'pediatric_fever',
    name: 'Febre Pediátrica',
    description: 'Febre em crianças',
    keywords: ['febre criança', 'febre infantil', 'pediatria'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
  },
  {
    id: 'elderly_problems',
    name: 'Problemas Geriátricos',
    description: 'Problemas específicos de idosos',
    keywords: ['idoso', 'terceira idade', 'geriátrico'],
    defaultPriority: 'amarelo',
    priorityRange: ['verde', 'amarelo', 'laranja', 'vermelho']
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
