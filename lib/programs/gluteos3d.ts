// Planilha Glúteos 3D — 6 semanas, transcrita do PDF oficial (PDF_GLÚTEOS_3D_-_6_semanas_completo).
// Cada semana tem 5 treinos (segunda a sexta). Sábado e domingo são descanso.
//
// Pontos do PDF que foram interpretados (confirmar com o Juninho):
// 1. Semana 1, terça: no PDF a tabela está cortada e só mostra 3 exercícios.
//    Aqui ela usa os mesmos 6 bi-sets da semana 2, com 12 a 15 repetições.
// 2. Semanas 3, 4 e 5, quarta: o PDF mostra dois descansos ("90 a 150s" e "60 a 120s entre as séries").
//    Aqui foi usado 90 a 150s, igual à segunda e à sexta da fase Choque.
// 3. Semana 6, quarta: o 2º exercício aparece repetido como "Agachamento livre ou Smith".
//    Aqui foi usado Agachamento Hack, que é o 2º exercício da quarta nas semanas 1 a 4.

export type G3DBlockType = 'EXERCISE' | 'BISET' | 'DROPSET' | 'REST_PAUSE'

export interface G3DBlock {
  type: G3DBlockType
  exercises: string[] // 1 = exercício simples; 2 = bi-set
  sets: number // total de séries que a aluna registra
  reps: string
  notes?: string
}

export interface G3DWorkout {
  weekday: number // 1 = segunda ... 5 = sexta
  title: string
  rest: string
  blocks: G3DBlock[]
}

export interface G3DWeek {
  week: number
  phase: 'Base' | 'Choque' | 'Deload'
  workouts: G3DWorkout[]
}

// Exercícios usados na planilha. Os que já existem na biblioteca do professor são reaproveitados pelo nome.
export const G3D_EXERCISES: { name: string; muscleGroup: string; equipment?: string }[] = [
  { name: 'Ostra com Mini Band', muscleGroup: 'Glúteos', equipment: 'Mini band' },
  { name: 'Passada Lateral com Mini Band', muscleGroup: 'Glúteos', equipment: 'Mini band' },
  { name: 'Extensão de Quadril com Mini Band', muscleGroup: 'Glúteos', equipment: 'Mini band' },
  { name: 'Abdução de Quadril com Mini Band', muscleGroup: 'Glúteos', equipment: 'Mini band' },
  { name: 'Elevação Pélvica', muscleGroup: 'Glúteos', equipment: 'Barra ou máquina' },
  { name: 'Elevação Pélvica Unilateral', muscleGroup: 'Glúteos' },
  { name: 'Agachamento Sumô', muscleGroup: 'Glúteos, adutores', equipment: 'Máquina ou livre' },
  { name: 'Agachamento Búlgaro', muscleGroup: 'Glúteos, quadríceps', equipment: 'Halteres' },
  { name: 'Extensão de Quadril na Polia', muscleGroup: 'Glúteos', equipment: 'Polia' },
  { name: 'Cadeira Abdutora', muscleGroup: 'Glúteos', equipment: 'Máquina' },
  { name: 'Cadeira Abdutora Inclinada', muscleGroup: 'Glúteos', equipment: 'Máquina' },
  { name: 'Abdução de Quadril no Cabo', muscleGroup: 'Glúteos', equipment: 'Cabo' },
  { name: 'Stiff', muscleGroup: 'Posterior de coxa, glúteos', equipment: 'Barra ou halteres' },
  { name: 'Levantamento Terra Sumô', muscleGroup: 'Posterior de coxa, glúteos', equipment: 'Barra' },
  { name: 'Agachamento Livre', muscleGroup: 'Glúteos, quadríceps', equipment: 'Barra ou Smith' },
  { name: 'Agachamento Hack', muscleGroup: 'Quadríceps, glúteos', equipment: 'Máquina hack' },
  { name: 'Hack V-Squat', muscleGroup: 'Quadríceps, glúteos', equipment: 'Máquina' },
  { name: 'Leg Press 45°', muscleGroup: 'Quadríceps, glúteos', equipment: 'Máquina' },
  { name: 'Leg Horizontal Unilateral', muscleGroup: 'Quadríceps, glúteos', equipment: 'Máquina' },
  { name: 'Cadeira Extensora', muscleGroup: 'Quadríceps', equipment: 'Máquina' },
  { name: 'Afundo no Smith com Step na Frente', muscleGroup: 'Glúteos, quadríceps', equipment: 'Smith e step' },
  { name: 'Mesa Flexora', muscleGroup: 'Posterior de coxa', equipment: 'Máquina' },
  { name: 'Cadeira Flexora', muscleGroup: 'Posterior de coxa', equipment: 'Máquina' },
  { name: 'Puxada Aberta', muscleGroup: 'Costas', equipment: 'Polia alta' },
  { name: 'Pull Down', muscleGroup: 'Costas', equipment: 'Polia alta' },
  { name: 'Remada Unilateral', muscleGroup: 'Costas', equipment: 'Halter' },
  { name: 'Remada Baixa com Triângulo', muscleGroup: 'Costas', equipment: 'Polia baixa' },
  { name: 'Face Pull', muscleGroup: 'Ombro, costas', equipment: 'Corda/polia' },
  { name: 'Elevação Lateral', muscleGroup: 'Ombro', equipment: 'Halteres' },
  { name: 'Elevação Frontal', muscleGroup: 'Ombro', equipment: 'Halteres' },
  { name: 'Elevação Frontal em Y', muscleGroup: 'Ombro' },
  { name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombro', equipment: 'Halteres' },
  { name: 'Crucifixo Inverso com Halteres', muscleGroup: 'Ombro, costas', equipment: 'Halteres' },
  { name: 'Supino Máquina', muscleGroup: 'Peito', equipment: 'Máquina' },
  { name: 'Rosca Direta', muscleGroup: 'Bíceps', equipment: 'Barra W' },
  { name: 'Rosca Martelo', muscleGroup: 'Bíceps', equipment: 'Halteres' },
  { name: 'Tríceps no Banco', muscleGroup: 'Tríceps', equipment: 'Banco' },
  { name: 'Tríceps Francês Unilateral', muscleGroup: 'Tríceps', equipment: 'Halter' },
  { name: 'Tríceps Testa', muscleGroup: 'Tríceps', equipment: 'Halteres ou barra' },
  { name: 'Lombar', muscleGroup: 'Lombar', equipment: 'Máquina ou solo' },
  { name: 'Prancha', muscleGroup: 'Abdômen', equipment: 'Solo' },
  { name: 'Abdominal Infra', muscleGroup: 'Abdômen', equipment: 'Solo' },
  { name: 'Abdominal Infra na Polia', muscleGroup: 'Abdômen', equipment: 'Polia' },
  { name: 'Abdominal Remador', muscleGroup: 'Abdômen', equipment: 'Solo' },
  { name: 'Abdominal Máquina', muscleGroup: 'Abdômen', equipment: 'Máquina' },
]

// ---------- textos das técnicas (vêm da página "Metodologias utilizadas" do PDF) ----------
const PRE = 'Pré-ativação de glúteo.'
const BISET = 'Bi-set: faça os dois exercícios em sequência e só então descanse.'
const cluster = (reps: string) =>
  `2 séries de ${reps} + 1 cluster set (4-4-4): 4 reps, pausa de 10 a 15s, mais 4, pausa, e mais 4 até a falha. Sem reduzir a carga.`
const backOff = (n: number, reps: string) =>
  `${n} séries de ${reps} + 1 back off set: tire 30% da carga da última série e vá até a falha, com pelo menos 10 reps.`
const drop = (n: number, reps: string) =>
  `${n} séries de ${reps} + 1 drop set: ao chegar na falha, reduza 20 a 30% da carga e vá até a falha de novo.`
const fmt = (reps: string) => reps.replace('-', ' a ')

// ---------- atalhos ----------
const ex = (name: string, sets: number, reps: string, notes?: string): G3DBlock => ({ type: 'EXERCISE', exercises: [name], sets, reps, notes })
const bi = (a: string, b: string, sets: number, reps: string, extra?: string): G3DBlock => ({
  type: 'BISET',
  exercises: [a, b],
  sets,
  reps,
  notes: extra ? `${BISET} ${extra}` : BISET,
})
const cl = (name: string, reps: string, variant?: string): G3DBlock => ({
  type: 'REST_PAUSE',
  exercises: [name],
  sets: 3,
  reps,
  notes: [variant, cluster(fmt(reps))].filter(Boolean).join(' '),
})
const bo = (name: string, n: number, reps: string, variant?: string): G3DBlock => ({
  type: 'DROPSET',
  exercises: [name],
  sets: n + 1,
  reps,
  notes: [variant, backOff(n, fmt(reps))].filter(Boolean).join(' '),
})
const dr = (name: string, n: number, reps: string, variant?: string): G3DBlock => ({
  type: 'DROPSET',
  exercises: [name],
  sets: n + 1,
  reps,
  notes: [variant, drop(n, fmt(reps))].filter(Boolean).join(' '),
})

const V = {
  pelvica: 'Barra ou máquina.',
  sumo: 'Máquina ou livre.',
  stiff: 'Com barra ou halteres.',
  agach: 'Livre ou no Smith.',
  cabo: 'Com o cabo na frente.',
}

const T = {
  seg: 'Glúteo e posterior',
  ter: 'Costas, ombro, tríceps e abdômen',
  qua: 'Quadríceps e glúteo',
  qui: 'Superior completo',
  sex: 'Perna completa com glúteo',
}

// Terça: mesmos 6 bi-sets em todas as semanas, só muda a faixa de repetições.
const terca = (reps: string): G3DWorkout => ({
  weekday: 2,
  title: T.ter,
  rest: '45 a 60s',
  blocks: [
    bi('Puxada Aberta', 'Elevação Lateral', 3, reps, 'Elevação lateral com halteres.'),
    bi('Face Pull', 'Elevação Frontal', 3, reps, 'Elevação frontal com halteres.'),
    bi('Remada Unilateral', 'Tríceps no Banco', 3, reps),
    bi('Desenvolvimento com Halteres', 'Tríceps Francês Unilateral', 3, reps),
    bi('Lombar', 'Prancha', 3, reps, 'Lombar na máquina ou no solo. Prancha frontal.'),
    bi('Abdominal Infra', 'Abdominal Remador', 3, reps, 'Abdominal infra no solo.'),
  ],
})

// Quinta: mesmos exercícios em todas as semanas, só muda a faixa de repetições.
const quinta = (reps: string): G3DWorkout => ({
  weekday: 4,
  title: T.qui,
  rest: '45 a 60s',
  blocks: [
    bi('Pull Down', 'Rosca Direta', 3, reps, 'Rosca direta com barra W.'),
    bi('Remada Baixa com Triângulo', 'Rosca Martelo', 3, reps, 'Rosca martelo com halteres.'),
    bi('Supino Máquina', 'Elevação Frontal em Y', 3, reps, 'Supino reto na máquina.'),
    bi('Crucifixo Inverso com Halteres', 'Tríceps Testa', 3, reps, 'Tríceps testa com halteres.'),
    bi('Abdominal Infra na Polia', 'Prancha', 3, reps, 'Prancha frontal.'),
    ex('Abdominal Máquina', 3, reps),
  ],
})

export const GLUTEOS_3D: G3DWeek[] = [
  // ---------------- SEMANA 1 · BASE ----------------
  {
    week: 1,
    phase: 'Base',
    workouts: [
      {
        weekday: 1, title: T.seg, rest: '60 a 120s',
        blocks: [
          ex('Ostra com Mini Band', 3, '12-15', PRE),
          ex('Passada Lateral com Mini Band', 3, '12-15', PRE),
          cl('Elevação Pélvica', '12-15', V.pelvica),
          ex('Agachamento Sumô', 3, '12-15', V.sumo),
          ex('Agachamento Búlgaro', 3, '12-15'),
          ex('Extensão de Quadril na Polia', 3, '12-15'),
          dr('Cadeira Abdutora', 2, '12-15'),
          ex('Stiff', 3, '12-15', V.stiff),
        ],
      },
      terca('12-15'), // PDF cortado nesta página: ver observação 1 no topo do arquivo
      {
        weekday: 3, title: T.qua, rest: '60 a 120s',
        blocks: [
          ex('Agachamento Livre', 3, '12-15', V.agach),
          ex('Agachamento Hack', 3, '12-15'),
          cl('Leg Press 45°', '12-15'),
          bo('Cadeira Extensora', 2, '12-15'),
          ex('Afundo no Smith com Step na Frente', 3, '12-15'),
          ex('Abdução de Quadril no Cabo', 3, '12-15', V.cabo),
          bi('Cadeira Abdutora Inclinada', 'Passada Lateral com Mini Band', 3, '12-15'),
        ],
      },
      quinta('12-15'),
      {
        weekday: 5, title: T.sex, rest: '60 a 120s',
        blocks: [
          ex('Extensão de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Abdução de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica Unilateral', 3, '12-15'),
          cl('Levantamento Terra Sumô', '12-15'),
          ex('Hack V-Squat', 3, '12-15'),
          ex('Leg Horizontal Unilateral', 3, '12-15'),
          ex('Mesa Flexora', 3, '12-15'),
          ex('Cadeira Flexora', 3, '12-15'),
        ],
      },
    ],
  },

  // ---------------- SEMANA 2 · BASE ----------------
  {
    week: 2,
    phase: 'Base',
    workouts: [
      {
        weekday: 1, title: T.seg, rest: '60 a 120s',
        blocks: [
          ex('Ostra com Mini Band', 3, '12-15', PRE),
          ex('Passada Lateral com Mini Band', 3, '12-15', PRE),
          cl('Elevação Pélvica', '12-15', V.pelvica),
          ex('Agachamento Sumô', 3, '10-12', V.sumo),
          ex('Agachamento Búlgaro', 3, '10-12'),
          ex('Extensão de Quadril na Polia', 3, '10-12'),
          dr('Cadeira Abdutora', 2, '10-12'),
          ex('Stiff', 3, '12-15', V.stiff),
        ],
      },
      terca('12-15'),
      {
        weekday: 3, title: T.qua, rest: '60 a 120s',
        blocks: [
          ex('Agachamento Livre', 3, '10-12', V.agach),
          ex('Agachamento Hack', 3, '12-15'),
          cl('Leg Press 45°', '10-12'),
          bo('Cadeira Extensora', 2, '10-12'),
          ex('Afundo no Smith com Step na Frente', 3, '10-12'),
          ex('Abdução de Quadril no Cabo', 3, '12-15', V.cabo),
          bi('Cadeira Abdutora Inclinada', 'Passada Lateral com Mini Band', 3, '12-15'),
        ],
      },
      quinta('12-15'),
      {
        weekday: 5, title: T.sex, rest: '90 a 120s',
        blocks: [
          ex('Extensão de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Abdução de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica Unilateral', 3, '12-15'),
          cl('Levantamento Terra Sumô', '10-12'),
          ex('Hack V-Squat', 3, '10-12'),
          ex('Leg Horizontal Unilateral', 3, '10-12'),
          ex('Mesa Flexora', 3, '12-15'),
          ex('Cadeira Flexora', 3, '12-15'),
        ],
      },
    ],
  },

  // ---------------- SEMANA 3 · CHOQUE ----------------
  {
    week: 3,
    phase: 'Choque',
    workouts: [
      {
        weekday: 1, title: T.seg, rest: '90 a 150s',
        blocks: [
          ex('Ostra com Mini Band', 3, '12-15', PRE),
          ex('Passada Lateral com Mini Band', 3, '12-15', PRE),
          cl('Elevação Pélvica', '8-10', V.pelvica),
          ex('Agachamento Sumô', 3, '8-10', V.sumo),
          ex('Agachamento Búlgaro', 3, '8-10'),
          ex('Extensão de Quadril na Polia', 3, '10-12'),
          dr('Cadeira Abdutora', 2, '10-12'),
          ex('Stiff', 3, '12-15', V.stiff),
        ],
      },
      terca('10-12'),
      {
        weekday: 3, title: T.qua, rest: '90 a 150s', // ver observação 2 no topo do arquivo
        blocks: [
          ex('Agachamento Livre', 3, '8-10', V.agach),
          ex('Agachamento Hack', 3, '8-10'),
          cl('Leg Press 45°', '10-12'),
          bo('Cadeira Extensora', 2, '8-10'),
          ex('Afundo no Smith com Step na Frente', 3, '10-12'),
          ex('Abdução de Quadril no Cabo', 3, '12-15', V.cabo),
          bi('Cadeira Abdutora Inclinada', 'Passada Lateral com Mini Band', 3, '12-15'),
        ],
      },
      quinta('10-12'),
      {
        weekday: 5, title: T.sex, rest: '120 a 150s',
        blocks: [
          ex('Extensão de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Abdução de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica Unilateral', 3, '10-12'),
          cl('Levantamento Terra Sumô', '8-10'),
          ex('Hack V-Squat', 3, '8-10'),
          ex('Leg Horizontal Unilateral', 3, '10-12'),
          ex('Mesa Flexora', 3, '12-15'),
          dr('Cadeira Flexora', 2, '12-15'),
        ],
      },
    ],
  },

  // ---------------- SEMANA 4 · CHOQUE ----------------
  {
    week: 4,
    phase: 'Choque',
    workouts: [
      {
        weekday: 1, title: T.seg, rest: '90 a 150s',
        blocks: [
          ex('Ostra com Mini Band', 3, '12-15', PRE),
          ex('Passada Lateral com Mini Band', 3, '12-15', PRE),
          cl('Elevação Pélvica', '8-10', V.pelvica),
          bo('Agachamento Sumô', 3, '8-10', V.sumo),
          dr('Agachamento Búlgaro', 3, '8-10'),
          ex('Extensão de Quadril na Polia', 3, '10-12'),
          dr('Cadeira Abdutora', 2, '15-20'),
          ex('Stiff', 2, '50', `${V.stiff} 2 séries de 50 repetições.`),
        ],
      },
      terca('8-10'),
      {
        weekday: 3, title: T.qua, rest: '90 a 150s', // ver observação 2 no topo do arquivo
        blocks: [
          ex('Agachamento Livre', 3, '8-10', V.agach),
          ex('Agachamento Hack', 3, '8-10'),
          cl('Leg Press 45°', '8-10'),
          bo('Cadeira Extensora', 2, '8-10'),
          ex('Afundo no Smith com Step na Frente', 3, '8-10'),
          ex('Abdução de Quadril no Cabo', 3, '10-12', V.cabo),
          bi('Cadeira Abdutora Inclinada', 'Passada Lateral com Mini Band', 3, '12-15'),
        ],
      },
      quinta('8-10'),
      {
        weekday: 5, title: T.sex, rest: '120 a 150s',
        blocks: [
          ex('Extensão de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Abdução de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica Unilateral', 3, '12-15'),
          cl('Levantamento Terra Sumô', '8-10'),
          dr('Hack V-Squat', 3, '8-10'),
          ex('Leg Horizontal Unilateral', 3, '8-10'),
          ex('Mesa Flexora', 3, '10-12'),
          bi('Cadeira Flexora', 'Stiff', 3, '12-15', V.stiff),
        ],
      },
    ],
  },

  // ---------------- SEMANA 5 · CHOQUE ----------------
  {
    week: 5,
    phase: 'Choque',
    workouts: [
      {
        weekday: 1, title: T.seg, rest: '90 a 150s',
        blocks: [
          ex('Ostra com Mini Band', 3, '12-15', PRE),
          ex('Passada Lateral com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica', 4, '6-8', `${V.pelvica} 3 séries de 6 a 8 + 1 série de 12 a 15.`),
          ex('Agachamento Sumô', 4, '6-8', `${V.sumo} 3 séries de 6 a 8 + 1 série de 12 a 15.`),
          ex('Agachamento Búlgaro', 4, '6-8', '4 séries de 6 a 8 com isometria.'),
          ex('Extensão de Quadril na Polia', 3, '10-12'),
          ex('Cadeira Abdutora', 4, '15-20'),
          ex('Stiff', 2, '50', `${V.stiff} 2 séries de 50 repetições.`),
        ],
      },
      terca('8-10'),
      {
        weekday: 3, title: T.qua, rest: '90 a 150s', // ver observação 2 no topo do arquivo
        blocks: [
          ex('Agachamento Livre', 3, '6-8', V.agach),
          ex('Leg Press 45°', 3, '6-8', '2 séries de 6 a 8 + 1 série de 15.'),
          ex('Cadeira Extensora', 3, '6-8', '2 séries de 6 a 8 + 1 série de 50.'),
          ex('Afundo no Smith com Step na Frente', 3, '8-10'),
          ex('Abdução de Quadril no Cabo', 3, '10-12', V.cabo),
          bi('Cadeira Abdutora Inclinada', 'Passada Lateral com Mini Band', 3, '12-15'),
        ],
      },
      quinta('8-10'),
      {
        weekday: 5, title: T.sex, rest: '120 a 150s',
        blocks: [
          ex('Extensão de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Abdução de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica Unilateral', 3, '12-15'),
          cl('Levantamento Terra Sumô', '8-10'),
          dr('Hack V-Squat', 3, '8-10'),
          ex('Leg Horizontal Unilateral', 3, '8-10'),
          ex('Mesa Flexora', 3, '10-12'),
          bi('Cadeira Flexora', 'Stiff', 3, '12-15', V.stiff),
        ],
      },
    ],
  },

  // ---------------- SEMANA 6 · DELOAD ----------------
  {
    week: 6,
    phase: 'Deload',
    workouts: [
      {
        weekday: 1, title: T.seg, rest: '90 a 120s',
        blocks: [
          ex('Ostra com Mini Band', 3, '12-15', PRE),
          ex('Passada Lateral com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica', 2, 'até 15', V.pelvica),
          ex('Agachamento Sumô', 2, 'até 15', V.sumo),
          ex('Agachamento Búlgaro', 2, 'até 15'),
          ex('Extensão de Quadril na Polia', 3, '10-12'),
          ex('Cadeira Abdutora', 3, '15-20'),
          ex('Stiff', 2, '15', V.stiff),
        ],
      },
      terca('15-20'),
      {
        weekday: 3, title: T.qua, rest: '90 a 150s',
        blocks: [
          ex('Agachamento Livre', 3, 'até 15', V.agach),
          ex('Agachamento Hack', 2, 'até 15'), // ver observação 3 no topo do arquivo
          ex('Leg Press 45°', 2, 'até 15'),
          ex('Cadeira Extensora', 2, 'até 15'),
          ex('Afundo no Smith com Step na Frente', 2, 'até 15'),
          ex('Abdução de Quadril no Cabo', 3, '10-12', V.cabo),
          bi('Cadeira Abdutora Inclinada', 'Passada Lateral com Mini Band', 3, '12-15'),
        ],
      },
      quinta('15-20'),
      {
        weekday: 5, title: T.sex, rest: '120 a 150s',
        blocks: [
          ex('Extensão de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Abdução de Quadril com Mini Band', 3, '12-15', PRE),
          ex('Elevação Pélvica Unilateral', 2, '12-15'),
          ex('Levantamento Terra Sumô', 2, '12-15'),
          ex('Hack V-Squat', 2, '12-15'),
          ex('Leg Horizontal Unilateral', 2, '12-15'),
          ex('Mesa Flexora', 3, '10-12'),
          bi('Cadeira Flexora', 'Stiff', 3, '12-15', V.stiff),
        ],
      },
    ],
  },
]

export const g3dWorkoutName = (week: number, title: string) => `Glúteos 3D · S${week} · ${title}`
export const g3dWorkoutGoal = (phase: string, rest: string) => `Fase ${phase} · descanso de ${rest} entre as séries`
export const g3dProgramName = (week: number, phase: string) => `Glúteos 3D · Semana ${week} (${phase})`
