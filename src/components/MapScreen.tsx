import React, { useState, useEffect, useRef } from 'react';
import { MapNode, NodeType, PlayerStatus } from '../types';
import { 
  Swords, 
  HelpCircle, 
  Coins, 
  Flame, 
  Gift, 
  Skull, 
  Crown,
  Heart,
  ChevronRight,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';

interface MapScreenProps {
  playerStatus: PlayerStatus;
  mapNodes: MapNode[];
  currentNodeId: string | null;
  onSelectNode: (node: MapNode) => void;
  onOpenDeckView: () => void;
  onRestartGame?: () => void;
  isPreview?: boolean;
  onClosePreview?: () => void;
}

export default function MapScreen({
  playerStatus,
  mapNodes,
  currentNodeId,
  onSelectNode,
  onOpenDeckView,
  onRestartGame,
  isPreview = false,
  onClosePreview,
}: MapScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeNodeRef = useRef<HTMLButtonElement>(null);

  // Drag to scroll state tracking
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTopState, setScrollTopState] = useState(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggedDistanceRef = useRef(0);
  const [isConfirmingRestart, setIsConfirmingRestart] = useState(false);

  // Group nodes by floor so we can render floor rows
  // To avoid flex-col-reverse scrolling quirks inside iframe containers, we sort them descending
  const floorsDesc = Array.from(new Set(mapNodes.map(n => n.floor))).sort((a, b) => b - a);

  // Auto scroll to active node on mount or changing node
  useEffect(() => {
    if (activeNodeRef.current && containerRef.current) {
      const activeEl = activeNodeRef.current;
      const containerEl = containerRef.current;
      const topPos = activeEl.offsetTop - (containerEl.clientHeight / 2) + (activeEl.clientHeight / 2);
      containerEl.scrollTo({ top: topPos, behavior: 'smooth' });
    } else if (containerRef.current) {
      // Game start: scroll container to the very bottom (where Floor 1 is situated)
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentNodeId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // Only detect drag when left clicking
    if (e.button !== 0) return;
    setIsDragging(true);
    startXRef.current = e.pageX;
    startYRef.current = e.pageY;
    draggedDistanceRef.current = 0;
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollTopState(containerRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dist = Math.sqrt(
      Math.pow(e.pageX - startXRef.current, 2) + 
      Math.pow(e.pageY - startYRef.current, 2)
    );
    draggedDistanceRef.current = dist;

    // Prevent highlighting page elements during dragging
    e.preventDefault();
    const y = e.pageY - containerRef.current.offsetTop;
    const walk = (y - startY) * 1.5; // Drag sensitivity multiplier
    containerRef.current.scrollTop = scrollTopState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleNodeClick = (node: MapNode) => {
    // If the movement was tiny, it was a real intent to click the node rather than pan the map
    if (draggedDistanceRef.current < 8) {
      onSelectNode(node);
    }
  };
  
  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'COMBAT':
        return <Swords className="w-5 h-5 text-rose-400" id={`icon-combat`} />;
      case 'ELITE':
        return <Skull className="w-5 h-5 text-red-500" id={`icon-elite`} />;
      case 'SHOP':
        return <Coins className="w-5 h-5 text-amber-400" id={`icon-shop`} />;
      case 'EVENT':
        return <HelpCircle className="w-5 h-5 text-purple-400" id={`icon-event`} />;
      case 'REST':
        return <Flame className="w-5 h-5 text-orange-500 animate-pulse" id={`icon-rest`} />;
      case 'TREASURE':
        return <Gift className="w-5 h-5 text-blue-400" id={`icon-treasure`} />;
      case 'BOSS':
        return <Crown className="w-6 h-6 text-yellow-400 animate-bounce" id={`icon-boss`} />;
      default:
        return <HelpCircle className="w-5 h-5 text-zinc-400" id={`icon-default`} />;
    }
  };

  const getNodeNameJP = (type: NodeType) => {
    switch (type) {
      case 'COMBAT': return '通常戦闘';
      case 'ELITE': return 'エリート魔獣';
      case 'SHOP': return '闇のよろず屋';
      case 'EVENT': return '不可思議な遭遇';
      case 'REST': return 'ルーンキャンプ';
      case 'TREASURE': return '封印された宝箱';
      case 'BOSS': return '深淵の支配者';
    }
  };

  // Check if a node is selectable
  // The player can select a node on floor F + 1 if F is their current floor and there's a link,
  // or if current floor is 0 (game start) and they click on Floor 1.
  const isNodeSelectable = (node: MapNode) => {
    if (isPreview) return false; // Disable any node selection in preview mode
    if (node.completed) return false;
    
    // Game start, only floor 1 nodes are selectable
    if (currentNodeId === null) {
      return node.floor === 1;
    }

    const currentNode = mapNodes.find(n => n.id === currentNodeId);
    if (!currentNode) return false;

    // Node must be exactly 1 floor higher and connected
    return node.floor === currentNode.floor + 1 && currentNode.connectedTo.includes(node.id);
  };

  // Helper to get nodes on a specific floor
  const getNodesForFloor = (floorNum: number) => {
    return mapNodes.filter(n => n.floor === floorNum).sort((a, b) => a.lane - b.lane);
  };

  const playerCurrentNode = currentNodeId ? mapNodes.find(n => n.id === currentNodeId) : null;
  const currentFloorLevel = playerCurrentNode ? playerCurrentNode.floor : 0;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans" id="map-screen">
      {/* Top Header Panel Status */}
      <header className="flex justify-between items-center bg-zinc-900 px-6 py-4 border-b border-zinc-800 shadow-lg" id="map-header">
        <div className="flex items-center gap-6" id="player-profile-bar">
          <div className="flex items-center gap-2" id="hp-indicator">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-mono text-lg font-bold">
              {playerStatus.hp} <span className="text-xs text-zinc-500">/ {playerStatus.maxHp} HP</span>
            </span>
            <div className="w-24 bg-zinc-800 h-2 rounded-full overflow-hidden ml-1">
              <div 
                className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
                style={{ width: `${(playerStatus.hp / playerStatus.maxHp) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-mono" id="gold-indicator">
            <Coins className="w-5 h-5" />
            <span className="text-lg font-bold">{playerStatus.gold}</span>
            <span className="text-xs text-zinc-500">G</span>
          </div>

          <div className="text-zinc-400 text-sm hidden sm:block" id="floor-indicator">
            階層: <span className="text-white font-bold font-mono">Floor {currentFloorLevel}</span> / 9
          </div>
        </div>

        <div className="flex items-center gap-3" id="active-tools">
          {isPreview && onClosePreview && (
            <button
              onClick={onClosePreview}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold px-3 py-2 rounded-lg transition-all cursor-pointer text-xs shadow-lg shadow-purple-950/20"
              id="btn-close-map-preview"
            >
              <span>◀ 戦闘画面に戻る</span>
            </button>
          )}

          {!isPreview && onRestartGame && (
            <div className="relative flex items-center" id="restart-flow-wrapper">
              {!isConfirmingRestart ? (
                <button
                  onClick={() => setIsConfirmingRestart(true)}
                  className="flex items-center gap-1.5 bg-zinc-900/80 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 text-zinc-400 border border-zinc-800 rounded-lg px-3 py-2 transition-all cursor-pointer text-xs font-semibold"
                  id="btn-restart-game-trigger"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>最初からやり直す</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-red-900/60 rounded-lg p-1 text-xs shadow-xl animate-fade-in" id="restart-confirm-box">
                  <span className="text-[10px] text-red-400 px-2 font-bold select-none">本当によろしいですか？</span>
                  <button
                    onClick={() => {
                      onRestartGame();
                      setIsConfirmingRestart(false);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer transition-colors"
                    id="btn-restart-confirm"
                  >
                    はい
                  </button>
                  <button
                    onClick={() => setIsConfirmingRestart(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-[10px] px-2 py-1 rounded cursor-pointer transition-colors"
                    id="btn-restart-cancel"
                  >
                    いいえ
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onOpenDeckView}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg px-4 py-2 transition-all cursor-pointer text-sm"
            id="btn-check-deck"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>所持デッキ</span>
          </button>
        </div>
      </header>

      {/* Relics Row */}
      {playerStatus.relics.length > 0 && (
        <div className="bg-zinc-900/50 border-b border-zinc-800/60 px-6 py-2 flex items-center gap-3" id="relics-dock">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">所持遺物 (Relics):</span>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {playerStatus.relics.map(relic => (
              <div 
                key={relic.id} 
                className="group relative flex items-center gap-1.5 bg-zinc-800/80 border border-zinc-700/50 px-2.5 py-1 rounded-md text-xs hover:border-amber-500/60 transition-all"
                id={`relic-${relic.id}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-zinc-200 font-medium">{relic.name}</span>
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-56 p-2 bg-black border border-zinc-700 rounded-md shadow-xl z-50 text-[11px] leading-relaxed select-none">
                  <p className="font-bold text-amber-400 mb-1">{relic.name}</p>
                  <p className="text-zinc-300">{relic.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Scrolling Container */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="flex-1 overflow-y-auto px-4 py-8 flex justify-center items-stretch cursor-grab active:cursor-grabbing select-none" 
        id="scrollable-map-container" 
        style={{ minHeight: '400px' }}
      >
        <div className="w-full max-w-lg flex flex-col gap-8 relative pb-20" id="map-tree">
          
          {/* Loop floors backward so the Boss is at the top of the map view */}
          {floorsDesc.map((floorNum) => {
            const nodes = getNodesForFloor(floorNum);
            const isRowSelectable = nodes.some(isNodeSelectable);

            return (
              <div key={floorNum} className="relative flex flex-col items-center py-2" id={`floor-row-${floorNum}`}>
                <div className="absolute left-0 -top-1/2 -bottom-1/2 flex items-center" id="floor-index-badge">
                  <span className="font-mono text-[10px] text-zinc-600/80 tracking-widest uppercase origin-left rotate-90 sm:rotate-0 block">FLOOR {floorNum}</span>
                </div>

                {/* Nodes on this floor row */}
                <div className="flex justify-around w-full max-w-sm gap-4" id={`nodes-row-${floorNum}`}>
                  {nodes.map(node => {
                    const active = currentNodeId === node.id;
                    const selectable = isNodeSelectable(node);
                    const visited = node.completed;
                    
                    // Already completed nodes on the map must not trigger any further action, 
                    // even if they are active (where the player currently stands).
                    const clickable = (selectable || active) && !visited && !isPreview;
                    
                    return (
                      <motion.button
                        key={node.id}
                        ref={active ? activeNodeRef : null}
                        onClick={() => clickable && handleNodeClick(node)}
                        disabled={!clickable}
                        whileHover={clickable ? { scale: 1.15 } : {}}
                        whileTap={clickable ? { scale: 0.95 } : {}}
                        className={`
                          relative z-10 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 shadow-md transition-all
                          ${active 
                            ? visited
                              ? 'bg-zinc-900 border-emerald-800 text-emerald-500 shadow shadow-emerald-950/20 cursor-default scale-100'
                              : 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-amber-900/30 ring-4 ring-amber-500/20 scale-110 cursor-pointer' 
                            : selectable
                            ? 'bg-zinc-800 border-zinc-300 text-white hover:bg-zinc-700 hover:border-amber-400 cursor-pointer shadow-lg shadow-black/80'
                            : visited
                            ? 'bg-zinc-950 border-emerald-950 text-emerald-600 opacity-60 cursor-default'
                            : 'bg-zinc-900/80 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-45'
                          }
                        `}
                        id={`map-node-${node.id}`}
                      >
                        {/* Node Type Mini Visual */}
                        <div className="relative">
                          {getNodeIcon(node.type)}
                          {active && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide font-mono uppercase shadow-lg select-none whitespace-nowrap">
                              現在地
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay Node Type Description */}
                        {selectable && (
                          <span className="absolute -bottom-8 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded shadow-lg pointer-events-none select-none z-50 whitespace-nowrap opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                            {getNodeNameJP(node.type)}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Start visual marker at the absolute bottom */}
          <div className="flex flex-col items-center pt-2 text-zinc-600 border-t border-zinc-900/40 mt-2" id="map-introduction">
            <span className="text-xs uppercase tracking-widest font-mono">Dungeon Entrance</span>
            <ChevronRight className="w-4 h-4 translate-y-1 rotate-90" />
          </div>
        </div>
      </div>

      {/* Simple instructions for user convenience */}
      <footer className="bg-zinc-900/40 border-t border-zinc-900/80 px-6 py-4 flex justify-between items-center text-xs text-zinc-500" id="map-footer">
        <span>接続されている、輝いているノードをクリックして前に進みましょう。</span>
        <span>階層9のボスを討伐すると大勝利となります。</span>
      </footer>
    </div>
  );
}
