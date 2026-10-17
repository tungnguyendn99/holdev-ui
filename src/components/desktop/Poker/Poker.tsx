'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award } from 'lucide-react';
import TodaysMission from './TodaysMission';
import './Poker.scss';

const MINDSET_GROUPS = [
  {
    key: 'mindset',
    icon: '🧠',
    title: 'Mindset Nền Tảng',
    cssClass: 'group-mindset',
    quotes: [
      '“I am not here to win today. I am here to become better over 100,000 hands.”',
      '“Profit is the scoreboard. Process is the game.”',
      '“My job is to make good decisions, not to control the outcome.”',
      '“One session means nothing. One month means little. The sample is everything.”',
      '“I don’t need to win this hand. I need to play this hand correctly.”',
      '“Variance decides short-term results. My decisions decide my long-term career.”',
      '“Judge yourself by decisions, not by results.”',
    ],
  },
  {
    key: 'winning',
    icon: '💰',
    title: 'Khi Đang WIN — Cực Kỳ Quan Trọng',
    cssClass: 'group-winning',
    quotes: [
      '“Being up is not a reason to stop.”',
      '“I don’t protect today’s profit. I build tomorrow’s edge.”',
      '“A winning session is not the goal. A good session is the goal.”',
      '“Don’t cash out mentally just because you’re winning.”',
      '“+$100 doesn’t mean my work is finished.”',
      '“I am not paid for winning one session. I am paid for playing thousands of good hands.”',
    ],
    featured: '“Winning is not permission to quit.”',
  },
  {
    key: 'losing',
    icon: '🔥',
    title: 'Khi Đang LOSING',
    cssClass: 'group-losing',
    quotes: [
      '“Losing is not a signal to grind harder.”',
      '“I don’t chase losses. I execute my process.”',
      '“The money I lost does not belong to the next hand.”',
      '“I don’t need to get even today.”',
      '“A losing session can still be a successful workday.”',
      '“My bankroll does not need emotional protection. My decision-making does.”',
    ],
    featured: '“I don’t play longer because I am losing. I play longer because it is my planned work.”',
  },
  {
    key: 'badbeat',
    icon: '🧘',
    title: 'Bad Beat / Cooler / Suckout',
    cssClass: 'group-badbeat',
    quotes: [
      '“Bad beats are the cost of playing poker.”',
      '“I cannot control the cards. I can control my response.”',
      '“This hand is over. The next decision is a new decision.”',
      '“I don’t need justice from poker.”',
      '“I don’t need to get my money back from this player.”',
      '“If the decision was +EV, I am satisfied—even when I lose.”',
    ],
    featured: '“I can lose money and still win the decision.”',
  },
  {
    key: 'agame',
    icon: '🎯',
    title: 'A-Game',
    cssClass: 'group-agame',
    quotes: [
      '“One decision at a time.”',
      '“Slow down. Observe. Think. Execute.”',
      '“Range first. Hand second.”',
      '“What is his range? What is my range? What is the best action?”',
      '“Don’t play my cards. Play the situation.”',
      '“Don’t guess. Build a range.”',
      '“Don’t react to the last hand. Analyze the current hand.”',
      '“Strong players don’t avoid difficult decisions. They make better decisions inside them.”',
    ],
  },
  {
    key: 'discipline',
    icon: '🧊',
    title: 'Discipline',
    cssClass: 'group-discipline',
    quotes: [
      '“I do what I planned, not what I feel like doing.”',
      '“Discipline is playing when I’m bored and stopping when I’m tilted.”',
      '“Consistency beats intensity.”',
      '“I don’t need motivation. I need a system.”',
      '“I don’t negotiate with my rules during a session.”',
      '“The professional version of me follows the plan.”',
      '“Small boring actions, repeated for years, create extraordinary results.”',
    ],
    featured: '“I am building a career, not chasing a session.”',
  },
  {
    key: 'volume',
    icon: '📈',
    title: 'Volume',
    cssClass: 'group-volume',
    quotes: [
      '“My edge needs a sample size.”',
      '“No volume, no data. No data, no growth.”',
      '“I cannot judge my poker career from a few sessions.”',
      '“The goal is not to maximize today’s profit. The goal is to maximize quality volume.”',
      '“100 good hands today are better than 0 hands because I was afraid of losing yesterday’s profit.”',
      '“I get paid for making decisions repeatedly.”',
    ],
    featured: '“Volume is not punishment. Volume is how my edge gets paid.”',
  },
  {
    key: 'stakeup',
    icon: '🏆',
    title: 'Leo Stake',
    cssClass: 'group-stakeup',
    quotes: [
      '“I don’t move up because I run good. I move up because my game is ready.”',
      '“My goal is not to beat NL10 forever. My goal is to become a player who can beat higher stakes.”',
      '“Every session is preparation for the next stake.”',
      '“Study like a NL20 player while playing NL10.”',
      '“Bankroll gives me permission to move up. Skill gives me permission to stay.”',
      '“I don’t need to prove I belong at the next stake. I need to prepare until it becomes obvious.”',
    ],
    featured: '“Don’t chase the next stake. Build the player who deserves it.”',
  },
  {
    key: 'fear',
    icon: '💎',
    title: 'Khi Bắt Đầu Sợ Tiền',
    cssClass: 'group-fear',
    quotes: [
      '“Chips are units of decision-making, not emotions.”',
      '“$20 is not a threat. It is one unit of variance.”',
      '“I don’t protect my bankroll by playing scared. I protect it by following my risk rules.”',
      '“Fear of losing money is not a poker strategy.”',
      '“I accept variance before I sit down.”',
    ],
    featured: '“If I cannot emotionally accept the normal variance of this stake, I am not ready for this stake.”',
  },
  {
    key: 'identity',
    icon: '🐐',
    title: 'Identity — Phần Quan Trọng Nhất',
    cssClass: 'group-identity',
    quotes: [
      '“I am a poker player who studies, reviews and executes consistently.”',
      '“I am the type of player who finishes what he planned.”',
      '“I am calm when winning and disciplined when losing.”',
      '“I don’t need poker to make me feel good today.”',
      '“I respect the game enough to follow the process.”',
    ],
    featured: '“I am building something that will take years.”',
  },
];

const TOP_10_QUOTES = [
  { context: 'Trước khi grind', text: '“My job is to make good decisions, not to control the outcome.”', color: '#3b82f6' },
  { context: 'Trước khi grind', text: '“I am building a career, not chasing a session.”', color: '#3b82f6' },
  { context: 'Trước khi grind', text: '“I do what I planned, not what I feel like doing.”', color: '#3b82f6' },
  { context: 'Khi đang winning', text: '“Winning is not permission to quit.”', color: '#10b981' },
  { context: 'Khi đang winning', text: '“I don’t protect today’s profit. I build tomorrow’s edge.”', color: '#10b981' },
  { context: 'Khi đang losing', text: '“I don’t need to get even today.”', color: '#ef4444' },
  { context: 'Khi đang losing', text: '“Losing is not a signal to grind harder.”', color: '#ef4444' },
  { context: 'Khi vào tough spot', text: '“One decision at a time.”', color: '#06b6d4' },
  { context: 'Khi vào tough spot', text: '“Judge yourself by decisions, not by results.”', color: '#06b6d4' },
  { context: 'Mục tiêu dài hạn', text: '“Don’t chase the next stake. Build the player who deserves it.”', color: '#f97316' },
];

const MANTRA_LINES = [
  ['I don’t chase profit.', 'I don’t chase losses.', 'I don’t protect winnings.'],
  ['I follow my schedule.', 'I play my A-game.', 'I make one good decision at a time.'],
  ['I accept variance.', 'I respect my bankroll.', 'I study when I’m away from the tables.'],
  ['I build volume.', 'I build discipline.', 'I build my edge.'],
  ['I don’t chase the next stake.', 'I become the player who deserves it.'],
];

const Poker = () => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="poker-session flex-col">
      {/* TODAY'S MISSION */}
      <TodaysMission />

      {/* PSYCHOLOGICAL REMINDERS */}
      <div className="td-card td-mindset-card">
        <div className="td-card-header">
          <Award size={20} className="text-emerald-400" />
          <h3>Poker Mindset &amp; Psychological Reminders</h3>
        </div>

        {/* TOP 10 ESSENTIAL QUOTES */}
        <div className="poker-mindset-top10">
          <div className="top10-header">
            <span className="top10-icon">🔥</span>
            <h4>10 Câu Quan Trọng Nhất</h4>
            <span className="top10-badge">ESSENTIAL</span>
          </div>
          <div className="top10-list">
            {TOP_10_QUOTES.map((item, idx) => (
              <div key={idx} className="top10-item">
                <span
                  className="top10-number"
                  style={{
                    background: `${item.color}20`,
                    color: item.color,
                    border: `1px solid ${item.color}40`,
                  }}
                >
                  {idx + 1}
                </span>
                <div>
                  <div className="top10-context">{item.context}</div>
                  <div className="top10-text">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POKER GRIND MANTRA */}
        <div className="poker-mantra-card">
          <div className="mantra-header">
            <h4>🃏 Poker Grind Mantra</h4>
            <span className="mantra-badge">ĐỌC 30s TRƯỚC MỖI SESSION</span>
          </div>
          <div className="mantra-lines">
            {MANTRA_LINES.map((group, gIdx) => (
              <div key={gIdx} className="mantra-group">
                {group.map((line, lIdx) => (
                  <div key={lIdx} className="mantra-line">{line}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* GROUPED QUOTES */}
        <div className="poker-mindset-groups">
          {MINDSET_GROUPS.map((group) => {
            const isExpanded = expandedGroups[group.key] ?? false;

            return (
              <div key={group.key} className={`poker-mindset-group ${group.cssClass}`}>
                <div className="group-header" onClick={() => toggleGroup(group.key)}>
                  <div className="group-header-left">
                    <span className="group-icon">{group.icon}</span>
                    <span className="group-title">{group.title}</span>
                    <span className="group-count">
                      {group.quotes.length + (group.featured ? 1 : 0)}
                    </span>
                  </div>
                  <span className={`group-chevron ${isExpanded ? 'expanded' : ''}`}>▼</span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="group-quotes"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      {group.featured && (
                        <div className="group-quote-item group-featured-quote">
                          <p>{group.featured}</p>
                        </div>
                      )}
                      {group.quotes.map((q, qIdx) => (
                        <div key={qIdx} className="group-quote-item">
                          <p>{q}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Poker;
