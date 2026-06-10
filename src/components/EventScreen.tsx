import React, { useState } from 'react';
import { GameEvent, EventChoice, PlayerStatus, CardTemplate } from '../types';
import { HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

interface EventScreenProps {
  event: GameEvent;
  playerStatus: PlayerStatus;
  playerDeck: CardTemplate[];
  onChangeStatus: (status: PlayerStatus) => void;
  onChangeDeck: (deck: CardTemplate[]) => void;
  onLeave: () => void;
}

export default function EventScreen({
  event,
  playerStatus,
  playerDeck,
  onChangeStatus,
  onChangeDeck,
  onLeave,
}: EventScreenProps) {
  
  const [outcomeLog, setOutcomeLog] = useState<string | null>(null);

  const handleChoiceSelect = (choice: EventChoice) => {
    // Run action
    const { nextStatus, nextDeck, logText } = choice.action(playerStatus, playerDeck);
    
    // Update state via callback
    onChangeStatus(nextStatus);
    if (nextDeck && nextDeck.length > 0) {
      onChangeDeck(nextDeck);
    }
    
    // Set the decision final result log
    setOutcomeLog(logText);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans p-6" id="event-screen">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-6" id="event-container">
        
        {/* Card Header Container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden" id="event-card">
          
          {/* Backdrop decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6" id="event-badge">
            <HelpCircle className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide border-b border-zinc-800 pb-3" id="event-title">
            {event.title}
          </h2>

          {/* Outcome Log View or Initial Story choices list */}
          {outcomeLog === null ? (
            <>
              {/* Event lore description */}
              <p className="text-sm font-medium leading-relaxed text-zinc-300 mt-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-900 mb-8" id="event-lore-desc">
                {event.description}
              </p>

              {/* Grid or List of choices */}
              <div className="flex flex-col gap-3" id="choice-buttons-list">
                {event.choices.map((choice, idx) => {
                  const allowed = choice.requirement ? choice.requirement(playerStatus) : true;

                  return (
                    <button
                      key={idx}
                      disabled={!allowed}
                      onClick={() => handleChoiceSelect(choice)}
                      className={`
                        w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex flex-col gap-3 cursor-pointer group
                        ${allowed
                          ? 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-purple-500 hover:shadow-lg'
                          : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                        }
                      `}
                      id={`event-choice-btn-${idx}`}
                    >
                      <div className="flex items-start justify-between gap-4 w-full">
                        <div className="flex-1">
                          <span className={`text-xs font-bold font-mono tracking-widest ${allowed ? 'text-purple-300' : 'text-zinc-600'}`}>
                            選択肢 {idx + 1}
                          </span>
                          <h4 className={`text-sm sm:text-base font-bold mt-1 group-hover:text-white ${allowed ? 'text-zinc-200' : 'text-zinc-500'}`}>
                            {choice.text}
                          </h4>
                        </div>
                        {allowed && (
                          <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0 self-center" />
                        )}
                      </div>

                      <div className="w-full flex flex-col" id="choice-outlines">
                        <span className={`text-xs leading-relaxed px-3 py-1.5 rounded-lg bg-black/60 border ${allowed ? 'text-amber-300 border-amber-500/10' : 'text-zinc-600 border-zinc-900/60'}`}>
                          {choice.effectText}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mt-4 flex flex-col items-center" id="outcome-log-container">
              <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-scaleIn">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-emerald-400 mb-2">結果判明 (Outcome Decision)</h3>
              
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl text-xs sm:text-sm text-zinc-300 leading-relaxed text-center w-full mb-8">
                {outcomeLog}
              </div>

              <button
                onClick={onLeave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-indigo-900/30 font-sans cursor-pointer transition-all border border-indigo-500"
                id="btn-confirm-event-leave"
              >
                探索を続ける
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
