import React from 'react';
import { CardTemplate } from '../types';
import { X, Shield, Swords, Sparkles } from 'lucide-react';

interface DeckScreenProps {
  deck: CardTemplate[];
  onClose: () => void;
}

export default function DeckScreen({ deck, onClose }: DeckScreenProps) {
  
  // Categorize
  const attacksCount = deck.filter(c => c.type === 'ATTACK').length;
  const skillsCount = deck.filter(c => c.type === 'SKILL').length;
  const powersCount = deck.filter(c => c.type === 'POWER').length;

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'RARE':
        return 'bg-gradient-to-br from-amber-950 to-zinc-900 border-amber-500 shadow-amber-900/30 text-amber-200';
      case 'UNCOMMON':
        return 'bg-gradient-to-br from-purple-950 to-zinc-900 border-purple-500 shadow-purple-950/20 text-purple-200';
      default:
        return 'bg-gradient-to-br from-zinc-900 to-zinc-900 border-zinc-700 text-zinc-100';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'RARE':
        return <span className="bg-amber-400 text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded font-mono">RARE</span>;
      case 'UNCOMMON':
        return <span className="bg-purple-500 text-white font-semibold text-[9px] px-1.5 py-0.5 rounded font-mono">UNCOMMON</span>;
      default:
        return <span className="bg-zinc-600 text-zinc-100 text-[9px] px-1.5 py-0.5 rounded font-mono">COMMON</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ATTACK':
        return <Swords className="w-4.5 h-4.5 text-rose-400" />;
      case 'SKILL':
        return <Shield className="w-4.5 h-4.5 text-blue-400" />;
      case 'POWER':
        return <Sparkles className="w-4.5 h-4.5 text-amber-300" />;
    }
  };

  const getTypeJP = (type: string) => {
    switch (type) {
      case 'ATTACK': return 'アタック';
      case 'SKILL': return 'スキル';
      case 'POWER': return 'パワー';
      default: return 'その他';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-start items-center p-4 md:p-8 text-zinc-100" id="deck-view-overlay">
      {/* Top bar */}
      <div className="w-full max-w-5xl flex justify-between items-center pb-4 border-b border-zinc-800 mb-6" id="deck-view-header">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide" id="deck-title">登録ルーンデッキ</h2>
          <p className="text-xs text-zinc-400 mt-1" id="deck-stats">
            総カード数: <span className="text-emerald-400 font-bold font-mono text-sm">{deck.length} 枚</span> 
            （アタック: <span className="text-rose-400 font-mono font-bold">{attacksCount}</span> | 
            スキル: <span className="text-blue-400 font-mono font-bold">{skillsCount}</span> | 
            パワー: <span className="text-amber-300 font-mono font-bold">{powersCount}</span>）
          </p>
        </div>

        <button 
          onClick={onClose}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 hover:text-white p-2.5 rounded-full transition-all cursor-pointer border border-zinc-700"
          id="btn-close-deck-view"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Cards List Grid */}
      <div className="w-full max-w-5xl flex-1 overflow-y-auto pr-2" id="deck-cards-scroll">
        {deck.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-zinc-500" id="deck-empty-state">
            <p>デッキにカードが入っていません。闇のよろず屋、または戦闘後に獲得してください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" id="deck-cards-grid">
            {deck.map((card, idx) => (
              <div 
                key={`${card.id}-${idx}`}
                className={`
                  ${getRarityStyle(card.rarity)}
                  flex flex-col h-48 rounded-xl p-3.5 border-2 shadow-lg relative overflow-hidden transition-all duration-300 select-none
                `}
                id={`deck-card-${card.id}-${idx}`}
              >
                {/* Cost Core badge */}
                <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-700 font-mono text-xs font-black flex items-center justify-center text-amber-400 shadow-md">
                  {card.cost}
                </div>

                {/* Card Type symbol */}
                <div className="absolute top-2.5 right-2.5 opacity-80">
                  {getTypeIcon(card.type)}
                </div>

                {/* Main Content Info */}
                <div className="flex-1 flex flex-col justify-between pt-8">
                  <div>
                    <h4 className="font-bold text-sm tracking-tight text-white mb-1 truncate">
                      {card.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400 tracking-wider font-mono">
                      {getTypeJP(card.type)}
                    </span>
                  </div>

                  {/* Description Box */}
                  <div className="my-2 p-1.5 rounded bg-black/40 border border-zinc-800/40 text-[10px] text-zinc-300 leading-snug overflow-y-auto max-h-[70px]">
                    {card.description}
                  </div>

                  {/* Rarity and footer */}
                  <div className="flex justify-between items-center mt-auto pt-1">
                    {getRarityBadge(card.rarity)}
                  </div>
                </div>

                {/* Ambient glow decoration on the side */}
                {card.rarity === 'RARE' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
                )}
                {card.rarity === 'UNCOMMON' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick closing footer helper */}
      <div className="w-full max-w-5xl text-center text-zinc-600 text-xs mt-6 pt-3 border-t border-zinc-900" id="deck-footer-hint">
        カードはゲーム中の「イベント」や「闇のよろず屋（ショップ）」、または「休息キャンプ」での削除機能で変動させることができます。
      </div>
    </div>
  );
}
