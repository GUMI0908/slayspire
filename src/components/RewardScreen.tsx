import React, { useState } from 'react';
import { CardTemplate, Relic, PlayerStatus } from '../types';
import { Coins, Swords, Shield, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RewardScreenProps {
  playerStatus: PlayerStatus;
  goldQuantity: number;
  relicDrop: Relic | null;
  cardSelection: CardTemplate[];
  onClaimGold: () => void;
  onClaimRelic: (relic: Relic) => void;
  onClaimCard: (card: CardTemplate) => void;
  onProceed: () => void;
}

export default function RewardScreen({
  playerStatus,
  goldQuantity,
  relicDrop,
  cardSelection,
  onClaimGold,
  onClaimRelic,
  onClaimCard,
  onProceed,
}: RewardScreenProps) {
  
  const [claimedGold, setClaimedGold] = useState(false);
  const [claimedRelic, setClaimedRelic] = useState(false);
  const [claimedCard, setClaimedCard] = useState(false);

  const handleGoldClick = () => {
    if (claimedGold) return;
    onClaimGold();
    setClaimedGold(true);
  };

  const handleRelicClick = () => {
    if (claimedRelic || !relicDrop) return;
    onClaimRelic(relicDrop);
    setClaimedRelic(true);
  };

  const handleCardClick = (card: CardTemplate) => {
    if (claimedCard) return;
    onClaimCard(card);
    setClaimedCard(true);
  };

  const hasAllClaimed = claimedCard || cardSelection.length === 0;

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

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans p-6 justify-center items-center" id="reward-screen">
      
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="reward-box">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Title Header */}
        <div className="text-center pb-6 border-b border-zinc-800/80 mb-6" id="reward-lead">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-3" id="reward-crown">
            <Gift className="w-7 h-7 animate-bounce" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide uppercase">戦闘勝利報酬 (Battle Rewards)</h2>
          <p className="text-xs text-zinc-400 mt-1">ダンジョンの魔物から獲得した戦利品を選択してください。</p>
        </div>

        {/* Interactive pickups inventory */}
        <div className="flex flex-col gap-3 mb-8" id="rewards-pickup-list">
          
          {/* GOLD ROW */}
          <button
            onClick={handleGoldClick}
            disabled={claimedGold}
            className={`
              w-full flex justify-between items-center px-5 py-4 rounded-xl border transition-all cursor-pointer
              ${claimedGold 
                ? 'bg-zinc-950 border-zinc-805 opacity-50 cursor-not-allowed text-zinc-600' 
                : 'bg-zinc-800/60 border-zinc-700 hover:border-amber-400/80 hover:bg-zinc-800'
              }
            `}
            id="pickup-gold-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-zinc-200">きらめく金貨袋</span>
                <span className="block text-[10px] text-zinc-500">お買い物やルーン削除で使用されます</span>
              </div>
            </div>

            <div className="font-mono font-black text-amber-400 flex items-center gap-1">
              {claimedGold ? (
                <span className="text-zinc-500 text-xs">獲得済み</span>
              ) : (
                <>
                  <span>+{goldQuantity}</span>
                  <span className="text-[10px] text-zinc-500">G</span>
                </>
              )}
            </div>
          </button>

          {/* RELIC ROW (Optional if dropped) */}
          {relicDrop && (
            <button
              onClick={handleRelicClick}
              disabled={claimedRelic}
              className={`
                w-full flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border transition-all cursor-pointer gap-4
                ${claimedRelic 
                  ? 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed text-zinc-650' 
                  : 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-950/30 shadow-lg shadow-indigo-950/20'
                }
              `}
              id="pickup-relic-btn"
            >
              <div className="flex items-start gap-3.5 text-left w-full h-full">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow shrink-0">
                  <Gift className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-extrabold block mb-0.5">秘宝（レリック）獲得!</span>
                  <h4 className="text-sm font-black text-zinc-100 flex items-center gap-2">
                    {relicDrop.name}
                  </h4>
                  <div className="mt-1.5 px-2.5 py-1 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-[11px] font-semibold text-indigo-200 inline-block">
                    能力効果: {relicDrop.description}
                  </div>
                </div>
              </div>

              <div className="font-mono text-indigo-300 text-[10px] font-bold shrink-0 bg-indigo-950/80 px-3 py-1.5 rounded-lg border border-indigo-500/30 self-stretch sm:self-auto text-center" id="pickup-relic-action-indicator">
                {claimedRelic ? '獲得・装着済み' : 'タップして装着する'}
              </div>
            </button>
          )}

        </div>

        {/* Dynamic Card Draft Selection */}
        {!claimedCard && cardSelection.length > 0 && (
          <div className="border-t border-zinc-800/65 pt-6" id="cards-draft-offer">
            <h3 className="text-sm font-bold text-zinc-400 tracking-wider mb-4 text-center">
              魔力同調：いずれかのルーンを1枚選択してデッキに加える：
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="cards-draft-options">
              {cardSelection.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`
                    ${getRarityStyle(card.rarity)}
                    border-2 rounded-xl p-3.5 flex flex-col justify-between text-left h-44 relative shadow-lg cursor-pointer hover:scale-103 duration-200 transition-all
                  `}
                  id={`draft-card-btn-${card.id}`}
                >
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 text-[9px] font-mono font-black text-amber-500 flex items-center justify-center">
                    {card.cost}
                  </div>

                  <div className="pt-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-xs text-white leading-tight truncate">{card.name}</h4>
                      <span className="text-[8px] text-zinc-400 uppercase tracking-widest font-mono block mt-0.5">{card.type}</span>
                    </div>

                    <p className="my-1.5 p-1 bg-black/40 rounded border border-zinc-800/30 text-[9px] leading-snug text-zinc-300 overflow-y-auto max-h-[50px]">
                      {card.description}
                    </p>

                    <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-auto font-bold">
                      {card.rarity}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Skip Draft action */}
            <div className="text-center mt-4" id="skip-draft-panel">
              <button
                onClick={() => setClaimedCard(true)}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-medium hover:underline cursor-pointer"
                id="btn-skip-card-draft"
              >
                ルーン獲得をスキップする (Skip)
              </button>
            </div>
          </div>
        )}

        {/* Claim status check box to continue map */}
        {hasAllClaimed && (
          <div className="text-center border-t border-zinc-800/80 pt-6 animate-fadeIn" id="proceed-panel">
            <button
              onClick={onProceed}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-black px-8 py-3.5 rounded-xl shadow-xl shadow-teal-950/20 cursor-pointer text-xs uppercase tracking-widest border border-teal-300"
              id="btn-reward-proceed"
            >
              <span>次の階層へ進む (Proceed)</span>
              <ArrowRight className="w-4 h-4 text-zinc-900" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
