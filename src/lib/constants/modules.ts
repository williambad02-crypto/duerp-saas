import { CodeModule, StatutModule } from '@/types'

export interface ModuleRisque {
  code: CodeModule
  nom: string
  description: string
  statut: StatutModule
  type_risque: 'chronique' | 'aigu_et_chronique'
}

export const MODULES_RISQUES: ModuleRisque[] = [
  {
    code: 'M01_BRUIT',
    nom: 'Bruit',
    description: 'Exposition au bruit (seuils 80/85/87 dB)',
    statut: 'actif',
    type_risque: 'aigu_et_chronique',
  },
  {
    code: 'M02_VIBRATIONS',
    nom: 'Vibrations',
    description: 'Vibrations mécaniques bras/corps entier',
    statut: 'coming_soon',
    type_risque: 'chronique',
  },
  {
    code: 'M03_TMS',
    nom: 'Troubles Musculo-Squelettiques',
    description: 'TMS des membres supérieurs et du rachis',
    statut: 'coming_soon',
    type_risque: 'chronique',
  },
  {
    code: 'M04_CHARGE_PHYSIQUE',
    nom: 'Charge physique',
    description: 'Manutention manuelle, effort physique',
    statut: 'coming_soon',
    type_risque: 'chronique',
  },
  {
    code: 'M05_RPS',
    nom: 'Risques Psychosociaux',
    description: 'Stress, burnout, harcèlement',
    statut: 'coming_soon',
    type_risque: 'chronique',
  },
  {
    code: 'M06_CHIMIQUE',
    nom: 'Risque chimique / CMR',
    description: 'Agents chimiques dangereux, CMR',
    statut: 'desactive',
    type_risque: 'aigu_et_chronique',
  },
  {
    code: 'M07_BIOLOGIQUE',
    nom: 'Risque biologique',
    description: 'Agents biologiques (groupes 1-4)',
    statut: 'desactive',
    type_risque: 'chronique',
  },
  {
    code: 'M08_THERMIQUE',
    nom: 'Ambiances thermiques',
    description: 'Chaleur, froid, WBGT',
    statut: 'desactive',
    type_risque: 'aigu_et_chronique',
  },
  {
    code: 'M09_RAYONNEMENTS',
    nom: 'Rayonnements',
    description: 'Rayonnements ionisants et non ionisants',
    statut: 'desactive',
    type_risque: 'chronique',
  },
]

export const MODULE_PAR_CODE = Object.fromEntries(
  MODULES_RISQUES.map((m) => [m.code, m])
) as Record<CodeModule, ModuleRisque>
