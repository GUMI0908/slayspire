export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE';
export type CardType = 'ATTACK' | 'SKILL' | 'POWER';

export interface Card {
  id: string; // Unique instance ID for battle state
  templateId: string; // ID of the base design
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  description: string;
  effect: (player: BattleEntity, target: BattleEntity) => BattleEffectResult;
  // Metadata for rendering/state
  image?: string;
  strengthBonus?: number;
  block?: number;
  damage?: number;
  poison?: number;
  drawCards?: number;
  vulnerable?: number;
  energyGain?: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  description: string;
  // Simple declarations of power
  damage?: number;
  block?: number;
  poison?: number;
  vulnerable?: number;
  drawCards?: number;
  energyGain?: number;
  strengthGain?: number;
  purchasable?: boolean;
  price?: number;
}

export interface BattleEffectResult {
  playerBlockAdded: number;
  targetDamageDealt: number;
  playerHealed: number;
  poisonApplied: number;
  vulnerableApplied: number;
  cardsDrawn: number;
  energyGained: number;
}

export interface Intention {
  type: 'ATTACK' | 'DEFEND' | 'DEBUFF' | 'BUFF' | 'ATTACK_DEFEND' | 'UNKNOWN';
  value?: number;
  subValue?: number;
  description: string;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  maxHp: number;
  intentions: IntentionPattern[];
  visualPrefix: string; // Aesthetic theme
}

export interface IntentionPattern {
  type: 'ATTACK' | 'DEFEND' | 'DEBUFF' | 'BUFF' | 'ATTACK_DEFEND';
  value?: number;
  subValue?: number;
  description: string;
}

export interface BattleEntity {
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  strength: number; // Flat damage boost
  weak: number; // Deals 25% less damage
  vulnerable: number; // Takes 50% more damage
  poison: number; // Takes damage at turn start
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  effectType: 'BATTLE_START_ENERGY' | 'BATTLE_START_STRENGTH' | 'BATTLE_END_HEAL' | 'REST_HEAL_BOOST' | 'DRAW_BOOST' | 'GOLD_BOOST';
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  choices: EventChoice[];
}

export interface EventChoice {
  text: string;
  effectText: string;
  requirement?: (status: PlayerStatus) => boolean;
  action: (status: PlayerStatus, deck: CardTemplate[]) => {
    nextStatus: PlayerStatus;
    nextDeck: CardTemplate[];
    logText: string;
  };
}

export interface PlayerStatus {
  hp: number;
  maxHp: number;
  gold: number;
  floor: number;
  relics: Relic[];
  xp: number;
  stage: number; // 1 to 3 acts
}

export type NodeType = 'COMBAT' | 'ELITE' | 'SHOP' | 'EVENT' | 'REST' | 'TREASURE' | 'BOSS';

export interface MapNode {
  id: string;
  floor: number;
  lane: number;
  type: NodeType;
  connectedTo: string[]; // IDs of nodes in next floor
  completed: boolean;
}

export type GameScreen = 'TITLE' | 'MAP' | 'BATTLE' | 'SHOP' | 'EVENT' | 'REST' | 'REWARD' | 'DECK_VIEW' | 'GAME_OVER' | 'VICTORY';
