import React, { useState } from 'react';
import { PlayerStatus, CardTemplate } from '../types';
import { Flame, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface RestScreenProps {
  playerStatus: PlayerStatus;
  playerDeck: CardTemplate[];
  onChangeStatus: (status: PlayerStatus) => void;
  onChangeDeck: (deck: CardTemplate[]) => void;
  onLeave: () => void;
}

export default function RestScreen({
  playerStatus,
  playerDeck,
  onChangeStatus,
  onChangeDeck,
  onLeave,
}: RestScreenProps) {
  
  const [rested, setRested] = useState(false);
  const [outcomeLog, setOutcomeLog] = useState<string | null>(null);

  const handleRestOption = () => {
    // 30% standard rest heal. Life fountain gives +15% boost, total 45%
    const boost = playerStatus.relics.some(r => r.id === 'life_fountain') ? 0.45 : 0.30;
    const healAmount = Math.floor(playerStatus.maxHp * boost);
    const nextHp = Math.min(playerStatus.maxHp, playerStatus.hp + healAmount);

    onChangeStatus({
      ...playerStatus,
      hp: nextHp,
    });

    setRested(true);
    setOutcomeLog(`🔥 焚き火の傍らで熟睡し、旅の傷を癒やしました。（HPを ${healAmount} 回復。現在 HP: ${nextHp}/${playerStatus.maxHp}）`);
  };

  const handleSmithOption = () => {
    // Smithing upgrades first standard strike or defense card to a plus version (+3 bonus)
    // Find a strike or defense
    let tempDeck = [...playerDeck];
    const indexToUpgrade = tempDeck.findIndex(c => (c.id === 'starter_strike' || c.id === 'starter_defend') && !c.name.includes('+'));

    if (indexToUpgrade !== -1) {
      const original = tempDeck[indexToUpgrade];
      const upgraded: CardTemplate = {
        ...original,
        name: original.id === 'starter_strike' ? '極ルーン・スラスト+' : '極ルーン・ウォール+',
        damage: original.damage ? original.damage + 4 : undefined,
        block: original.block ? original.block + 3 : undefined,
        description: original.id === 'starter_strike' ? '敵に 10 ダメージを与える。' : 'ブロックを 8 得る。',
      };
      tempDeck[indexToUpgrade] = upgraded;
      onChangeDeck(tempDeck);
      setRested(true);
      setOutcomeLog(`🛠️ 鍛冶台で基本ルーンを研磨し、強力にアップデートしました！（「${original.name}」が「${upgraded.name}」に進化した！）`);
    } else {
      // Find any other card
      const genericIdx = tempDeck.findIndex(c => !c.name.includes('+'));
      if (genericIdx !== -1) {
        const original = tempDeck[genericIdx];
        const upgraded: CardTemplate = {
          ...original,
          name: `${original.name}+`,
          cost: Math.max(0, original.cost - 1),
          description: `${original.description}（コストが1減少した）`,
        };
        tempDeck[genericIdx] = upgraded;
        onChangeDeck(tempDeck);
        setRested(true);
        setOutcomeLog(`🛠️ 魔力研磨機により「${original.name}」をチューンアップしました！ コストが1減少しました！（「${upgraded.name}」）`);
      } else {
        setRested(true);
        setOutcomeLog('🛠️ 強化できるカードが見つかりませんでした。代わりに武器の手入れをしました。（変化なし）');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans p-6 justify-center items-center" id="rest-camp-screen">
      
      <div className="w-full max-w-xl bg-zinc-90 w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="camp-box">
        
        {/* Animated Background particle fire */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center pb-6 border-b border-zinc-800/80 mb-6" id="camp-header">
          <div className="w-16 h-16 rounded-full bg-orange-950/40 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-3" id="camp-fire-sphere">
            <Flame className="w-8 h-8 animate-pulse text-orange-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase">ルーンキャンプ (Rest Campfire)</h2>
          <p className="text-xs text-zinc-400 mt-1">
            ダンジョンの裂け目で安らぐキャンプファイア。休息を選んで体力を満たすか、あるいはルーンの「鍛冶（アップグレード）」を行うか選択できます。
          </p>
        </div>

        {/* Display action menus or outcome decision */}
        {outcomeLog === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="camp-actions-row">
            
            {/* REST OPTION */}
            <button
              onClick={handleSmithOption}
              className="group bg-zinc-800/60 border border-zinc-700 hover:border-amber-400/85 hover:bg-zinc-800/80 p-5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between h-40"
              id="btn-rest-smith"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-amber-955 bg-zinc-950 border border-zinc-805 text-amber-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-zinc-200 group-hover:text-amber-400">ルーン鍛冶 (Upgrade Rune)</h4>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                  デッキの中の基礎カードを鍛え、ダメージやディフェンスを恒久的に底上げします。
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono mt-2">鍛合金剛 ⚒️</span>
            </button>

            {/* UPGRADE OPTION */}
            <button
              onClick={handleRestOption}
              className="group bg-zinc-800/60 border border-zinc-700 hover:border-red-400/85 hover:bg-zinc-800/80 p-5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between h-40"
              id="btn-rest-heal"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-zinc-950 border border-zinc-805 text-red-500 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </div>
                <h4 className="font-extrabold text-sm text-zinc-200 group-hover:text-red-400">焚き火で休息 (Rest Heal)</h4>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                  失われた体力を 30%（遺物により最大45%）回復し、強敵への備えを固めます。
                </p>
              </div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono mt-2">HP回復 🍷</span>
            </button>

          </div>
        ) : (
          <div className="text-center py-4" id="camp-outcome-layout">
            <h3 className="text-sm font-bold text-teal-400 mb-3 uppercase tracking-wider">活動完了 (Dungeon Activity Log)</h3>
            <div className="bg-zinc-950 border border-zinc-900/65 p-4 rounded-xl text-xs sm:text-sm text-zinc-300 leading-relaxed text-center mb-6">
              {outcomeLog}
            </div>

            <button
              onClick={onLeave}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black px-8 py-3 rounded-xl shadow-lg cursor-pointer transition-all border border-indigo-400 text-xs uppercase tracking-widest"
              id="btn-camp-leave"
            >
              <span>キャンプを去る (Depart)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
