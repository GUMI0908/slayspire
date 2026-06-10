import React, { useState } from 'react';
import { CardTemplate, Relic, PlayerStatus } from '../types';
import { CARD_POOL, RELIC_POOL } from '../data';
import { Coins, Flame, Gem, Trash2, ArrowRight } from 'lucide-react';

interface ShopScreenProps {
  playerStatus: PlayerStatus;
  playerDeck: CardTemplate[];
  onBuyCard: (card: CardTemplate, price: number) => void;
  onBuyRelic: (relic: Relic, price: number) => void;
  onRemoveCard: (index: number, price: number) => void;
  onLeave: () => void;
}

export default function ShopScreen({
  playerStatus,
  playerDeck,
  onBuyCard,
  onBuyRelic,
  onRemoveCard,
  onLeave,
}: ShopScreenProps) {
  
  // Initialize shop items if not already cached (we can also maintain them in parent state, 
  // or simple state initialized once here is perfect)
  const [shopCards, setShopCards] = useState<CardTemplate[]>(() => {
    // Select 4 random purchasable cards
    const buyables = CARD_POOL.filter(c => c.purchasable);
    const shuffled = [...buyables].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  });

  const [shopRelics, setShopRelics] = useState<Array<{ relic: Relic; price: number; purchased: boolean }>>(() => {
    // Select 2 random relics
    const shuffled = [...RELIC_POOL].sort(() => 0.5 - Math.random());
    return [
      { relic: shuffled[0], price: 140, purchased: false },
      { relic: shuffled[1], price: 180, purchased: false },
    ];
  });

  const [hasRemovedCard, setHasRemovedCard] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);

  const removeFee = 75;

  const handleCardPurchase = (card: CardTemplate, index: number) => {
    const price = card.price || 50;
    if (playerStatus.gold < price) {
      alert('ゴールドが不足しています！');
      return;
    }
    // Buy card
    onBuyCard(card, price);
    // Remove from shop shelf
    setShopCards(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleRelicPurchase = (relicIdx: number) => {
    const item = shopRelics[relicIdx];
    if (playerStatus.gold < item.price) {
      alert('ゴールドが不足しています！');
      return;
    }
    if (playerStatus.relics.some(r => r.id === item.relic.id)) {
      alert('すでにこの遺物を持っています！');
      return;
    }
    // Buy relic
    onBuyRelic(item.relic, item.price);
    // Mark as purchased
    setShopRelics(prev => prev.map((it, idx) => idx === relicIdx ? { ...it, purchased: true } : it));
  };

  const handleRemoveCardService = (cardIdx: number) => {
    if (playerStatus.gold < removeFee) {
      alert('ゴールドが不足しています！');
      return;
    }
    onRemoveCard(cardIdx, removeFee);
    setHasRemovedCard(true);
    setShowRemovalModal(false);
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'RARE': return 'from-amber-950/80 to-zinc-900 border-amber-500';
      case 'UNCOMMON': return 'from-purple-950/80 to-zinc-900 border-purple-500';
      default: return 'from-zinc-900/80 to-zinc-900 border-zinc-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans" id="shop-screen">
      {/* Top Header Panel Status */}
      <header className="flex justify-between items-center bg-zinc-900 px-6 py-4 border-b border-zinc-800 shadow-lg" id="shop-header">
        <div className="flex items-center gap-6" id="shop-header-status">
          <div className="text-zinc-400 font-mono text-sm uppercase tracking-wider">
            闇のよろず屋ショップ <span className="text-white font-black">🏢 Merchant Shop</span>
          </div>

          <div className="flex items-center gap-2 text-amber-400 font-mono" id="shop-gold-indicator">
            <Coins className="w-5 h-5" />
            <span className="text-lg font-bold">{playerStatus.gold}</span>
            <span className="text-xs text-zinc-500">G</span>
          </div>
        </div>

        <button
          onClick={onLeave}
          className="flex items-center gap-2 bg-rose-900 hover:bg-rose-800 text-white font-bold px-5 py-2 rounded-lg cursor-pointer transition-all border border-rose-700 shadow-lg shadow-black/40 text-sm"
          id="btn-leave-shop"
        >
          <span>ダンジョンへ戻る</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full" id="shop-body">
        
        {/* Left column Merchant Avatar & Speech bubble */}
        <div className="flex-1 lg:max-w-xs flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6" id="shop-merchant">
          <div className="w-24 h-24 rounded-full bg-indigo-950 border-2 border-indigo-400/30 flex items-center justify-center text-4xl shadow-xl animate-bounce select-none" id="merchant-avatar">
            🧙‍♂️
          </div>
          <h3 className="text-base font-extrabold text-indigo-400 mt-4">よろず屋の黒魔術師</h3>
          <p className="text-xs text-zinc-500 font-mono mt-1">「金さえ出せば何でも売るぞ」</p>

          <div className="mt-6 bg-zinc-900 border border-zinc-800 p-4 rounded-xl leading-relaxed text-xs text-zinc-300 relative" id="speech-bubble">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-t border-l border-zinc-800 rotate-45" />
            <p className="font-medium text-indigo-300 mb-1">本日の特選ショップ言霊：</p>
            「奥の強敵（ボス）に備えて『毒（Poison）』や『筋力（Strength）』を付与するルーンを手に入れておくと良い。あと、お荷物な基本カードを削除してデッキを10枚以下に絞るのも一興だ。」
          </div>

          {/* Remove Card Service Container directly inside shop */}
          <div className="w-full mt-6 border-t border-zinc-800 pt-6" id="card-removal-service">
            <h4 className="text-xs font-bold text-zinc-400 mb-3 tracking-widest uppercase">ルーン浄化サービス (カード削除)</h4>
            {hasRemovedCard ? (
              <div className="bg-zinc-950/80 border border-zinc-900 text-center py-4 rounded-xl text-xs text-zinc-500" id="removal-done">
                売り切れ (1回/ショップ)
              </div>
            ) : (
              <button
                onClick={() => setShowRemovalModal(true)}
                className="w-full flex items-center justify-between bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 px-4 py-3 rounded-xl transition-all text-xs cursor-pointer text-zinc-200"
                id="btn-remove-card-service"
              >
                <span className="flex items-center gap-1.5 font-semibold text-rose-300">
                  <Trash2 className="w-4 h-4" />
                  不要カードの廃棄
                </span>
                <span className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  {removeFee}G
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right column items grid */}
        <div className="flex-3 flex flex-col gap-8" id="shop-shelves">
          {/* Card section */}
          <div id="shop-cards">
            <h3 className="text-sm font-bold text-zinc-400 tracking-wider mb-4 border-b border-zinc-900 pb-2">特別販売スペル・カード (Lune Cards)</h3>
            
            {shopCards.length === 0 ? (
              <div className="bg-zinc-950/40 text-center py-12 rounded-xl text-xs text-zinc-500 border border-zinc-900/60" id="shop-cards-soldout">
                すべてのカードが購入されました。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="shop-cards-shelf">
                {shopCards.map((card, idx) => {
                  const price = card.price || 50;
                  const canAfford = playerStatus.gold >= price;
                  
                  return (
                    <div 
                      key={card.id + idx}
                      className={`
                        bg-gradient-to-br ${getRarityBg(card.rarity)}
                        border-2 rounded-xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 h-40
                      `}
                      id={`shop-item-card-${card.id}`}
                    >
                      {/* Cost */}
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-800 font-mono text-xs font-black flex items-center justify-center text-amber-500">
                        {card.cost}
                      </div>

                      {/* Header info */}
                      <div className="pl-6" id="shop-card-main-info">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-[15px] text-white tracking-tight">{card.name}</h4>
                          <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 tracking-wide font-mono uppercase">
                            {card.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-snug mt-1.5 pr-2">
                          {card.description}
                        </p>
                      </div>

                      {/* Purchase line */}
                      <div className="mt-auto flex justify-between items-center pt-2 border-t border-zinc-800/40" id="shop-card-action-bar">
                        <span className="text-[10px] text-amber-400 font-mono font-bold tracking-widest">{card.rarity}</span>
                        
                        <button
                          onClick={() => handleCardPurchase(card, idx)}
                          disabled={!canAfford}
                          className={`
                            flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                            ${canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-950/20'
                              : 'bg-zinc-950 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                            }
                          `}
                          id={`buy-card-${card.id}`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{price} G</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Relics section */}
          <div id="shop-relics">
            <h3 className="text-sm font-bold text-zinc-400 tracking-wider mb-4 border-b border-zinc-900 pb-2">秘宝・レリック (Relics)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="shop-relics-shelf">
              {shopRelics.map((item, idx) => {
                const canAfford = playerStatus.gold >= item.price;
                const alreadyOwned = playerStatus.relics.some(r => r.id === item.relic.id);
                
                return (
                  <div 
                    key={item.relic.id}
                    className={`
                      border rounded-2xl p-4.5 flex flex-col justify-between shadow-lg relative bg-zinc-900/50 min-h-[190px]
                      ${item.purchased || alreadyOwned ? 'border-zinc-805 opacity-55' : 'border-zinc-800 hover:border-amber-550/40'}
                    `}
                    id={`shop-item-relic-${item.relic.id}`}
                  >
                    <div className="flex gap-3.5 items-start text-left w-full" id="shop-relic-card-body">
                      <div className="w-10 h-10 rounded-xl bg-amber-950/30 border border-amber-600/30 flex items-center justify-center text-amber-400 text-lg shadow shrink-0">
                        <Gem className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-extrabold block mb-0.5">秘宝・レリック</span>
                        <h4 className="font-extrabold text-[14px] text-zinc-100">{item.relic.name}</h4>
                        <div className="mt-2 p-2 bg-amber-955 bg-amber-950/20 border border-amber-500/15 rounded-lg text-[10.5px] leading-relaxed text-amber-200">
                          <span className="font-bold text-amber-400 block mb-0.5 text-[9.5px] tracking-wider uppercase font-mono">効果能力:</span>
                          {item.relic.description}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end pt-2.5 border-t border-zinc-800/40" id="shop-relic-action-bar">
                      {item.purchased || alreadyOwned ? (
                        <span className="text-xs text-zinc-500 bg-zinc-950 px-3 py-1 rounded-md border border-zinc-900/80">
                          {item.purchased ? '売約済み' : '所持済み'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRelicPurchase(idx)}
                          disabled={!canAfford}
                          className={`
                            flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                            ${canAfford
                              ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-950/25'
                              : 'bg-zinc-950 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                            }
                          `}
                          id={`buy-relic-${item.relic.id}`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{item.price} G</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Card removal modal service */}
      {showRemovalModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-center items-center p-4" id="removal-modal-overlay">
          <div className="bg-zinc-900 border-2 border-zinc-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl" id="removal-modal">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5">
              <Trash2 className="text-rose-400 w-5 h-5" />
              破棄（削除）するルーンを選択
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              デッキの中から不要な基本カード（スラストやガード）を取り除き、ドローの効率を最大限まで高めます。
            </p>

            <div className="max-h-72 overflow-y-auto grid grid-cols-2 gap-2 mb-6 pr-1" id="removal-deck-grid">
              {playerDeck.map((card, idx) => (
                <button
                  key={`${card.id}-${idx}`}
                  onClick={() => handleRemoveCardService(idx)}
                  className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/50 text-left p-3 rounded-lg transition-all flex justify-between items-center group cursor-pointer"
                  id={`remove-card-item-${idx}`}
                >
                  <div>
                    <span className="font-bold text-xs text-zinc-200 group-hover:text-rose-300">{card.name}</span>
                    <span className="block text-[9px] text-zinc-500">{card.type}</span>
                  </div>
                  <Trash2 className="w-3.5 h-3.5 text-zinc-600 group-hover:text-rose-400 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3" id="removal-modal-footer">
              <button
                onClick={() => setShowRemovalModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-xs cursor-pointer"
                id="btn-cancel-removal"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
