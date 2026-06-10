import React, { useState, useEffect, useRef } from 'react';
import { Card, CardTemplate, BattleEntity, EnemyTemplate, Relic, Intention, IntentionPattern, PlayerStatus, MapNode } from '../types';
import { CARD_POOL } from '../data';
import { 
  Swords, 
  Shield, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  Heart, 
  Zap, 
  Skull,
  ArrowRight,
  BookOpen,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MapScreen from './MapScreen';

interface BattleScreenProps {
  playerDeckTemplates: CardTemplate[];
  enemyTemplate: EnemyTemplate;
  relics: Relic[];
  playerStatus: PlayerStatus;
  mapNodes: MapNode[];
  currentNodeId: string | null;
  onVictory: (goldGained: number, selectedCards: CardTemplate[]) => void;
  onDefeat: () => void;
  onOpenDeckView: () => void;
}

export default function BattleScreen({
  playerDeckTemplates,
  enemyTemplate,
  relics,
  playerStatus,
  mapNodes,
  currentNodeId,
  onVictory,
  onDefeat,
  onOpenDeckView,
}: BattleScreenProps) {
  
  // --- STATE management ---
  const [player, setPlayer] = useState<BattleEntity>({
    name: '冒険者',
    hp: playerStatus.hp, // Initialize with actual HP from player status
    maxHp: playerStatus.maxHp,
    block: 0,
    strength: 0,
    weak: 0,
    vulnerable: 0,
    poison: 0,
  });

  const [enemy, setEnemy] = useState<BattleEntity>({
    name: enemyTemplate.name,
    hp: enemyTemplate.maxHp,
    maxHp: enemyTemplate.maxHp,
    block: 0,
    strength: 0,
    weak: 0,
    vulnerable: 0,
    poison: 0,
  });

  const [energy, setEnergy] = useState(3);
  const [maxEnergy, setMaxEnergy] = useState(3);

  // Card piles
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [showMapOverlay, setShowMapOverlay] = useState(false);

  // Logs
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Current Turn
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [turnNumber, setTurnNumber] = useState(1);

  // Enemy Next Intention index
  const [intentionIndex, setIntentionIndex] = useState(0);

  // Floating particles or hit animations for dramatic gameplay
  const [playerHits, setPlayerHits] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);
  const [enemyHits, setEnemyHits] = useState<Array<{ id: number; text: string; x: number; y: number }>>([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Initial Player stats pulling from current health
    // Rubys Stone gives +1 strength at battle start
    const startStrength = relics.some(r => r.id === 'ruby_stone') ? 1 : 0;
    const startBlock = relics.some(r => r.id === 'mystic_amulet') ? 4 : 0; // fallback or default minor bonus

    setPlayer({
      name: '冒険者',
      hp: player.hp, // set dynamically or keep previous
      maxHp: 80,
      block: startBlock,
      strength: startStrength,
      weak: 0,
      vulnerable: 0,
      poison: 0,
    });

    // Translate templates into dynamic cards with unique battle IDs
    let cards: Card[] = playerDeckTemplates.map((tmpl, index) => ({
      id: `${tmpl.id}-${index}-${Math.random()}`,
      templateId: tmpl.id,
      name: tmpl.name,
      type: tmpl.type,
      rarity: tmpl.rarity,
      cost: tmpl.cost,
      description: tmpl.description,
      effect: (p, t) => {
        return {
          playerBlockAdded: tmpl.block || 0,
          targetDamageDealt: tmpl.damage || 0,
          playerHealed: 0, // handles manually or cards
          poisonApplied: tmpl.poison || 0,
          vulnerableApplied: tmpl.vulnerable || 0,
          cardsDrawn: tmpl.drawCards || 0,
          energyGained: tmpl.energyGain || 0,
        };
      },
      block: tmpl.block,
      damage: tmpl.damage,
      poison: tmpl.poison,
      vulnerable: tmpl.vulnerable,
      drawCards: tmpl.drawCards,
      energyGain: tmpl.energyGain,
      strengthBonus: tmpl.strengthGain,
    }));

    // Shuffle cards helper
    const shuffle = (array: Card[]) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const shuffled = shuffle(cards);

    // Explorer's Lantern prints draw boost on turn 1
    const turn1Draw = relics.some(r => r.id === 'magic_lantern') ? 6 : 5;

    // Draw hand
    const initialHand = shuffled.slice(0, turn1Draw);
    const remainingDraw = shuffled.slice(turn1Draw);

    setHand(initialHand);
    setDrawPile(remainingDraw);
    setDiscardPile([]);

    // Set first intention
    setIntentionIndex(0);

    // Initial logs
    const greetings = [
      `⚔️ 【戦闘開始！】 強敵 「${enemyTemplate.name}」 が立ち塞がった！`,
    ];
    if (startStrength > 0) {
      greetings.push(`🛡️ 遺物「血脈のルビー」の効果： 筋力+1 を獲得しました！`);
    }
    setCombatLog(greetings);
  }, []);

  // Sync scroll on logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  // --- ACTIONS ---

  const addLog = (text: string) => {
    setCombatLog(prev => [...prev, text]);
  };

  const addDamageIndicator = (target: 'player' | 'enemy', amount: string) => {
    const id = Math.random();
    const ind = { id, text: amount, x: Math.random() * 60 - 30, y: Math.random() * 40 - 20 };
    if (target === 'player') {
      setPlayerHits(prev => [...prev, ind]);
      setTimeout(() => setPlayerHits(prev => prev.filter(p => p.id !== id)), 1200);
    } else {
      setEnemyHits(prev => [...prev, ind]);
      setTimeout(() => setEnemyHits(prev => prev.filter(p => p.id !== id)), 1200);
    }
  };

  // Draw card helper
  const drawCards = (num: number, currentDraw: Card[], currentDiscard: Card[]) => {
    let newDraw = [...currentDraw];
    let newDiscard = [...currentDiscard];
    let drawn: Card[] = [];

    const shuffleAction = (array: Card[]) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    for (let i = 0; i < num; i++) {
      if (newDraw.length === 0) {
        if (newDiscard.length === 0) {
          break; // No cards to shuffle
        }
        newDraw = shuffleAction(newDiscard);
        newDiscard = [];
        addLog('🔄 山札が空になったため、捨て札をシャッフルしました。');
      }
      const card = newDraw.shift();
      if (card) {
        drawn.push(card);
      }
    }

    return { drawn, remainingDraw: newDraw, remainingDiscard: newDiscard };
  };

  const playCard = (card: Card) => {
    if (!isPlayerTurn) return;
    if (energy < card.cost) {
      addLog('⚠️ エネルギーが不足しています！');
      return;
    }

    const nextEnergy = energy - card.cost;
    setEnergy(nextEnergy);

    // Block logic
    let blockGained = card.block || 0;
    if (blockGained > 0) {
      setPlayer(prev => ({ ...prev, block: prev.block + blockGained }));
      addLog(`🛡️ 【ガード】${card.name} により、防御ブロック +${blockGained} を獲得。`);
      addDamageIndicator('player', `+${blockGained} 🛡️`);
    }

    // Damage calculations (accounting for strengths and weak/vuln multipliers)
    let damageBase = card.damage || 0;
    if (damageBase > 0) {
      // Add Strength
      let finalDamage = damageBase + player.strength;
      // Weak reduces damage by 25%
      if (player.weak > 0) {
        finalDamage = Math.floor(finalDamage * 0.75);
      }
      // Enemy Vulnerable increases damage taken by 50%
      if (enemy.vulnerable > 0) {
        finalDamage = Math.floor(finalDamage * 1.5);
      }

      finalDamage = Math.max(0, finalDamage);

      // Deduct from enemy block first, then HP
      setEnemy(prev => {
        let remainingDmg = finalDamage;
        let nextBlock = prev.block;
        if (nextBlock > 0) {
          if (nextBlock >= remainingDmg) {
            nextBlock -= remainingDmg;
            remainingDmg = 0;
          } else {
            remainingDmg -= nextBlock;
            nextBlock = 0;
          }
        }
        const nextHp = Math.max(0, prev.hp - remainingDmg);
        return { ...prev, block: nextBlock, hp: nextHp };
      });

      addLog(`⚔️ 【攻撃】${card.name} により、${enemy.name} に ${finalDamage} ダメージを与えた！`);
      addDamageIndicator('enemy', `-${finalDamage}`);
    }

    // Poison application
    if (card.poison && card.poison > 0) {
      setEnemy(prev => ({ ...prev, poison: prev.poison + (card.poison || 0) }));
      addLog(`🧪 【猛毒】${enemy.name} の毒値を +${card.poison} 増加。`);
    }

    // Vulnerable application
    if (card.vulnerable && card.vulnerable > 0) {
      setEnemy(prev => ({ ...prev, vulnerable: prev.vulnerable + (card.vulnerable || 0) }));
      addLog(`💥 【脆弱】${enemy.name} に脆弱 +${card.vulnerable} を付与。受ける攻撃ダメージが1.5倍に！`);
    }

    // Strength buff gain
    if (card.strengthBonus && card.strengthBonus > 0) {
      setPlayer(prev => ({ ...prev, strength: prev.strength + (card.strengthBonus || 0) }));
      addLog(`🔥 【覚醒】筋力が ＋${card.strengthBonus} 上昇！全ての攻撃ルーンの威力が上がった。`);
      addDamageIndicator('player', `+${card.strengthBonus} 💪`);
    }

    // Draw cards instantly
    let tempDraw = [...drawPile];
    let tempDiscard = [...discardPile];
    if (card.drawCards && card.drawCards > 0) {
      const drawResult = drawCards(card.drawCards, tempDraw, tempDiscard);
      setHand(prev => [...prev.filter(c => c.id !== card.id), ...drawResult.drawn]);
      tempDraw = drawResult.remainingDraw;
      tempDiscard = drawResult.remainingDiscard;
      addLog(`📑 効果により、カードを ${card.drawCards} 枚引いた。`);
    } else {
      // Remove card played from hand
      setHand(prev => prev.filter(c => c.id !== card.id));
    }

    // Card energy gain
    if (card.energyGain && card.energyGain > 0) {
      setEnergy(prev => Math.min(9, prev + (card.energyGain || 0)));
      addLog(`⚡ エネルギーが +${card.energyGain} 回復した。`);
    }

    // Double check and move card to discard pile
    setDiscardPile(prev => [...prev, card]);
    setDrawPile(tempDraw);

    // Keep discard up-to-date
    if (card.drawCards && card.drawCards > 0) {
      setDiscardPile(prev => [...tempDiscard, card]);
    }
  };

  // Check victory/defeat inside effect
  useEffect(() => {
    if (enemy.hp <= 0) {
      triggerVictory();
    }
  }, [enemy.hp]);

  useEffect(() => {
    if (player.hp <= 0) {
      onDefeat();
    }
  }, [player.hp]);

  const triggerVictory = () => {
    // Generate gold reward
    let goldReward = Math.floor(Math.random() * 25) + 20; // 20 - 45 G
    // Golden cask boosts gold reward by 25%
    if (relics.some(r => r.id === 'golden_cask')) {
      goldReward = Math.floor(goldReward * 1.25);
    }

    // Draft card selection: offer 3 random card templates that the player can add to their deck
    // Always include a high probability of rarer cards
    const getRewardOption = () => {
      const shuffled = [...CARD_POOL].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };

    onVictory(goldReward, getRewardOption());
  };

  const endTurn = () => {
    if (!isPlayerTurn) return;
    setIsPlayerTurn(false);
    addLog(`📢 プレイヤーがターン終了を宣言。エネミー 「${enemy.name}」 のターン。`);

    // Move remaining hand to discard pile
    setDiscardPile(prev => [...prev, ...hand]);
    setHand([]);

    // Trigger enemy action after minor animation timeout
    setTimeout(() => {
      resolveEnemyTurn();
    }, 1000);
  };

  // Resolve Enemy Turn
  const resolveEnemyTurn = () => {
    // 1. Reset Enemy block
    setEnemy(prev => ({ ...prev, block: 0 }));

    // 2. Resolve Poison on Enemy first
    let currentEnemyHp = enemy.hp;
    if (enemy.poison > 0) {
      const poisonDmg = enemy.poison;
      currentEnemyHp = Math.max(0, enemy.hp - poisonDmg);
      addLog(`🧪 毒が体に回っている！ ${enemyTemplate.name} は毒により ${poisonDmg} ダメージを受けた。`);
      setEnemy(prev => ({ ...prev, hp: currentEnemyHp, poison: Math.max(0, prev.poison - 1) }));
      addDamageIndicator('enemy', `-${poisonDmg} 🧪`);

      if (currentEnemyHp <= 0) {
        addLog(`💀 猛毒により ${enemyTemplate.name} が絶命した！`);
        return; // Dead. Effect triggers victory
      }
    }

    // Check if enemy is dead already
    if (currentEnemyHp <= 0) return;

    // Retrieve active intention
    const currentIntentionPattern = enemyTemplate.intentions[intentionIndex % enemyTemplate.intentions.length];

    // Calculate final outcome of enemy action
    if (currentIntentionPattern.type === 'ATTACK') {
      let dmg = currentIntentionPattern.value || 5;
      // Enemy strength added
      dmg += enemy.strength;
      // Weak reduces enemy damage by 25%
      if (enemy.weak > 0) {
        dmg = Math.floor(dmg * 0.75);
      }
      // If player is Vulnerable, increase damage taken by 50%
      if (player.vulnerable > 0) {
        dmg = Math.floor(dmg * 1.5);
      }

      dmg = Math.max(0, dmg);

      // Apply to player block/hp
      setPlayer(prev => {
        let remainingDmg = dmg;
        let nextBlock = prev.block;
        if (nextBlock > 0) {
          if (nextBlock >= remainingDmg) {
            nextBlock -= remainingDmg;
            remainingDmg = 0;
          } else {
            remainingDmg -= nextBlock;
            nextBlock = 0;
          }
        }
        const nextHp = Math.max(0, prev.hp - remainingDmg);
        return { ...prev, block: nextBlock, hp: nextHp };
      });

      addLog(`💥 ${enemyTemplate.name} の「${currentIntentionPattern.description}」！ プレイヤーに ${dmg} ダメージを与えた。`);
      addDamageIndicator('player', `-${dmg}`);

    } else if (currentIntentionPattern.type === 'DEFEND') {
      const blk = currentIntentionPattern.value || 6;
      setEnemy(prev => ({ ...prev, block: prev.block + blk }));
      addLog(`🛡️ ${enemyTemplate.name} は「${currentIntentionPattern.description}」を展開。 ブロック +${blk} を得た。`);
      addDamageIndicator('enemy', `+${blk} 🛡️`);

    } else if (currentIntentionPattern.type === 'DEBUFF') {
      // Apply weak/vulnerable to player
      setPlayer(prev => ({ ...prev, vulnerable: prev.vulnerable + 2 }));
      addLog(`⚠️ ${enemyTemplate.name} の「${currentIntentionPattern.description}」。プレイヤーに脆弱 +2 を付与した！`);

    } else if (currentIntentionPattern.type === 'BUFF') {
      const str = currentIntentionPattern.value || 2;
      setEnemy(prev => ({ ...prev, strength: prev.strength + str }));
      addLog(`💪 ${enemyTemplate.name} は「${currentIntentionPattern.description}」で激怒。 筋力+${str} 上昇！`);
      addDamageIndicator('enemy', `+${str} 💪`);
    }

    // Increment Intention pattern pointer for next turns
    setIntentionIndex(prev => prev + 1);

    // End enemy turn, start player turn
    setTimeout(() => {
      startPlayerTurn();
    }, 1200);
  };

  // Start Player Turn
  const startPlayerTurn = () => {
    // 1. Reset player block
    setPlayer(prev => ({ ...prev, block: 0 }));

    // 2. Poison check on player
    let currentPlayerHp = player.hp;
    setPlayer(prev => {
      if (prev.poison > 0) {
        currentPlayerHp = Math.max(0, prev.hp - prev.poison);
        addLog(`🧪 プレイヤーは毒により ${prev.poison} ダメージを受けた。`);
        addDamageIndicator('player', `-${prev.poison} 🧪`);
        return { ...prev, hp: currentPlayerHp, poison: Math.max(0, prev.poison - 1) };
      }
      return prev;
    });

    if (currentPlayerHp <= 0) {
      onDefeat();
      return;
    }

    // Decrement player vulnerable/weak counters
    setPlayer(prev => ({
      ...prev,
      vulnerable: Math.max(0, prev.vulnerable - 1),
      weak: Math.max(0, prev.weak - 1),
    }));

    // Draw cards (5 cards)
    const drawResult = drawCards(5, drawPile, discardPile);
    setHand(drawResult.drawn);
    setDrawPile(drawResult.remainingDraw);
    setDiscardPile(drawResult.remainingDiscard);

    // Reset Energy
    setEnergy(maxEnergy);

    // Increment overall turns count
    setTurnNumber(prev => prev + 1);
    setIsPlayerTurn(true);
    addLog(`✨ 【第 ${turnNumber + 1} ターン】 プレイヤーの行動開始。山札からドローしました。`);
  };

  const getNextIntention = (): Intention => {
    const pattern = enemyTemplate.intentions[intentionIndex % enemyTemplate.intentions.length];
    
    switch (pattern.type) {
      case 'ATTACK':
        const finalDmg = (pattern.value || 5) + enemy.strength;
        return { type: 'ATTACK', value: finalDmg, description: pattern.description };
      case 'DEFEND':
        return { type: 'DEFEND', value: pattern.value, description: pattern.description };
      case 'BUFF':
        return { type: 'BUFF', value: pattern.value, description: pattern.description };
      case 'DEBUFF':
        return { type: 'DEBUFF', value: pattern.value, description: pattern.description };
      default:
        return { type: 'UNKNOWN', description: '様子を伺っている...' };
    }
  };

  const nextIntent = getNextIntention();

  return (
    <div className="flex flex-col h-full bg-zinc-950 font-sans text-zinc-100 p-4 select-none relative overflow-hidden" id="battle-grid">
      
      {/* Background glowing rings */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row / Stats Panel bar */}
      <div className="flex justify-between items-center bg-zinc-900/60 p-3 rounded-xl border border-zinc-900/50 backdrop-blur" id="battle-action-header">
        <div className="flex items-center gap-1.5" id="battle-title-indicator">
          <span className="text-xs bg-red-600/25 border border-red-500/40 text-red-300 font-bold px-2 py-0.5 rounded font-mono">第{turnNumber}ターン</span>
          <h2 className="text-xs sm:text-sm font-bold text-zinc-300">バトルVS {enemyTemplate.name}</h2>
        </div>

        <div className="flex items-center gap-2" id="battle-header-actions">
          <button 
            onClick={() => setShowMapOverlay(true)}
            className="flex items-center gap-1.5 text-xs bg-zinc-805 bg-zinc-850 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-lg cursor-pointer font-bold"
            id="btn-battle-map-preview"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>マップを見る</span>
          </button>

          <button 
            onClick={onOpenDeckView}
            className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 cursor-pointer font-semibold"
            id="btn-battle-deck-check"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>デッキ確認 ({playerDeckTemplates.length})</span>
          </button>
        </div>
      </div>

      {/* Combatants Arena stage */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center px-2 py-4" id="combatants-arena">
        
        {/* PLAYER SIDE */}
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-900/80 p-5 flex flex-col justify-between h-48 relative overflow-hidden" id="stage-player-side">
          <div className="flex justify-between items-start" id="player-profile-header">
            <div>
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">Player Hero</span>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>ルーンの戦士</span>
                {player.strength > 0 && <span className="text-xs text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">筋力+{player.strength}</span>}
              </h3>
            </div>

            {/* Health Bar */}
            <div className="text-right" id="player-head-health">
              <span className="font-mono font-black text-lg text-white">
                {player.hp} <span className="text-xs text-zinc-500">/ {player.maxHp} HP</span>
              </span>
              <div className="w-32 bg-zinc-950 h-2.5 rounded-full overflow-hidden mt-1 border border-zinc-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active status alerts (Block, Poison, etc) */}
          <div className="flex items-center gap-3 mt-4" id="player-status-chips">
            {player.block > 0 && (
              <div className="flex items-center gap-1 bg-blue-900/40 text-blue-200 border border-blue-600/40 px-2.5 py-1 rounded-lg text-xs font-bold font-mono" id="player-block-badge">
                <Shield className="w-3.5 h-3.5" />
                <span>ブロック: {player.block}</span>
              </div>
            )}
            {player.poison > 0 && (
              <div className="flex items-center gap-1 bg-green-950/50 text-green-300 border border-green-600/30 px-2 py-0.5 rounded-md text-xs font-mono" id="player-poison-badge">
                <span>🧪 毒: {player.poison}</span>
              </div>
            )}
            {player.vulnerable > 0 && (
              <div className="flex items-center gap-1 bg-red-950/50 text-red-350 border border-red-600/30 px-2 py-0.5 rounded-md text-xs font-mono animate-pulse" id="player-vul-badge">
                <span>💥 脆弱: {player.vulnerable}t</span>
              </div>
            )}
          </div>

          {/* Active Relics list in Battle with helper tooltips */}
          {relics.length > 0 && (
            <div className="flex items-center gap-2 mt-3.5" id="battle-player-relics">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">所持遺物:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {relics.map(relic => (
                  <div
                    key={relic.id}
                    className="group relative flex items-center gap-1.5 bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/50 px-2 py-0.5 rounded text-[10px] transition-all cursor-help"
                    id={`battle-relic-${relic.id}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-zinc-300 font-extrabold">{relic.name}</span>
                    {/* Tooltip for BattleScreen Relic detail overlay */}
                    <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible w-52 p-2 bg-black border border-zinc-700 rounded-md shadow-2xl z-50 text-[10px] leading-relaxed text-zinc-200 select-none">
                      <p className="font-bold text-amber-400 mb-0.5 border-b border-zinc-950 pb-0.5">{relic.name}</p>
                      <p className="text-zinc-400 font-medium">{relic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Damage Indicators float animation */}
          <AnimatePresence>
            {playerHits.map(hit => (
              <motion.div
                key={hit.id}
                initial={{ opacity: 1, y: 10, scale: 0.8 }}
                animate={{ opacity: 0, y: -50, scale: 1.3 }}
                exit={{ opacity: 0 }}
                className="absolute right-12 top-1/2 -translate-y-1/2 font-mono font-black text-2xl text-red-500 z-50 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] pointer-events-none"
              >
                {hit.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>


        {/* ENEMY SIDE */}
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-900/80 p-5 flex flex-col justify-between h-48 relative overflow-hidden" id="stage-enemy-side">
          <div className="flex justify-between items-start" id="enemy-profile-header">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{enemyTemplate.visualPrefix}</span>
                <span className="text-xs font-mono text-rose-400 uppercase tracking-widest font-bold">Dungeon Monster</span>
              </div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                <span>{enemyTemplate.name}</span>
                {enemy.strength > 0 && <span className="text-xs text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded font-mono">筋力+{enemy.strength}</span>}
              </h3>
            </div>

            {/* Health Bar */}
            <div className="text-right" id="enemy-head-health">
              <span className="font-mono font-black text-lg text-white">
                {enemy.hp} <span className="text-xs text-zinc-500">/ {enemy.maxHp} HP</span>
              </span>
              <div className="w-32 bg-zinc-950 h-2.5 rounded-full overflow-hidden mt-1 border border-zinc-800">
                <div 
                  className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-300"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Intention Bubble (Predicting opponent move) */}
          <div className="my-2 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between" id="intention-bar">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-950/30 flex items-center justify-center text-amber-500 border border-amber-500/20" id="intent-icon">
                {nextIntent.type === 'ATTACK' ? (
                  <Swords className="w-4 h-4 text-red-400" />
                ) : nextIntent.type === 'DEFEND' ? (
                  <Shield className="w-4 h-4 text-blue-400" />
                ) : nextIntent.type === 'BUFF' ? (
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-purple-400 animate-pulse" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono block text-zinc-500 uppercase tracking-wider">次回エネミー行動予測:</span>
                <span className="text-xs text-zinc-100 font-bold">{nextIntent.description}</span>
              </div>
            </div>

            {/* If Attack has damage indicator */}
            {nextIntent.type === 'ATTACK' && (
              <div className="font-bold text-red-500 text-sm font-mono mr-2" id="attack-preview-digit">
                {nextIntent.value} <span className="text-[10px] text-zinc-500">DMG</span>
              </div>
            )}
            {nextIntent.type === 'DEFEND' && (
              <div className="font-bold text-blue-400 text-sm font-mono mr-2" id="defend-preview-digit">
                +{nextIntent.value} <span className="text-[10px] text-zinc-500">BLOCK</span>
              </div>
            )}
          </div>

          {/* Enemies active status indicators */}
          <div className="flex items-center gap-3" id="enemy-status-chips">
            {enemy.block > 0 && (
              <div className="flex items-center gap-1 bg-blue-900/40 text-blue-200 border border-blue-600/40 px-2.5 py-1 rounded-lg text-xs font-bold font-mono" id="enemy-block-badge">
                <Shield className="w-3.5 h-3.5" />
                <span>ブロック: {enemy.block}</span>
              </div>
            )}
            {enemy.poison > 0 && (
              <div className="flex items-center gap-1 bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-mono" id="enemy-poison-badge">
                <span>🧪 毒： {enemy.poison}</span>
              </div>
            )}
            {enemy.vulnerable > 0 && (
              <div className="flex items-center gap-1 bg-red-950/50 text-red-300 border border-red-600/30 px-2.5 py-1 rounded-lg text-xs font-mono" id="enemy-vul-badge">
                <span>💥 脆弱： {enemy.vulnerable}t</span>
              </div>
            )}
          </div>

          {/* Damage Indicators float animation */}
          <AnimatePresence>
            {enemyHits.map(hit => (
              <motion.div
                key={hit.id}
                initial={{ opacity: 1, y: 10, scale: 0.8 }}
                animate={{ opacity: 0, y: -50, scale: 1.3 }}
                exit={{ opacity: 0 }}
                className="absolute left-12 top-1/2 -translate-y-1/2 font-mono font-black text-2xl text-red-500 z-50 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] pointer-events-none"
              >
                {hit.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Interactive Logs (Combat Log Box) */}
      <div className="h-28 bg-zinc-950 border border-zinc-900/80 rounded-xl p-3 mb-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-400" id="battle-logs-box">
        {combatLog.map((log, idx) => (
          <div key={idx} className="mb-1 text-zinc-300" id={`combat-log-line-${idx}`}>
            <span className="text-[10px] text-zinc-600 mr-2">[{idx + 1}]</span>
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Control Station (Energy Meter & Action button) */}
      <div className="flex justify-between items-center bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-800 mb-4" id="action-console-panel">
        
        {/* Real-time energy indicator */}
        <div className="flex items-center gap-3" id="energy-widget">
          <div className="relative w-14 h-14 rounded-full bg-indigo-950 border-4 border-indigo-500 shadow-lg shadow-indigo-950/50 flex flex-col justify-center items-center select-none" id="energy-orb">
            <Zap className="w-5 h-5 text-indigo-400 absolute top-1" />
            <span className="font-mono text-[17px] font-black text-white mt-3 leading-none z-10">{energy}</span>
            <span className="text-[10px] font-bold text-indigo-300 leading-none z-10">/ {maxEnergy}</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block font-mono font-bold tracking-wider uppercase">Energy Pool</span>
            <span className="text-xs text-zinc-200 font-semibold">各種ルーンをプレイします</span>
          </div>
        </div>

        {/* Dynamic hand card piles counters */}
        <div className="flex gap-4 items-center" id="card-pile-indicators">
          <div className="text-center font-mono opacity-60 hover:opacity-100 transition-opacity" id="pile-draw-count">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Draw Pile</span>
            <span className="text-sm font-bold text-zinc-300">{drawPile.length} 枚</span>
          </div>

          <div className="w-px h-8 bg-zinc-800" />

          <div className="text-center font-mono opacity-60 hover:opacity-100 transition-opacity" id="pile-discard-count">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Discard</span>
            <span className="text-sm font-bold text-zinc-300">{discardPile.length} 枚</span>
          </div>
        </div>

        {/* Turn Trigger button */}
        <button
          onClick={endTurn}
          disabled={!isPlayerTurn}
          className={`
            font-black px-6 py-3 rounded-xl transition-all border shadow-lg cursor-pointer text-xs uppercase tracking-widest
            ${isPlayerTurn
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border-amber-400 shadow-amber-950/30 text-zinc-950'
              : 'bg-zinc-800 text-zinc-600 border-zinc-900 cursor-not-allowed opacity-50'
            }
          `}
          id="btn-end-turn"
        >
          {isPlayerTurn ? '⏰ ターン終了' : 'エネミー行動中'}
        </button>
      </div>

      {/* Players Hand area */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4 flex justify-center items-center overflow-x-auto min-h-[175px] max-w-5xl mx-auto w-full" id="hand-tray-contain">
        
        {hand.length === 0 ? (
          <div className="text-xs text-zinc-600 italic py-6" id="empty-hand-prompt">
            手札がありません
          </div>
        ) : (
          <div className="flex flex-flow-row gap-3 py-1 px-4" id="cards-hand-row">
            {hand.map((card, idx) => {
              const affordable = energy >= card.cost;
              const isRare = card.rarity === 'RARE';
              const isUncommon = card.rarity === 'UNCOMMON';

              return (
                <motion.button
                  key={card.id}
                  disabled={!affordable || !isPlayerTurn}
                  onClick={() => playCard(card)}
                  whileHover={affordable && isPlayerTurn ? { y: -20, scale: 1.05 } : {}}
                  whileTap={affordable && isPlayerTurn ? { scale: 0.95 } : {}}
                  className={`
                    w-28 h-36 rounded-xl border p-2.5 flex flex-col justify-between shadow-lg relative text-left transition-all shrink-0
                    ${affordable && isPlayerTurn
                      ? isRare
                        ? 'bg-gradient-to-br from-amber-950 to-zinc-900 border-amber-400 shadow-amber-500/10 cursor-pointer text-amber-100 hover:border-amber-300'
                        : isUncommon
                        ? 'bg-gradient-to-br from-purple-950 to-zinc-900 border-purple-400 shadow-purple-500/10 cursor-pointer text-purple-100 hover:border-purple-300'
                        : 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-600 cursor-pointer text-zinc-100 hover:border-zinc-400'
                      : 'bg-zinc-950 border-zinc-900/60 opacity-40 cursor-not-allowed text-zinc-600'
                    }
                  `}
                  id={`hand-card-${card.id}`}
                >
                  {/* Miniature cost circle */}
                  <div className={`
                    absolute top-1.5 left-1.5 w-5 h-5 rounded-full font-mono text-[10px] font-black flex items-center justify-center border shadow-sm
                    ${affordable && isPlayerTurn ? 'bg-zinc-950 border-zinc-700 text-amber-400' : 'bg-zinc-950 border-zinc-900 text-zinc-700'}
                  `}>
                    {card.cost}
                  </div>

                  {/* Icon type marker */}
                  <div className="absolute top-1.5 right-1.5 opacity-60">
                    {card.type === 'ATTACK' ? (
                      <Swords className="w-3.5 h-3.5 text-rose-400" />
                    ) : card.type === 'SKILL' ? (
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                  </div>

                  {/* Info layout */}
                  <div className="pt-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-black tracking-tighter text-white leading-tight line-clamp-2">
                        {card.name}
                      </h4>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                        {card.type === 'ATTACK' ? 'アタック' : card.type === 'SKILL' ? 'スキル' : 'パワー'}
                      </span>
                    </div>

                    <div className="my-1 p-1 bg-black/30 rounded border border-zinc-900/30 text-[9px] leading-tight text-zinc-300 overflow-y-auto max-h-[48px]">
                      {card.description}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Map overlay in battle */}
      <AnimatePresence>
        {showMapOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
          >
            <MapScreen
              playerStatus={{
                ...playerStatus,
                hp: player.hp, // Use current active HP inside the battle
              }}
              mapNodes={mapNodes}
              currentNodeId={currentNodeId}
              onSelectNode={() => {}} // No action during preview
              onOpenDeckView={() => {}} // Inactive during preview
              isPreview={true}
              onClosePreview={() => setShowMapOverlay(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
