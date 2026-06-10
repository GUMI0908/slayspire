import { CardTemplate, EnemyTemplate, Relic, GameEvent, PlayerStatus } from './types';

export const CARD_POOL: CardTemplate[] = [
  // --- STARTERS ---
  {
    id: 'starter_strike',
    name: 'ルーン・スラスト',
    type: 'ATTACK',
    rarity: 'COMMON',
    cost: 1,
    description: '敵に 6 ダメージを与える。',
    damage: 6,
    purchasable: false,
  },
  {
    id: 'starter_defend',
    name: 'ルーン・ウォール',
    type: 'SKILL',
    rarity: 'COMMON',
    cost: 1,
    description: 'ブロックを 5 得る。',
    block: 5,
    purchasable: false,
  },
  // --- COMMON CARDS ---
  {
    id: 'heavy_slash',
    name: 'グラウンド・バッシュ',
    type: 'ATTACK',
    rarity: 'COMMON',
    cost: 2,
    description: '敵に 12 ダメージを与える。',
    damage: 12,
    purchasable: true,
    price: 50,
  },
  {
    id: 'quick_stab',
    name: 'クイック・ストライク',
    type: 'ATTACK',
    rarity: 'COMMON',
    cost: 1,
    description: '敵に 5 ダメージ。カードを 1 枚引く。',
    damage: 5,
    drawCards: 1,
    purchasable: true,
    price: 45,
  },
  {
    id: 'shield_up',
    name: 'ストーン・スキン',
    type: 'SKILL',
    rarity: 'COMMON',
    cost: 1,
    description: 'ブロックを 8 得る。',
    block: 8,
    purchasable: true,
    price: 40,
  },
  {
    id: 'poison_cloud',
    name: '毒霧の咆哮',
    type: 'SKILL',
    rarity: 'COMMON',
    cost: 1,
    description: '敵に 4 毒を付与する。',
    poison: 4,
    purchasable: true,
    price: 55,
  },
  // --- UNCOMMON CARDS ---
  {
    id: 'flame_burst',
    name: 'プロミネンス',
    type: 'ATTACK',
    rarity: 'UNCOMMON',
    cost: 2,
    description: '敵に 15 ダメージ。敵の防御を 1 弱体化する。',
    damage: 15,
    vulnerable: 1,
    purchasable: true,
    price: 90,
  },
  {
    id: 'iron_fortress',
    name: 'アイアン・フォートレス',
    type: 'SKILL',
    rarity: 'UNCOMMON',
    cost: 2,
    description: 'ブロックを 14 得る。',
    block: 14,
    purchasable: true,
    price: 85,
  },
  {
    id: 'enfeeble',
    name: 'エナジー・ドレイン',
    type: 'SKILL',
    rarity: 'UNCOMMON',
    cost: 1,
    description: 'カードを 2 枚引く。エネルギーを 1 得る。',
    drawCards: 2,
    energyGain: 1,
    purchasable: true,
    price: 110,
  },
  {
    id: 'venom_blade',
    name: 'ポイズン・エッジ',
    type: 'ATTACK',
    rarity: 'UNCOMMON',
    cost: 1,
    description: '敵に 4 ダメージ。敵に 5 毒を付与する。',
    damage: 4,
    poison: 5,
    purchasable: true,
    price: 95,
  },
  {
    id: 'battle_focus',
    name: '闘気覚醒',
    type: 'POWER',
    rarity: 'UNCOMMON',
    cost: 1,
    description: 'この戦闘中、与えるダメージが恒久的に +2 される（筋力+2）。',
    strengthGain: 2,
    purchasable: true,
    price: 120,
  },
  // --- RARE CARDS ---
  {
    id: 'giga_cannon',
    name: 'アポカリプス・レイ',
    type: 'ATTACK',
    rarity: 'RARE',
    cost: 3,
    description: '深奥の魔力砲を放つ。敵に 28 ダメージを与える。',
    damage: 28,
    purchasable: true,
    price: 170,
  },
  {
    id: 'adrenaline_rush',
    name: 'アドレナリン・バースト',
    type: 'SKILL',
    rarity: 'RARE',
    cost: 0,
    description: 'カードを 3 枚引く。エネルギーを 2 得る。',
    drawCards: 3,
    energyGain: 2,
    purchasable: true,
    price: 200,
  },
  {
    id: 'heavenly_shield',
    name: '天界の光壁',
    type: 'SKILL',
    rarity: 'RARE',
    cost: 2,
    description: 'ブロックを 20 得る。HPを 5 回復する。',
    block: 20,
    purchasable: true,
    price: 180,
  },
  {
    id: 'catalyst',
    name: 'ヴォイド・インフェルノ',
    type: 'ATTACK',
    rarity: 'RARE',
    cost: 1,
    description: '敵に 8 ダメージ。敵の受けるダメージを 2 倍にする（脆弱+3）。',
    damage: 8,
    vulnerable: 3,
    purchasable: true,
    price: 160,
  },
  {
    id: 'demon_form',
    name: '神格解放',
    type: 'POWER',
    rarity: 'RARE',
    cost: 3,
    description: '魔力を最大解放。この戦闘中、攻撃ダメージが劇的に向上する（筋力+5）。',
    strengthGain: 5,
    purchasable: true,
    price: 220,
  }
];

export const RELIC_POOL: Relic[] = [
  {
    id: 'ruby_stone',
    name: '血脈のルビー',
    description: '戦闘開始時、筋力 +1 を獲得する。',
    icon: 'Flame',
    effectType: 'BATTLE_START_STRENGTH',
  },
  {
    id: 'sun_amulet',
    name: '太陽のメダリオン',
    description: '戦闘に勝利した時、HPが 6 回復する。',
    icon: 'Sun',
    effectType: 'BATTLE_END_HEAL',
  },
  {
    id: 'magic_lantern',
    name: '探検家のランタン',
    description: '戦闘の1ターン目、追加で1枚カードを引く。',
    icon: 'Compass',
    effectType: 'DRAW_BOOST',
  },
  {
    id: 'golden_cask',
    name: '黄金の小槌',
    description: '獲得するゴールドが 25% 増加する。',
    icon: 'Coins',
    effectType: 'GOLD_BOOST',
  },
  {
    id: 'life_fountain',
    name: '生命の雫',
    description: 'キャンプで休憩（休息）した時、回復量が 15% 追加される。',
    icon: 'HeartPulse',
    effectType: 'REST_HEAL_BOOST',
  }
];

// Enemies Pool
export const ENEMIES_NORMAL: EnemyTemplate[] = [
  {
    id: 'slime',
    name: 'マゼンタスライム',
    maxHp: 25,
    intentions: [
      { type: 'ATTACK', value: 6, description: '執念深い体当たり' },
      { type: 'DEFEND', value: 5, description: '硬化液のバリア' },
      { type: 'ATTACK', value: 8, description: '全力ジャンププレス' },
    ],
    visualPrefix: '🟢',
  },
  {
    id: 'crawler',
    name: 'ケイブラット・リーダー',
    maxHp: 32,
    intentions: [
      { type: 'ATTACK', value: 5, description: '鋭い牙の乱撃' },
      { type: 'DEBUFF', value: 1, description: '威嚇の金切声（脆弱+1）' },
      { type: 'ATTACK', value: 7, description: '急所を狙う一噛み' },
    ],
    visualPrefix: '🐀',
  },
  {
    id: 'goblin',
    name: 'ルーン・コボルト',
    maxHp: 28,
    intentions: [
      { type: 'ATTACK', value: 8, description: '錆びたショートソード' },
      { type: 'DEFEND', value: 6, description: '木の盾を構える' },
      { type: 'ATTACK', value: 9, description: '隙きありダッシュスラッシュ' },
    ],
    visualPrefix: '🐕',
  }
];

export const ENEMIES_ELITE: EnemyTemplate[] = [
  {
    id: 'orc_warrior',
    name: '覇王オークガード',
    maxHp: 58,
    intentions: [
      { type: 'ATTACK', value: 12, description: 'グレートアックスの大回転斬り' },
      { type: 'BUFF', value: 2, description: '咆哮によるビルドアップ（筋力+2）' },
      { type: 'ATTACK', value: 15, description: '大地を震わす強打' },
      { type: 'DEFEND', value: 10, description: '巨大な鉄盾を構える' }
    ],
    visualPrefix: '👹',
  },
  {
    id: 'shadow_ninja',
    name: '冥府のシャドウアサシン',
    maxHp: 48,
    intentions: [
      { type: 'ATTACK', value: 6, description: '影縫いのクナイ投げ' },
      { type: 'DEBUFF', value: 4, description: '毒霧拡散（毒+4）' },
      { type: 'ATTACK', value: 8, description: '首狩りバックスタブ' },
    ],
    visualPrefix: '👤',
  }
];

export const ENEMIES_BOSS: EnemyTemplate[] = [
  {
    id: 'ancient_dragon',
    name: 'ヘルファイア・アルカイックドラゴン',
    maxHp: 130,
    intentions: [
      { type: 'ATTACK', value: 14, description: '焦熱のブレス' },
      { type: 'DEFEND', value: 15, description: '強固な古代の鱗が光る' },
      { type: 'ATTACK', value: 20, description: '流星群のようなテールバッシュ' },
      { type: 'BUFF', value: 3, description: '大気から魔力を吸入する（筋力+3）' },
      { type: 'DEBUFF', value: 3, description: '恐怖の眼光（脆弱+2・弱体+2）' }
    ],
    visualPrefix: '🐉',
  }
];

// Choice Events
export const EVENTS_POOL: GameEvent[] = [
  {
    id: 'fountain_of_healing',
    title: '奇跡の青き癒やしの泉',
    description: 'ダンジョンの割れ目に、輝かしい瑠璃色の透明な泉が湧き出ています。そこからは心地よい神秘的なエネルギーが放出されており、旅の疲れを即座にいやす力を秘めているようだ。',
    choices: [
      {
        text: '泉の水を一口飲み干す',
        effectText: 'HPを最大値の 40% 回復する。',
        action: (status) => {
          const healAmount = Math.floor(status.maxHp * 0.4);
          const nextHp = Math.min(status.maxHp, status.hp + healAmount);
          return {
            nextStatus: { ...status, hp: nextHp },
            nextDeck: [], // unchanged deck returned
            logText: `青い泉の水を飲み干し、体に生気がみなぎるのを感じた。（HPが ${healAmount} 回復）`,
          };
        }
      },
      {
        text: '泉の底を注意深く調査する',
        effectText: '何かの鉱物を見つけるかもしれないが、魔獣の罠かも（HPを 10 失い、100ゴールド見つける）',
        requirement: (status) => status.hp > 10,
        action: (status) => {
          return {
            nextStatus: { ...status, hp: status.hp - 10, gold: status.gold + 100 },
            nextDeck: [],
            logText: '泉の底をかき分けていると、尖った結晶で手を傷つけてしまったが、旅人の残した輝く金貨袋を見つけた！（HPが 10 減り、100 ゴールド獲得）',
          };
        }
      },
      {
        text: '静かに通り過ぎる',
        effectText: '何も起こらない。安全を第一に考える。',
        action: (status) => {
          return {
            nextStatus: status,
            nextDeck: [],
            logText: '君は安全を優先し、何もせずただ不気味な青い泉の傍らを立ち去った。',
          };
        }
      }
    ]
  },
  {
    id: 'mysterious_sculpture',
    title: 'ルーンの祭壇と不敵な石像',
    description: '苔むした祭壇の上に、巨大なクリスタルを口にくわえた邪眼の彫刻がそびえ立っています。石像の台座にはこう記されている：「その身を差し出す者にのみ、新たなる魔導を授けん」',
    choices: [
      {
        text: '石像に血を捧げる（HPを 12 失う）',
        effectText: '強力なレアカード「神格解放(Rare Power)」をデッキに加える。',
        requirement: (status) => status.hp > 12,
        action: (status, deck) => {
          const rareCard = CARD_POOL.find(c => c.id === 'demon_form');
          const nextDeck = rareCard ? [...deck, rareCard] : deck;
          return {
            nextStatus: { ...status, hp: status.hp - 12 },
            nextDeck,
            logText: `石像が君の血を吸い上げると、不敵に笑うように輝いた。脳裏に究極の魔導のルーンが浮かび上がる。（HPが 12 減少、「神格解放」を獲得）`,
          };
        }
      },
      {
        text: '石像から無理やり宝石を抉り取る',
        effectText: '激怒のトラップが発動（戦闘が発生。対オーク戦に近い奇襲、または単純に15ダメージを受け、80ゴールド手に入れる）',
        requirement: (status) => status.hp > 15,
        action: (status) => {
          return {
            nextStatus: { ...status, hp: status.hp - 15, gold: status.gold + 80 },
            nextDeck: [],
            logText: '宝石を引き剥がした瞬間、凄まじい呪いの稲妻が走り体中を焼かれた！だが宝石は無事に手に入った。（HPが 15 減り、80 ゴールド獲得）',
          };
        }
      },
      {
        text: '宝石を崇めて祈る',
        effectText: '心が静まり、デッキから基礎カード「スラスト(Strike)」を1枚削除してスリム化できる。',
        action: (status, deck) => {
          // Find first starter strike and delete it
          const index = deck.findIndex(c => c.id === 'starter_strike');
          let nextDeck = [...deck];
          if (index !== -1) {
            nextDeck.splice(index, 1);
          }
          return {
            nextStatus: status,
            nextDeck,
            logText: '敬虔な祈りを捧げると、デッキの中の雑音のようなルーンが１つ浄化され、消滅した。（基本攻撃「ルーン・スラスト」を1枚削除）',
          };
        }
      }
    ]
  },
  {
    id: 'old_wizard',
    title: '行商の黒魔術師',
    description: '暗がりに黒づくめの不審なローブをまとった魔術師が腰掛けています。彼は怪しい輝きを放つ古びた瓶を取り出し、「格安で魂のルーンや秘薬を譲ってやろう。金さえあればな」と囁きました。',
    choices: [
      {
        text: '呪いのランタン（レリック）を100ゴールドで購入する',
        effectText: '所持金が 100 減少。「探検家のランタン（Draw Boost）」を獲得する。',
        requirement: (status) => status.gold >= 100,
        action: (status) => {
          const relic = RELIC_POOL.find(r => r.id === 'magic_lantern')!;
          // check if already has it
          const nextRelics = status.relics.some(r => r.id === relic.id) ? status.relics : [...status.relics, relic];
          return {
            nextStatus: { ...status, gold: status.gold - 100, relics: nextRelics },
            nextDeck: [],
            logText: '「素晴らしい買い物だ」魔術師は笑みを浮かべ、淡く光る不気味なランタンを差し出した。（「探検家のランタン」を獲得）',
          };
        }
      },
      {
        text: '高濃度のエリクサーを50ゴールドで購入する',
        effectText: '所持金が 50 減少。HPが 25 回復する。',
        requirement: (status) => status.gold >= 50,
        action: (status) => {
          return {
            nextStatus: { ...status, gold: status.gold - 50, hp: Math.min(status.maxHp, status.hp + 25) },
            nextDeck: [],
            logText: '君は透き通った紅のエリクサーを一瞬で飲み干した。全身の疲弊傷が一瞬で溶けるように直った。（HPが 25 回復）',
          };
        }
      },
      {
        text: '関わらないように足早に去る',
        effectText: '何事もなく無視して立ち去る。',
        action: (status) => {
          return {
            nextStatus: status,
            nextDeck: [],
            logText: '君は魔術師の不吉な誘惑を冷徹に無視し、暗闇の通路へ進んだ。',
          };
        }
      }
    ]
  }
];

// Helper to initialize custom base deck of 10 cards
export function getInitialDeck(): CardTemplate[] {
  const deck: CardTemplate[] = [];
  // 5 Strikes
  for (let i = 0; i < 5; i++) {
    deck.push({ ...CARD_POOL.find(c => c.id === 'starter_strike')! });
  }
  // 4 Defends
  for (let i = 0; i < 4; i++) {
    deck.push({ ...CARD_POOL.find(c => c.id === 'starter_defend')! });
  }
  // 1 Poison Cloud as flavor
  deck.push({ ...CARD_POOL.find(c => c.id === 'poison_cloud')! });

  return deck;
}
