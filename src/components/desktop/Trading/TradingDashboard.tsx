'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import cx from 'classnames';
import {
  LayoutDashboard,
  History,
  PlusCircle,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckSquare,
  Square,
  ChevronRight,
  TrendingUp,
  Award,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  Star,
  RotateCcw,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import './TradingDashboard.scss';

// Types
interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

// BMC Pre-Trade Checklist Data
interface ChecklistItem {
  id: string;
  text: string;
  hint?: string;
  isBlocker?: boolean;
  isInfo?: boolean;
  checked: boolean;
}

interface ChecklistGroup {
  id: string;
  number: number;
  title: string;
  items: ChecklistItem[];
}

interface ChecklistDayData {
  dayLabel: string;
  timeframes: string;
  groups: ChecklistGroup[];
}

const initialBmcData: ChecklistDayData[] = [
  {
    dayLabel: '1',
    timeframes: 'Weekly → H4 → M15',
    groups: [
      {
        id: 'w1',
        number: 1,
        title: 'Weekly — Cấu trúc, Bias, DOL & PD-Array',
        items: [
          {
            id: 'w1-1',
            text: 'Cấu trúc — thị trường gần nhất xác nhận hướng gì? (Tăng, giảm hoặc không rõ)',
            hint: 'Uptrend: HH+HL | Downtrend: LL+LH | No trend: Sideways.',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'w1-2',
            text: 'DOL tuần — các vùng thanh khoản đang nằm ở đâu? Thanh khoản nào đã lấy rồi?',
            hint: 'Đích giá hướng tới trong tuần.',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'w1-3',
            text: 'Weekly Bias: Tăng, giảm hay không có bias?',
            hint: 'Dựa theo 2 nến đã đóng gần nhất.',
            checked: false,
          },
          {
            id: 'w1-4',
            text: 'PDA trên Weekly: có hay không? Nếu không có thì còn Blocks nào giao dịch được không?',
            hint: 'Đánh dấu những Blocks hợp lệ thuộc vùng Premium & Discount.',
            checked: false,
          },
          {
            id: 'w1-5',
            text: 'Có Model nào để giao dịch Swing (W / H4) không?: IRL to ERL, UNICORN, CRT, ERL to ERL...',
            hint: 'Nếu có thì xuống khung 4h tìm xác nhận đảo chiều cấu trúc rồi giao dịch.',
            checked: false,
          },
        ],
      },
      {
        id: 'w2',
        number: 2,
        title: 'H4 — Setup tại khung Tuần — vào luôn nếu đủ',
        items: [
          {
            id: 'w2-1',
            text: 'Sweep liquidity (BSL / SSL) đã xảy ra tại vùng PD-Array tuần hoặc vùng canh giao dịch tuần?',
            hint: 'Sweep thanh khoản trước khi đảo chiều sẽ uy tín hơn Bms.',
            checked: false,
          },
          {
            id: 'w2-2',
            text: 'MSS / CISD sau sweep / bms — kèm FVG không?',
            hint: 'Không có FVG đi kèm = MSS/CISD không hợp lệ',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'w2-3',
            text: 'PDA entry nằm đúng phía discount/premium?',
            hint: 'Có nhiều sự lựa chọn thì chọn PDA để vào lệnh, còn không thì chọn cái mà thị trường tạo ra.',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'w2-4',
            text: 'OTE trong vùng PDA (61.8% - 79%)?',
            hint: 'OTE + PDA hợp lưu = xác suất tốt nhất',
            checked: false,
          },
          {
            id: 'w2-5',
            text: 'Đặt đúng điểm Stop Loss và Take Profit theo Model',
            hint: 'Đặt Stop Loss an toàn ở đỉnh/đáy cao nhất khi tạo MSS/CISD hoặc đỉnh/đáy đã được quét thanh khoản.',
            checked: false,
          },
          {
            id: 'w2-6',
            text: 'Có bất lợi nào cản trở khối lệnh hay không?',
            hint: 'Nếu có thì quan sát và quản lý lệnh tốt.',
            checked: false,
          },
          {
            id: 'w2-info',
            text: 'Không có model khung tuần → xuống H4 tìm model Scalp (H4-M15)',
            isInfo: true,
            checked: false,
          },
        ],
      },
      {
        id: 'w3',
        number: 3,
        title: 'H4 -- Xác nhận cấu trúc, tìm Model giao dịch',
        items: [
          {
            id: 'w3-1',
            text: 'H4 cấu trúc đồng thuận với Weekly?',
            hint: 'Ngược Weekly -> Không Trade.',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'w3-2',
            text: 'H4: PDA -- OB / FVG / BPR / IFVG đã đánh dấu',
            hint: 'Vùng PDA có thể giao dịch, nếu không có thì chọn Blocks (PDA cho tỉ lệ winrate cao hơn)',
            checked: false,
          },
          {
            id: 'w3-3',
            text: 'H4: Model đang hình thành: IRL to ERL, UNICORN, CRT, ERL to ERL?',
            hint: 'Phải có Model mới giao dịch, không giao dịch cảm tính.',
            checked: false,
          },
          {
            id: 'w3-4',
            text: 'Xác định các mục tiêu thanh khoản để đặt Take Profit cho lệnh trong khung M15',
            hint: 'Nếu không có mục tiêu -> Không Trade.',
            checked: false,
          },
        ],
      },
    ],
  },
  {
    dayLabel: '2',
    timeframes: 'Daily → H1 → M5',
    groups: [
      {
        id: 'd1',
        number: 1,
        title: 'Daily — Bias & DOL',
        items: [
          {
            id: 'd1-1',
            text: 'Cấu trúc Daily — đồng thuận với Weekly?',
            hint: 'Daily ngược Weekly → bỏ qua hoàn toàn',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'd1-2',
            text: 'DOL hôm nay — các vùng thanh khoản đang nằm ở đâu?',
            hint: 'Xác định mục tiêu thanh khoản ngày giá có thể tiến tới.',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'd1-3',
            text: 'Daily Bias: Tăng, giảm hay không có Bias?',
            hint: 'Dựa theo 2 nến đã đóng gần nhất',
            checked: false,
          },
          {
            id: 'd1-4',
            text: 'PDA trên Daily: OB / FVG / BPR / IFVG ở đâu? có hay không? Nếu không có thì còn Blocks nào giao dịch được không?',
            hint: 'Đánh dấu những Blocks hợp lệ thuộc vùng Premium & Discount.',
            checked: false,
          },
          {
            id: 'd1-5',
            text: 'Có Model nào để giao dịch Swing (D / H1) không?: IRL to ERL, UNICORN, CRT, ERL to ERL...',
            hint: 'Nếu có thì xuống khung 1h tìm xác nhận đảo chiều cấu trúc rồi giao dịch.',
            checked: false,
          },
        ],
      },
      {
        id: 'd2',
        number: 2,
        title: 'H1 — Setup tại khung Ngày — vào luôn nếu đủ',
        items: [
          {
            id: 'd2-1',
            text: 'Sweep liquidity (BSL/SSL) đã xảy ra tại vùng PD-Array ngày?',
            hint: 'Sweep thanh khoản trước khi đảo chiều sẽ uy tín hơn Bms.',
            checked: false,
          },
          {
            id: 'd2-2',
            text: 'MSS / CISD sau sweep - kèm FVG không?',
            hint: 'Không có FVG đi kèm = MSS không hợp lệ',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'd2-3',
            text: 'PDA entry nằm đúng phía discount/premium?',
            hint: 'Có nhiều sự lựa chọn thì chọn PDA để vào lệnh, còn không thì chọn cái mà thị trường tạo ra.',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'd2-4',
            text: 'OTE trong vùng PDA (61.8% - 79%)?',
            hint: 'OTE + PDA hợp lưu = xác suất tốt nhất',
            checked: false,
          },
          {
            id: 'd2-5',
            text: 'Đặt đúng điểm Stop Loss và Take Profit theo Model',
            hint: 'Đặt Stop Loss an toàn ở đỉnh/đáy cao nhất khi tạo MSS/CISD hoặc đỉnh/đáy đã được quét thanh khoản.',
            checked: false,
          },
          {
            id: 'd2-6',
            text: 'Có bất lợi nào cản trở khối lệnh hay không?',
            hint: 'Nếu có thì quan sát và quản lý lệnh tốt.',
            checked: false,
          },
          {
            id: 'd2-info',
            text: 'Không có model khung ngày → xuống H1 tìm model Scalp (H1-M5)',
            isInfo: true,
            checked: false,
          },
        ],
      },
      {
        id: 'd3',
        number: 3,
        title: 'H1 -- Xác nhận cấu trúc & POI',
        items: [
          {
            id: 'd3-1',
            text: 'H1 cấu trúc đồng thuận với Daily?',
            hint: 'Ngược Daily -> Không Trade.',
            isBlocker: true,
            checked: false,
          },
          {
            id: 'd3-2',
            text: 'H1: PDA -- OB / FVG / BPR / IFVG đã đánh dấu',
            hint: 'Vùng PDA có thể giao dịch, nếu không có thì chọn Blocks (PDA cho tỉ lệ winrate cao hơn)',
            checked: false,
          },
          {
            id: 'd3-3',
            text: 'H1: Model đang hình thành: IRL to ERL, UNICORN, CRT, ERL to ERL?',
            hint: 'Phải có Model mới giao dịch, không giao dịch cảm tính.',
            checked: false,
          },
          {
            id: 'd3-4',
            text: 'Xác định các mục tiêu thanh khoản để đặt Take Profit cho lệnh trong khung M5',
            hint: 'Nếu không có mục tiêu -> Không Trade.',
            checked: false,
          },
        ],
      },
    ],
  },
];

export default function TradingDashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States for interactive checklist
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Xác định Bias HTF và đánh dấu các vùng giá quan trọng', checked: false },
    { id: 2, text: 'Xác định IRL, ERL, Key Levels', checked: false },
    { id: 3, text: 'LOCATION — Giá đang ở đâu? Check Premium / Discount và Volumn Profile và HTF FVG', checked: false },
    { id: 4, text: 'Xác định mức R:R tối thiểu 1:2', checked: false },
    { id: 5, text: 'TIMING - MSS? FVG? OB?', checked: false },
    { id: 6, text: 'Tôi đang bình tĩnh, không revenge, không FOMO', checked: false },
    { id: 7, text: 'Chấp nhận không Trade nếu không có Setup tốt', checked: false }
  ]);

  // BMC Pre-Trade Checklist State
  const [bmcData, setBmcData] = useState<ChecklistDayData[]>(initialBmcData);
  const [bmcValidated, setBmcValidated] = useState(false);

  const toggleBmcItem = (dayIdx: number, groupId: string, itemId: string) => {
    setBmcData(prev => prev.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      return {
        ...day,
        groups: day.groups.map(group => {
          if (group.id !== groupId) return group;
          return {
            ...group,
            items: group.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
        }),
      };
    }));
    setBmcValidated(false);
  };

  const resetBmc = () => {
    setBmcData(initialBmcData);
    setBmcValidated(false);
  };

  const validateBmc = () => {
    const allBlockersChecked = bmcData.every(day =>
      day.groups.every(group =>
        group.items.filter(i => i.isBlocker).every(i => i.checked)
      )
    );
    setBmcValidated(allBlockersChecked);
    if (!allBlockersChecked) {
      alert('⚠️ Chưa đủ điều kiện! Hãy hoàn thành tất cả các BLOCKER trước khi vào lệnh.');
    } else {
      alert('✅ Entry hợp lệ! Tất cả BLOCKER đã được xác nhận.');
    }
  };

  // Equity Curve Timeframes
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | 'YTD' | 'ALL'>('1M');

  // Equity Chart Data Points based on selected timeframe
  const chartDataMap = {
    '1M': [
      { date: 'Aug 1', value: 38200 },
      { date: 'Aug 5', value: 39500 },
      { date: 'Aug 10', value: 41200 },
      { date: 'Aug 15', value: 40100 },
      { date: 'Aug 20', value: 42100 },
      { date: 'Aug 25', value: 41500 },
      { date: 'Aug 30', value: 42850 },
    ],
    '3M': [
      { date: 'Jun', value: 35000 },
      { date: 'Jul', value: 39000 },
      { date: 'Aug', value: 42850 },
    ],
    'YTD': [
      { date: 'Jan', value: 30000 },
      { date: 'Mar', value: 34000 },
      { date: 'May', value: 38000 },
      { date: 'Jul', value: 41000 },
      { date: 'Aug', value: 42850 },
    ],
    'ALL': [
      { date: '2025', value: 25000 },
      { date: 'Q1 26', value: 32000 },
      { date: 'Q2 26', value: 39000 },
      { date: 'Aug 26', value: 42850 },
    ]
  };

  const chartData = chartDataMap[timeframe];
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; index: number } | null>(null);

  const toggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // SVG Chart Dimensions & Computations
  const width = 600;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const minVal = 25000;
  const maxVal = 45000;

  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i / (chartData.length - 1)) * (width - paddingLeft - paddingRight);
    const y = height - paddingBottom - ((d.value - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
    return { x, y, ...d };
  });

  // SVG path definitions
  let linePath = '';
  let fillPath = '';
  if (points.length > 0) {
    // Generate curved path using cubic bezier approximation
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    fillPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  // Handle clicks to return to trading main view
  const handleBackToTrading = () => {
    router.push('/trading');
  };

  return (
    <div className="trading-dashboard-container">
      <div className="td-content-header">
        <div className="td-header-left">
          <h1>Dashboard</h1>
          <p>Overview of your trading performance and discipline metrics.</p>
        </div>
        <div className="td-header-actions">
          {/* <button className="td-btn td-btn-outline" onClick={() => alert('Exporting data as CSV...')}>
            Export Data
          </button>
          <button className="td-btn td-btn-primary" onClick={handleBackToTrading}>
            + New Trade
          </button> */}
          <button
            onClick={handleBackToTrading}
            className="td-btn td-btn-outline flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            Quay lại
          </button>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div className="td-metrics-grid">
        <div className="td-metric-card">
          <div className="td-metric-info">
            <span className="td-metric-title">TOTAL PNL</span>
            <h2 className="td-metric-value text-emerald-400">+$0</h2>
            <span className="td-metric-subtext text-emerald-500/80">+0% this month</span>
          </div>
          <div className="td-metric-icon-wrapper pnl-icon">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="td-metric-card">
          <div className="td-metric-info">
            <span className="td-metric-title">WIN RATE</span>
            <h2 className="td-metric-value text-slate-100">0%</h2>
            <div className="td-metric-progress-bar">
              <div className="td-progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="td-metric-icon-wrapper win-icon">
            <Award size={20} />
          </div>
        </div>

        <div className="td-metric-card">
          <div className="td-metric-info">
            <span className="td-metric-title">PROFIT FACTOR</span>
            <h2 className="td-metric-value text-slate-100">0</h2>
            <span className="td-metric-subtext text-gray-400">Gross Win / Gross Loss</span>
          </div>
          <div className="td-metric-icon-wrapper factor-icon">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="td-metric-card">
          <div className="td-metric-info">
            <span className="td-metric-title">TOTAL TRADES</span>
            <h2 className="td-metric-value text-slate-100">50</h2>
            <span className="td-metric-subtext text-gray-400">YTD 2026</span>
          </div>
          <div className="td-metric-icon-wrapper trades-icon">
            <History size={20} />
          </div>
        </div>
      </div>

      {/* BMC PRE-TRADE CHECKLIST */}
      <div className="bmc-checklist-wrapper">
        <div className="bmc-header">
          <div className="bmc-header-left">
            <h2 className="bmc-title">Pre-Trade Checklist</h2>
            <p className="bmc-subtitle">
              Multi-timeframe structural alignment and PD-Array verification. Ensure all critical blockers are cleared before execution.
            </p>
          </div>
          <div className="bmc-header-actions">
            <button className="bmc-btn bmc-btn-reset" onClick={resetBmc}>
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              className={cx('bmc-btn bmc-btn-validate', { 'validated': bmcValidated })}
              onClick={validateBmc}
            >
              <ShieldCheck size={14} />
              Validate Entry
            </button>
          </div>
        </div>

        <div className="bmc-columns">
          {bmcData.map((day, dayIdx) => (
            <div key={day.dayLabel} className="bmc-column">
              {/* Column Header */}
              <div className="bmc-column-header">
                <span className="bmc-day-label">{day.dayLabel}</span>
                <span className="bmc-separator">—</span>
                <span className="bmc-timeframes">{day.timeframes}</span>
              </div>

              {/* Groups */}
              {day.groups.map((group) => (
                <div key={group.id} className="bmc-group">
                  <div className="bmc-group-header">
                    <span className="bmc-group-number">{group.number}</span>
                    <span className="bmc-group-title">{group.title}</span>
                  </div>

                  <div className="bmc-items-list">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={cx('bmc-item', {
                          'bmc-item--checked': item.checked,
                          'bmc-item--info': item.isInfo,
                        })}
                        onClick={() => !item.isInfo && toggleBmcItem(dayIdx, group.id, item.id)}
                      >
                        {item.isInfo ? (
                          <div className="bmc-info-row">
                            <Info size={13} className="bmc-info-icon" />
                            <span className="bmc-info-text">{item.text}</span>
                          </div>
                        ) : (
                          <>
                            <div className="bmc-item-top">
                              <div className={cx('bmc-checkbox', { 'bmc-checkbox--checked': item.checked })}>
                                {item.checked && (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="#0d1527" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <span className={cx('bmc-item-text', { 'bmc-item-text--checked': item.checked })}>
                                {item.text}
                              </span>
                            </div>
                            {item.isBlocker && (
                              <span className="bmc-blocker-badge">BLOCKER</span>
                            )}
                            {item.hint && (
                              <p className="bmc-item-hint">{item.hint}</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE GRID: CHECKLIST & PSYCHOLOGICAL REMINDERS */}
      <div className="td-middle-grid">
        {/* PRE-TRADE CHECKLIST */}
        <div className="td-card td-checklist-card">
          <div className="td-card-header">
            <CheckSquare size={18} className="text-indigo-400" />
            <h3>Checklist Trước Giao Dịch</h3>
          </div>
          <div className="td-checklist-content">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={cx("td-checklist-item", { "checked": item.checked })}
                onClick={() => toggleChecklist(item.id)}
              >
                <div className="td-checklist-checkbox">
                  {item.checked ? (
                    <div className="checkbox-active" />
                  ) : (
                    <div className="checkbox-empty" />
                  )}
                </div>
                <span className="td-checklist-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PSYCHOLOGICAL REMINDERS */}
        <div className="td-card td-mindset-card">
          <div className="td-card-header">
            <Award size={18} className="text-emerald-400" />
            <h3>Nhắc Nhở Tâm Lý</h3>
          </div>
          <div className="td-mindset-content">
            <div className="td-mindset-quote border-l-4 border-emerald-500">
              <p>“Thị trường luôn ở đó, tôi không cần bắt mọi con sóng, cơ hội không bao giờ hết.”</p>
            </div>
            <div className="td-mindset-quote border-l-4 border-blue-500">
              <p>“Bảo vệ vốn quan trọng hơn kiếm lợi nhuận.”</p>
            </div>
            <div className="td-mindset-quote border-l-4 border-blue-500">
              <p>“Một setup đẹp mỗi ngày còn hơn mười setup trung bình.”</p>
            </div>
            <div className="td-mindset-quote border-l-4 border-blue-500">
              <p>“Tôi chỉ cần thực hiện đúng quy trình để đạt EV+.”</p>
            </div>
            <div className="td-mindset-quote border-l-4 border-indigo-500">
              <p>“Mục tiêu là tồn tại đủ lâu để lợi thế thống kê phát huy.”</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID: EQUITY CURVE & DISCIPLINE SCORE & RECENT TRADES */}
      <div className="td-bottom-grid">
        {/* EQUITY CURVE */}
        <div className="td-card td-equity-card">
          <div className="td-equity-header">
            <h3>Equity Curve</h3>
            <div className="td-timeframe-selector">
              {(['1M', '3M', 'YTD', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  className={cx({ 'active': timeframe === tf })}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="td-chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="td-chart-svg">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="line-glow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((grid, index) => {
                const y = paddingTop + (index / 4) * (height - paddingTop - paddingBottom);
                const gridVal = maxVal - (index / 4) * (maxVal - minVal);
                return (
                  <g key={index} className="chart-grid-line">
                    <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1f293d" strokeDasharray="3,3" />
                    <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">
                      {`$${(gridVal / 1000).toFixed(1)}k`}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area Fill */}
              {fillPath && <path d={fillPath} fill="url(#chart-gradient)" />}

              {/* Curved Trendline */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#line-glow)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Points & Trigger Zones */}
              {points.map((p, idx) => (
                <g key={idx}>
                  {/* Anchor Circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.index === idx ? "6" : "3"}
                    fill={hoveredPoint?.index === idx ? "#10b981" : "#ffffff"}
                    stroke="#0d1527"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  {/* Invisible Hover target area */}
                  <rect
                    x={p.x - 20}
                    y={paddingTop}
                    width="40"
                    height={height - paddingTop - paddingBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={(e) => {
                      setHoveredPoint({ x: p.x, y: p.y, index: idx });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}

              {/* Tooltip render */}
              {hoveredPoint !== null && (
                <g>
                  <rect
                    x={hoveredPoint.x - 55}
                    y={hoveredPoint.y - 45}
                    width="110"
                    height="35"
                    rx="6"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text x={hoveredPoint.x} y={hoveredPoint.y - 28} textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
                    {points[hoveredPoint.index].date}
                  </text>
                  <text x={hoveredPoint.x} y={hoveredPoint.y - 15} textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">
                    {`$${points[hoveredPoint.index].value.toLocaleString()}`}
                  </text>
                </g>
              )}

              {/* X Axis Labels */}
              {points.map((p, idx) => (
                <text
                  key={idx}
                  x={p.x}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10.5"
                >
                  {p.date}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* DISCIPLINE SCORE & RECENT TRADES */}
        <div className="td-bottom-right-column">
          {/* SETUP SCORING SYSTEM */}
          <div className="td-card td-setup-score-card">
            <div className="td-card-header">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <h3>Hệ Thống Chấm Điểm Setup</h3>
            </div>
            <div className="td-setup-score-content">
              <div className="td-setup-criteria">
                {[
                  { label: 'HTF Bias', pts: 20 },
                  { label: 'Liquidity Sweep', pts: 20 },
                  { label: 'Location', pts: 20 },
                  { label: 'Timing / Confirmation', pts: 15 },
                  { label: 'Volumn Profile / Fibonacci', pts: 15 },
                  { label: 'Risk Reward', pts: 10 },
                ].map((c) => (
                  <div key={c.label} className="td-setup-criterion-row">
                    <span className="td-criterion-label">{c.label}</span>
                    <span className="td-criterion-pts">{c.pts} pts</span>
                  </div>
                ))}
                <div className="td-setup-total-row">
                  <span className="td-total-label">Total</span>
                  <span className="td-total-pts">100 pts</span>
                </div>
              </div>

              <div className="td-setup-tiers">
                <div className="td-setup-tier tier-full">
                  <div className="td-tier-left">
                    <span className="td-tier-range">&ge;90:</span>
                    <span className="td-tier-stars">{'★'.repeat(5)}</span>
                  </div>
                  <span className="td-tier-label full">A+</span>
                </div>
                <div className="td-setup-tier tier-normal">
                  <div className="td-tier-left">
                    <span className="td-tier-range">80-89:</span>
                    <span className="td-tier-stars">{'★'.repeat(4)}</span>
                  </div>
                  <span className="td-tier-label normal">A</span>
                </div>
                <div className="td-setup-tier tier-half">
                  <div className="td-tier-left">
                    <span className="td-tier-range">70-79:</span>
                    <span className="td-tier-stars">{'★'.repeat(3)}</span>
                  </div>
                  <span className="td-tier-label half">B</span>
                </div>
                <div className="td-setup-tier tier-no-trade">
                  <div className="td-tier-left">
                    <span className="td-tier-range">&lt;70:</span>
                    <span className="td-tier-no-trade-text">NO TRADE</span>
                  </div>
                  <span className="td-tier-label no-trade">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* DISCIPLINE SCORE */}
          <div className="td-card td-score-card">
            <div className="td-card-header">
              <Award size={18} className="text-emerald-400" />
              <h3>Discipline Score</h3>
            </div>
            <div className="td-score-content">
              <div className="td-score-num-wrapper">
                <span className="td-score-big">85</span>
                <span className="td-score-total">/ 100</span>
              </div>
              <p className="td-score-desc">
                Excellent consistency. You adhered to your trading plan on 92% of trades this week.
              </p>

              <div className="td-score-bars">
                <div className="td-score-bar-group">
                  <div className="td-score-bar-labels">
                    <span>Plan Adherence</span>
                    <span className="text-emerald-400 font-medium">92%</span>
                  </div>
                  <div className="td-bar-outer">
                    <div className="td-bar-inner bg-emerald-500" style={{ width: '92%' }} />
                  </div>
                </div>

                <div className="td-score-bar-group">
                  <div className="td-score-bar-labels">
                    <span>Risk Management</span>
                    <span className="text-slate-200 font-medium">88%</span>
                  </div>
                  <div className="td-bar-outer">
                    <div className="td-bar-inner bg-slate-400" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT TRADES */}
          <div className="td-card td-recent-trades-card">
            <div className="td-recent-trades-header">
              <h3>Recent Trades</h3>
              <button className="td-btn-view-all" onClick={handleBackToTrading}>
                VIEW ALL
              </button>
            </div>
            <div className="td-recent-trades-list">
              {/* Trade 1 */}
              <div className="td-trade-item" onClick={handleBackToTrading}>
                <div className="td-trade-symbol">NQ</div>
                <div className="td-trade-details">
                  <div className="td-trade-type-dir">
                    <span className="font-semibold text-gray-200">Long</span>
                    <ArrowUpRight size={14} className="text-emerald-400" />
                  </div>
                  <span className="td-trade-time">09:30 AM</span>
                </div>
                <div className="td-trade-pnl text-emerald-400">+$450.00</div>
                <span className="td-trade-tag tag-followed-plan">FOLLOWED PLAN</span>
              </div>

              {/* Trade 2 */}
              <div className="td-trade-item" onClick={handleBackToTrading}>
                <div className="td-trade-symbol">ES</div>
                <div className="td-trade-details">
                  <div className="td-trade-type-dir">
                    <span className="font-semibold text-gray-200">Short</span>
                    <ArrowDownRight size={14} className="text-rose-400" />
                  </div>
                  <span className="td-trade-time">10:15 AM</span>
                </div>
                <div className="td-trade-pnl text-rose-400">-$125.00</div>
                <span className="td-trade-tag tag-neutral">NEUTRAL</span>
              </div>

              {/* Trade 3 */}
              <div className="td-trade-item" onClick={handleBackToTrading}>
                <div className="td-trade-symbol">GC</div>
                <div className="td-trade-details">
                  <div className="td-trade-type-dir">
                    <span className="font-semibold text-gray-200">Long</span>
                    <ArrowUpRight size={14} className="text-emerald-400" />
                  </div>
                  <span className="td-trade-time">Yesterday</span>
                </div>
                <div className="td-trade-pnl text-emerald-400">+$820.00</div>
                <span className="td-trade-tag tag-fomo">FOMO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
