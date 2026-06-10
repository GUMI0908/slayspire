import React, { useState, useEffect } from 'react';
import { 
  GameScreen, 
  PlayerStatus, 
  CardTemplate, 
  MapNode, 
  NodeType, 
  Relic, 
  GameEvent,
  EnemyTemplate
} from './types';
import { 
  getInitialDeck, 
  ENEMIES_NORMAL, 
  ENEMIES_ELITE, 
  ENEMIES_BOSS, 
  EVENTS_POOL, 
  RELIC_POOL,
  CARD_POOL
} from './data';
import MapScreen from './components/MapScreen';
import DeckScreen from './components/DeckScreen';
import ShopScreen from './components/ShopScreen';
import EventScreen from './components/EventScreen';
import BattleScreen from './components/BattleScreen';
import RewardScreen from './components/RewardScreen';
import RestScreen from './components/RestScreen';

import { 
  Swords, 
  Sparkles, 
  Flame, 
  RotateCcw, 
  VolumeX, 
  HelpCircle, 
  Trophy, 
  Crown,
  Heart,
  Shield,
  Coins,
  Compass,
  Skull
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOCAL_STORAGE_KEY = 'rune_dungeon_save_state';

// Helper to generate deterministic branches of nodes
const generateMapNodes = (): MapNode[] => {
  const nodes: MapNode[] = [];
  
  // Floor 1: Start battle
  nodes.push({ id: 'node_1_c', floor: 1, lane: 2, type: 'COMBAT', connectedTo: ['node_2_e1', 'node_2_e2'], completed: false });

  // Floor 2: Mystery Choice Events
  nodes.push({ id: 'node_2_e1', floor: 2, lane: 1, type: 'EVENT', connectedTo: ['node_3_cl'], completed: false });
  nodes.push({ id: 'node_2_e2', floor: 2, lane: 3, type: 'EVENT', connectedTo: ['node_3_cr'], completed: false });

  // Floor 3: Regular Combat
  nodes.push({ id: 'node_3_cl', floor: 3, lane: 1, type: 'COMBAT', connectedTo: ['node_4_treasure'], completed: false });
  nodes.push({ id: 'node_3_cr', floor: 3, lane: 3, type: 'COMBAT', connectedTo: ['node_4_treasure'], completed: false });

  // Floor 4: Mysterious Chest
  nodes.push({ id: 'node_4_treasure', floor: 4, lane: 2, type: 'TREASURE', connectedTo: ['node_5_shop'], completed: false });

  // Floor 5: Merchant Shop
  nodes.push({ id: 'node_5_shop', floor: 5, lane: 2, type: 'SHOP', connectedTo: ['node_6_el', 'node_6_cr'], completed: false });

  // Floor 6: Elite / Combat split
  nodes.push({ id: 'node_6_el', floor: 6, lane: 1, type: 'ELITE', connectedTo: ['node_7_camp'], completed: false });
  nodes.push({ id: 'node_6_cr', floor: 6, lane: 3, type: 'COMBAT', connectedTo: ['node_7_camp'], completed: false });

  // Floor 7: Campfire
  nodes.push({ id: 'node_7_camp', floor: 7, lane: 2, type: 'REST', connectedTo: ['node_8_e1', 'node_8_e2'], completed: false });

  // Floor 8: Final pre-boss elite split
  nodes.push({ id: 'node_8_e1', floor: 8, lane: 1, type: 'ELITE', connectedTo: ['node_9_boss'], completed: false });
  nodes.push({ id: 'node_8_e2', floor: 8, lane: 3, type: 'EVENT', connectedTo: ['node_9_boss'], completed: false });

  // Floor 9: Dragon Boss
  nodes.push({ id: 'node_9_boss', floor: 9, lane: 2, type: 'BOSS', connectedTo: [], completed: false });

  return nodes;
};

export default function App() {
  
  // --- STATE ---
  const [gameScreen, setGameScreen] = useState<GameScreen>('TITLE');
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
    hp: 80,
    maxHp: 80,
    gold: 140, // generous start to buy something
    floor: 0,
    relics: [],
    xp: 0,
    stage: 1,
  });

  const [playerDeck, setPlayerDeck] = useState<CardTemplate[]>([]);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  // Deck view secondary overlay control
  const [showDeckOverlay, setShowDeckOverlay] = useState(false);

  // Active encounters context
  const [activeEnemy, setActiveEnemy] = useState<EnemyTemplate | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  // Reward collections (cache after a victory is won)
  const [rewardGold, setRewardGold] = useState(0);
  const [rewardRelic, setRewardRelic] = useState<Relic | null>(null);
  const [rewardCardsSelection, setRewardCardsSelection] = useState<CardTemplate[]>([]);

  // Soundless UI states
  const [showHowToModal, setShowHowToModal] = useState(false);

  // --- SAVE / LOAD GAME ---
  useEffect(() => {
    // Try to restore saved game
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.playerStatus && parsed.playerDeck && parsed.mapNodes) {
          // Sanity checks to avoid black screen: if activeEnemy/activeEvent is null but screen is BATTLE/EVENT
          let restoredScreen = parsed.gameScreen || 'TITLE';
          const restoredEnemy = parsed.activeEnemy || null;
          const restoredEvent = parsed.activeEvent || null;

          if (restoredScreen === 'BATTLE' && !restoredEnemy) {
            restoredScreen = 'MAP';
          }
          if (restoredScreen === 'EVENT' && !restoredEvent) {
            restoredScreen = 'MAP';
          }

          // Verify
          setPlayerStatus(parsed.playerStatus);
          setPlayerDeck(parsed.playerDeck);
          setMapNodes(parsed.mapNodes);
          setCurrentNodeId(parsed.currentNodeId || null);
          setActiveEnemy(restoredEnemy);
          setActiveEvent(restoredEvent);
          setGameScreen(restoredScreen);
        }
      }
    } catch (e) {
      console.warn('Could not restore game session:', e);
    }
  }, []);

  const saveCurrentGame = (
    scr: GameScreen, 
    status: PlayerStatus, 
    deck: CardTemplate[], 
    nodes: MapNode[], 
    nodeId: string | null,
    overrideEnemy?: EnemyTemplate | null,
    overrideEvent?: GameEvent | null
  ) => {
    try {
      const payload = {
        gameScreen: scr,
        playerStatus: status,
        playerDeck: deck,
        mapNodes: nodes,
        currentNodeId: nodeId,
        activeEnemy: overrideEnemy !== undefined ? overrideEnemy : activeEnemy,
        activeEvent: overrideEvent !== undefined ? overrideEvent : activeEvent,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  };

  const clearSavedGame = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  // --- TRIGGERS & SCENARIOS ---

  const handleStartNewGame = () => {
    const freshStatus: PlayerStatus = {
      hp: 80,
      maxHp: 80,
      gold: 150,
      floor: 0,
      relics: [],
      xp: 0,
      stage: 1,
    };
    const freshDeck = getInitialDeck();
    const freshNodes = generateMapNodes();
    
    // Clear out active nodes context
    setActiveEnemy(null);
    setActiveEvent(null);
    
    setPlayerStatus(freshStatus);
    setPlayerDeck(freshDeck);
    setMapNodes(freshNodes);
    setCurrentNodeId(null);
    setGameScreen('MAP');

    saveCurrentGame('MAP', freshStatus, freshDeck, freshNodes, null, null, null);
  };

  const handleSelectMapNode = (node: MapNode) => {
    // Calculate new status floor rank
    const updatedStatus = {
      ...playerStatus,
      floor: node.floor,
    };

    setPlayerStatus(updatedStatus);
    setCurrentNodeId(node.id);

    // Routings based on node characteristics
    if (node.type === 'COMBAT') {
      // Pick random regular enemy
      const randomEnemy = ENEMIES_NORMAL[Math.floor(Math.random() * ENEMIES_NORMAL.length)];
      setActiveEnemy(randomEnemy);
      setGameScreen('BATTLE');
      saveCurrentGame('BATTLE', updatedStatus, playerDeck, mapNodes, node.id, randomEnemy, null);

    } else if (node.type === 'ELITE') {
      // Pick random elite
      const randomElite = ENEMIES_ELITE[Math.floor(Math.random() * ENEMIES_ELITE.length)];
      setActiveEnemy(randomElite);
      setGameScreen('BATTLE');
      saveCurrentGame('BATTLE', updatedStatus, playerDeck, mapNodes, node.id, randomElite, null);

    } else if (node.type === 'BOSS') {
      // Epic dragon boss
      const bossEnemy = ENEMIES_BOSS[0];
      setActiveEnemy(bossEnemy);
      setGameScreen('BATTLE');
      saveCurrentGame('BATTLE', updatedStatus, playerDeck, mapNodes, node.id, bossEnemy, null);

    } else if (node.type === 'EVENT') {
      // Choice event
      const randomEvent = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
      setActiveEvent(randomEvent);
      setGameScreen('EVENT');
      saveCurrentGame('EVENT', updatedStatus, playerDeck, mapNodes, node.id, null, randomEvent);

    } else if (node.type === 'SHOP') {
      setGameScreen('SHOP');
      saveCurrentGame('SHOP', updatedStatus, playerDeck, mapNodes, node.id, null, null);

    } else if (node.type === 'REST') {
      setGameScreen('REST');
      saveCurrentGame('REST', updatedStatus, playerDeck, mapNodes, node.id, null, null);

    } else if (node.type === 'TREASURE') {
      // Instantly open treasure reward draft without fighting
      const treasureGold = Math.floor(Math.random() * 40) + 80; // 80 - 120 G
      
      // Select 1 relic that player does not already have
      const unownedRelics = RELIC_POOL.filter(r => !playerStatus.relics.some(pr => pr.id === r.id));
      const relicAward = unownedRelics.length > 0 ? unownedRelics[Math.floor(Math.random() * unownedRelics.length)] : null;
      
      // Auto cards selection for reward
      const shufflePool = [...CARD_POOL].sort(() => 0.5 - Math.random());
      const selectedCardsReward = shufflePool.slice(0, 3);

      setRewardGold(treasureGold);
      setRewardRelic(relicAward);
      setRewardCardsSelection(selectedCardsReward);

      setGameScreen('REWARD');
      saveCurrentGame('REWARD', updatedStatus, playerDeck, mapNodes, node.id, null, null);
    }
  };

  // --- BATTLE VICTORY ---
  const handleBattleVictory = (goldGained: number, selectedCards: CardTemplate[]) => {
    // Determine relic drop if fighting elite or boss
    let droppedRelic: Relic | null = null;
    const activeNodeObj = mapNodes.find(n => n.id === currentNodeId);

    if (activeNodeObj && (activeNodeObj.type === 'ELITE' || activeNodeObj.type === 'BOSS')) {
      const remainingRelics = RELIC_POOL.filter(r => !playerStatus.relics.some(pr => pr.id === r.id));
      if (remainingRelics.length > 0) {
        droppedRelic = remainingRelics[Math.floor(Math.random() * remainingRelics.length)];
      }
    }

    // Apply sun medallion heal if exists
    let healAmount = 0;
    if (playerStatus.relics.some(r => r.id === 'sun_amulet')) {
      healAmount = 6;
    }

    const nextStatus = {
      ...playerStatus,
      hp: Math.min(playerStatus.maxHp, playerStatus.hp + healAmount),
    };

    setPlayerStatus(nextStatus);
    setRewardGold(goldGained);
    setRewardRelic(droppedRelic);
    setRewardCardsSelection(selectedCards);

    setGameScreen('REWARD');
    saveCurrentGame('REWARD', nextStatus, playerDeck, mapNodes, currentNodeId);
  };

  // --- REWARD CLAIMS ---
  const handleClaimRewardGold = () => {
    const nextStatus = {
      ...playerStatus,
      gold: playerStatus.gold + rewardGold,
    };
    setPlayerStatus(nextStatus);
    saveCurrentGame('REWARD', nextStatus, playerDeck, mapNodes, currentNodeId);
  };

  const handleClaimRewardRelic = (relic: Relic) => {
    const nextStatus = {
      ...playerStatus,
      relics: [...playerStatus.relics, relic],
    };
    setPlayerStatus(nextStatus);
    saveCurrentGame('REWARD', nextStatus, playerDeck, mapNodes, currentNodeId);
  };

  const handleClaimRewardCard = (card: CardTemplate) => {
    const nextDeck = [...playerDeck, card];
    setPlayerDeck(nextDeck);
    saveCurrentGame('REWARD', playerStatus, nextDeck, mapNodes, currentNodeId);
  };

  const handleProceedAfterRewards = () => {
    // Mark current node as completed
    const updatedNodes = mapNodes.map(n => n.id === currentNodeId ? { ...n, completed: true } : n);
    setMapNodes(updatedNodes);

    // Is it the final boss floor?
    const bossNode = mapNodes.find(n => n.id === currentNodeId);
    if (bossNode && bossNode.type === 'BOSS') {
      setGameScreen('VICTORY');
      clearSavedGame();
    } else {
      setGameScreen('MAP');
      saveCurrentGame('MAP', playerStatus, playerDeck, updatedNodes, currentNodeId);
    }
  };

  // --- GENERAL UPDATES ---
  const handleDirectStatusUpdate = (nextStatus: PlayerStatus) => {
    setPlayerStatus(nextStatus);
    saveCurrentGame(gameScreen, nextStatus, playerDeck, mapNodes, currentNodeId);
  };

  const handleDirectDeckUpdate = (nextDeck: CardTemplate[]) => {
    setPlayerDeck(nextDeck);
    saveCurrentGame(gameScreen, playerStatus, nextDeck, mapNodes, currentNodeId);
  };

  const handleLeaveSubScreen = () => {
    // Set node completed if leaving shop or rest campfire or event
    const updatedNodes = mapNodes.map(n => n.id === currentNodeId ? { ...n, completed: true } : n);
    setMapNodes(updatedNodes);

    setGameScreen('MAP');
    saveCurrentGame('MAP', playerStatus, playerDeck, updatedNodes, currentNodeId);
  };

  const handlePlayerDefeat = () => {
    setGameScreen('GAME_OVER');
    clearSavedGame();
  };

  // Has active save game checker
  const hasSavedGame = currentNodeId !== null;

  return (
    <div className="w-full h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col justify-between" id="applet-viewport">
      
      {/* Overlay check deck during combat or map planning */}
      <AnimatePresence>
        {showDeckOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <DeckScreen 
              deck={playerDeck} 
              onClose={() => setShowDeckOverlay(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Display routing states */}
      <div className="flex-1 overflow-hidden relative">
        {gameScreen === 'TITLE' && (
          <div className="h-full flex flex-col justify-center items-center bg-zinc-950 p-6 relative" id="title-wrapper">
            
            {/* Ambient visual glowing particles */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <div className="max-w-xl text-center z-10" id="title-box">
              <div className="inline-flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold text-rose-300 uppercase tracking-widest mb-4" id="title-badge">
                <Crown className="w-4.5 h-4.5 text-rose-400" />
                <span>Rogue-lite Deck-builder</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md select-none font-sans" id="game-main-title">
                ルーンダンジョン
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium tracking-wide mt-3" id="game-main-subtitle">
                強力な魔導ルーンを集め、深淵の古代ドラゴン討伐に挑む、本格派カードダンジョン。
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-flow-row gap-3 mt-8 max-w-sm mx-auto" id="title-actions">
                <button
                  onClick={handleStartNewGame}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-black px-6 py-4 rounded-xl shadow-xl shadow-teal-950/20 cursor-pointer transition-all border border-teal-300 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                  id="btn-new-adventure"
                >
                  <Swords className="w-4 h-4 text-zinc-950" />
                  <span>新しく冒険を始める</span>
                </button>

                {hasSavedGame && (
                  <button
                    onClick={() => setGameScreen('MAP')}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold px-6 py-3.5 rounded-xl border border-zinc-800 transition-all cursor-pointer text-xs uppercase tracking-widest text-center"
                    id="btn-resume-adventure"
                  >
                    前回から冒険を再開
                  </button>
                )}

                <button
                  onClick={() => setShowHowToModal(true)}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 px-6 py-3.5 rounded-xl transition-all cursor-pointer text-xs"
                  id="btn-howtostart"
                >
                  遊び方マニュアル
                </button>
              </div>

              {/* Version info footprint */}
              <div className="border-t border-zinc-900 mt-12 pt-4 flex justify-center items-center gap-6 text-[11px] text-zinc-600 font-mono" id="title-footer-row">
                <span>V1.0.4-PROUD</span>
                <span>DESKTOP OPTIMIZED</span>
              </div>
            </div>
          </div>
        )}

        {gameScreen === 'MAP' && (
          <MapScreen
            playerStatus={playerStatus}
            mapNodes={mapNodes}
            currentNodeId={currentNodeId}
            onSelectNode={handleSelectMapNode}
            onOpenDeckView={() => setShowDeckOverlay(true)}
            onRestartGame={handleStartNewGame}
          />
        )}

        {gameScreen === 'BATTLE' && activeEnemy && (
          <BattleScreen
            playerDeckTemplates={playerDeck}
            enemyTemplate={activeEnemy}
            relics={playerStatus.relics}
            playerStatus={playerStatus}
            mapNodes={mapNodes}
            currentNodeId={currentNodeId}
            onVictory={handleBattleVictory}
            onDefeat={handlePlayerDefeat}
            onOpenDeckView={() => setShowDeckOverlay(true)}
          />
        )}

        {gameScreen === 'SHOP' && (
          <ShopScreen
            playerStatus={playerStatus}
            playerDeck={playerDeck}
            onBuyCard={(card, price) => {
              setPlayerDeck([...playerDeck, card]);
              setPlayerStatus(prev => ({ ...prev, gold: prev.gold - price }));
            }}
            onBuyRelic={(relic, price) => {
              setPlayerStatus(prev => ({ ...prev, relics: [...prev.relics, relic], gold: prev.gold - price }));
            }}
            onRemoveCard={(index, price) => {
              const updated = [...playerDeck];
              updated.splice(index, 1);
              setPlayerDeck(updated);
              setPlayerStatus(prev => ({ ...prev, gold: prev.gold - price }));
            }}
            onLeave={handleLeaveSubScreen}
          />
        )}

        {gameScreen === 'EVENT' && activeEvent && (
          <EventScreen
            event={activeEvent}
            playerStatus={playerStatus}
            playerDeck={playerDeck}
            onChangeStatus={handleDirectStatusUpdate}
            onChangeDeck={handleDirectDeckUpdate}
            onLeave={handleLeaveSubScreen}
          />
        )}

        {gameScreen === 'REST' && (
          <RestScreen
            playerStatus={playerStatus}
            playerDeck={playerDeck}
            onChangeStatus={handleDirectStatusUpdate}
            onChangeDeck={handleDirectDeckUpdate}
            onLeave={handleLeaveSubScreen}
          />
        )}

        {gameScreen === 'REWARD' && (
          <RewardScreen
            playerStatus={playerStatus}
            goldQuantity={rewardGold}
            relicDrop={rewardRelic}
            cardSelection={rewardCardsSelection}
            onClaimGold={handleClaimRewardGold}
            onClaimRelic={handleClaimRewardRelic}
            onClaimCard={handleClaimRewardCard}
            onProceed={handleProceedAfterRewards}
          />
        )}

        {gameScreen === 'GAME_OVER' && (
          <div className="h-full flex flex-col justify-center items-center bg-zinc-950 p-6 text-center" id="gameover-stage">
            <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 animate-pulse" id="defeat-skull">
              <Skull className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-red-500 uppercase tracking-widest" id="defeat-header">冒険失敗 (Defeat)</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-sm">
              ダンジョンの厳しい魔力の濁流に呑まれ、体力がゼロになりました。ルーンを最適化して再挑戦しましょう！
            </p>

            <button
              onClick={() => {
                setGameScreen('TITLE');
                setCurrentNodeId(null);
              }}
              className="mt-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-extrabold px-8 py-3 rounded-xl border border-zinc-800 transition-all cursor-pointer text-xs tracking-wider"
              id="btn-return-title"
            >
              タイトル画面へ戻る
            </button>
          </div>
        )}

        {gameScreen === 'VICTORY' && (
          <div className="h-full flex flex-col justify-center items-center bg-zinc-950 p-6 text-center" id="victory-stage">
            <div className="w-16 h-16 rounded-full bg-yellow-950/40 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6 animate-bounce" id="win-trophy">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-yellow-400 uppercase tracking-widest" id="victory-header">ダンジョン完全制覇</h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-3 max-w-md mx-auto leading-relaxed">
              おめでとうございます！深淵のヘルファイア・ドラゴンを撃破し、最高峰の古代魔導秘石を手に入れた。君の名はルーンマスターとして永劫に語り継がれるだろう。
            </p>

            <div className="mt-8 p-4 bg-zinc-900 border border-zinc-805 rounded-xl max-w-xs text-left" id="victory-stats-box">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest mb-1.5">冒険の記録 (Summary)</span>
              <p className="text-xs text-zinc-300">最終階層: <span className="font-bold text-white font-mono">Floor 9 (Boss Clearance)</span></p>
              <p className="text-xs text-zinc-300">所持レリック数: <span className="font-bold text-white font-mono">{playerStatus.relics.length}個</span></p>
              <p className="text-xs text-zinc-300">所持デッキ枚数: <span className="font-bold text-white font-mono">{playerDeck.length}枚</span></p>
            </div>

            <button
              onClick={() => {
                setGameScreen('TITLE');
                setCurrentNodeId(null);
              }}
              className="mt-8 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black px-8 py-3.5 rounded-xl shadow-xl cursor-pointer transition-all border border-amber-300 text-xs tracking-wider font-sans uppercase"
              id="btn-victory-restart"
            >
              新たな冒険への挑戦
            </button>
          </div>
        )}
      </div>

      {/* Play Rules Modal */}
      {showHowToModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-center items-center p-4" id="howto-modal-overlay">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]" id="howto-modal">
            <h3 className="text-lg sm:text-xl font-bold text-white border-b border-zinc-805 pb-3 mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              遊び方マニュアル (Learn to Play)
            </h3>

            <div className="text-xs sm:text-sm text-zinc-300 space-y-4 leading-relaxed" id="howto-content">
              <div>
                <h4 className="font-bold text-emerald-400 text-xs tracking-widest uppercase mb-1">1. デッキとエネルギー管理</h4>
                <p>プレイヤーは毎ターン3個のエネルギーを持って行動を開始し、山札から5枚のルーンカードをドローして手札とします。手札のルーンをタップすると、コスト分のエネルギーを支払って効果を発動させることができます。</p>
              </div>

              <div>
                <h4 className="font-bold text-emerald-400 text-xs tracking-widest uppercase mb-1">2. 防御（ブロック）の維持</h4>
                <p>バトルのターン開始時、プレイヤーの防御（ブロック値）は0にリセットされます。エネミーのアタック予告（!印）にあわせてガードルーンを使用し、直接ダメージを防ぐことが重要です。</p>
              </div>

              <div>
                <h4 className="font-bold text-emerald-400 text-xs tracking-widest uppercase mb-1">3. ダンジョンの探索 map</h4>
                <p>枝分かれしたマップを進んでください。通常の戦闘のほか、「イベントでの秘法取引」「闇のよろず屋での不要ルーンの削除」「休息所でのカード強化」など、様々な選択が待ち受けています。</p>
              </div>

              <div>
                <h4 className="font-bold text-emerald-400 text-xs tracking-widest uppercase mb-1">4. 遺物（レリック）</h4>
                <p>エリートモンスターの撃破、または宝箱から獲得できるレリックは、持っているだけで戦闘の1ターン目のドローを増やしたり、ターン開始時の筋力を恒久的にアップする超強力なパッシブ効果を発揮します。</p>
              </div>
            </div>

            <div className="mt-8 text-right" id="howto-footer">
              <button
                onClick={() => setShowHowToModal(false)}
                className="bg-zinc-805 bg-zinc-800 hover:bg-zinc-700 font-bold px-6 py-2.5 rounded-xl cursor-pointer text-xs"
                id="btn-close-howto"
              >
                了解しました
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
