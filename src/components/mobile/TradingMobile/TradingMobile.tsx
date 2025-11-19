'use client';
import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { Plus, Calendar as CalendarIcon, Pencil, Save, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import moment from 'moment';
import './TradingMobile.scss';
import API from '../../../utils/api';
import { openNotification } from '../../../common/utils.notification';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { notification, Rate, Tag } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { hideLoading, showLoading } from '../../../store/slices/user.slice';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import cx from 'classnames';
import TradeList from './TradeList';
import CustomDayPicker from '../UI/CustomDatePicker';
import { AnimatePresence, motion } from 'framer-motion';
import PlanSettings from './Plan';
import { ImagesTab } from '../../desktop/User/User';

export default function TradingMobile() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<'trades' | 'calendar' | 'plan'>('trades');
  const [trades, setTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any | null>(null);
  const [isOpenTradeModal, setIsOpenTradeModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [closeBy, setCloseBy] = useState<any>('');
  // const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [dataMonth, setDataMonth] = useState<any>({});
  const [month, setMonth] = useState<any>(moment().toDate());

  //store
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);

  const [api, contextHolder] = notification.useNotification();

  const getRecentTrade = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/list', { mode: 'year' });
      setTrades(data);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading()); // tắt loading dù có lỗi hay không
    }
  };

  useEffect(() => {
    getRecentTrade();
    getDataMonthTrade();
  }, []);

  const getDataMonthTrade = async (time?: any) => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      console.log('time', time);

      setMonth(moment(time).toDate());
      const { data } = await API.post('/trading/group', {
        mode: 'month',
        group: 'month',
        dateString: time ? moment(time).format('YYYY-MM') : moment().format('YYYY-MM'),
      });
      setDataMonth(data[moment(time).format('YYYY-MM')]);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading()); // tắt loading dù có lỗi hay không
    }
  };

  const syncPageData = async () => {
    try {
      dispatch(showLoading()); // bật loading

      // Gọi 3 API song song
      await Promise.all([getRecentTrade(), getDataMonthTrade()]);
    } catch (err) {
      console.error('Lỗi khi sync dữ liệu:', err);
    } finally {
      dispatch(hideLoading()); // tắt loading dù có lỗi hay không
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      await API.delete(`/trading/${id}`);
      getRecentTrade();
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleSubmit = async () => {
    try {
      dispatch(showLoading());
      if (isEdit) {
        await API.post('/trading/update', { id: selectedTrade.id, ...formData });
      } else {
        await API.post('/trading/add-trade', formData);
      }
      setIsOpenTradeModal(false);
      getRecentTrade();
    } catch (err) {
      openNotification('error', { message: 'Lỗi khi lưu trade' });
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleOpenTrade = (trade?: any) => {
    if (trade) {
      setSelectedTrade(trade);
      setFormData({
        ...trade,
        entryTime: moment(trade.entryTime).toDate(),
        closeTime: trade.closeTime ? moment(trade.closeTime).toDate() : undefined,
        closeBy: trade.closedBy || '',
      });
      setCloseBy(trade.closedBy || '');
      setPreviewURLs(trade.images);
      setIsEdit(true);
    } else {
      setFormData({
        symbol: '',
        lots: '',
        entryPrice: '',
        closePrice: '',
        stopLoss: '',
        takeProfit: '',
        entryTime: new Date(),
        closeTime: undefined,
        tradeSide: 'BUY',
        result: '',
        closedBy: '',
        rating: 0,
        yourThought: '',
      });
      setIsEdit(false);
    }
    setIsOpenTradeModal(true);
  };

  // ==== Tab Calendar ====
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const profitByDate = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      const date = moment(t.closeTime || t.entryTime).format('YYYY-MM-DD');
      map[date] = (map[date] || 0) + (t.result || 0);
    });
    return map;
  }, [trades]);

  const tradesOfSelectedDate = trades.filter(
    (t) => moment(t.closeTime).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD'),
  );

  const winrateByDate = useMemo(() => {
    const winCount = tradesOfSelectedDate.filter((t) => t.result > 0).length;
    console.log('trades', trades);
    console.log('w', winCount);
    const total = tradesOfSelectedDate.length;
    const winrate = total > 0 ? Math.round((winCount / total) * 100) : 0;
    return winrate;
  }, [tradesOfSelectedDate]);

  const rewardOfDay: any = useMemo(() => {
    let total = 0;
    tradesOfSelectedDate.forEach((t) => {
      total += t.reward || 0;
    });
    return total.toFixed(1);
  }, [tradesOfSelectedDate]);

  //upload images
  const [localImages, setLocalImages] = useState<File[]>([]);
  const [previewURLs, setPreviewURLs] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>();
  // const [uploadedURLs, setUploadedURLs] = useState<string[]>([]); // URL từ server

  const handleSelectImages = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    setLocalImages((prev) => [...prev, ...files]);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewURLs((prev) => [...prev, ...urls]);
  };

  const handleRemove = (index: number) => {
    setPreviewURLs((prev) => prev.filter((_, i) => i !== index));
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setLocalImages([]);
  }, [isOpenTradeModal]);

  const uploadToServer = async () => {
    try {
      dispatch(showLoading());
      const formData = new FormData();
      localImages.forEach((f) => formData.append('files', f));
      formData.append('type', 'TRADING');
      const { data } = await API.post('/images/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data) {
        const filteredImages = previewURLs.filter((url) => !url.startsWith('blob:'));
        const newDataImages = [...filteredImages, ...data];

        setFormData({ ...formData, images: newDataImages });

        setLocalImages([]);
      } else {
        api.error({
          message: 'Error!',
          description: 'Error upload multiple images.',
        });
      }
    } catch (error: any) {
      api.error({
        message: 'Error!',
        description: error?.response?.data?.message || 'Error upload multiple images.',
      });
    } finally {
      dispatch(hideLoading());
    }
  };

  // ==== Tab Plan ====
  const [planData, setPlanData] = useState<any>({});
  // const [editPlan, setEditPlan] = useState(false);

  const getUserSettingTrading = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/users/get-setting', {
        type: 'TRADING',
      });
      setPlanData(data);
    } catch (err) {
      console.log('error123', err);
      setPlanData(null);
    } finally {
      dispatch(hideLoading()); // tắt loading dù có lỗi hay không
    }
  };

  const handleSavePlan = async (data: any, isEdit: boolean) => {
    try {
      dispatch(showLoading());
      if (isEdit) {
        await API.post('/users/update-setting', { ...data, type: 'TRADING' });
      } else {
        await API.post('/users/setting', { ...data, type: 'TRADING' });
      }
      getUserSettingTrading();
      openNotification('success', { message: 'Lưu kế hoạch thành công' });
    } catch {
      openNotification('error', { message: 'Lỗi khi lưu kế hoạch' });
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground px-3 pt-3 pb-16">
      {/* <LoadingOverlay show={loading} fullscreen /> */}
      {contextHolder}
      <h1 className="text-xl font-bold mb-5 text-center">📚 Trading Journey</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="trades" className="font-bold">
            Trades
          </TabsTrigger>
          <TabsTrigger value="calendar" className="font-bold">
            Stats
          </TabsTrigger>
          <TabsTrigger value="plan" className="font-bold">
            Plan
          </TabsTrigger>
        </TabsList>

        {/* TAB 1 - TRADES */}
        <TabsContent value="trades" className="flex-1 overflow-y-auto">
          <div className="flex justify-between mb-3">
            <Button onClick={() => handleOpenTrade()} className="w-full btn-theme">
              <Plus size={20} className="mr-2" /> Add Trade
            </Button>
          </div>

          <div className="space-y-3 h-auto">
            <TradeList trades={trades} onDelete={deleteTrade} handleOpenTrade={handleOpenTrade} />
          </div>
        </TabsContent>

        {/* TAB 2 - CALENDAR */}
        <TabsContent value="calendar" className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center">
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-base">📊 Monthly Stats</h3>
                <button
                  onClick={syncPageData}
                  className="px-3 py-1 bg-blue-400 text-white rounded-md hover:opacity-90 active:scale-95 transition"
                >
                  Sync
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div
                  className={cx('rounded-lg p-2 text-center', {
                    'bg-[#1e293b]': theme === 'dark',
                    'bg-[#f0efef]': theme === 'light',
                  })}
                >
                  <p
                    className={cx('text-xs', {
                      'text-gray-400': theme === 'dark',
                      'text-black': theme === 'light',
                    })}
                  >
                    Profit
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      dataMonth?.dayProfit === undefined
                        ? 'text-blue-500'
                        : dataMonth?.dayProfit
                          ? 'text-green-400'
                          : 'text-red-400'
                    }`}
                  >
                    {dataMonth?.profit ? `${dataMonth?.profit}$` : '--'}
                  </p>
                </div>

                <div
                  className={cx('rounded-lg p-2 text-center', {
                    'bg-[#1e293b]': theme === 'dark',
                    'bg-[#f0efef]': theme === 'light',
                  })}
                >
                  <p
                    className={cx('text-xs', {
                      'text-gray-400': theme === 'dark',
                      'text-black': theme === 'light',
                    })}
                  >
                    Trades
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      dataMonth?.dayProfit === undefined
                        ? 'text-blue-500'
                        : dataMonth?.dayProfit
                          ? 'text-green-400'
                          : 'text-red-400'
                    }`}
                  >
                    {dataMonth?.trades ? dataMonth?.trades : '--'}
                  </p>
                </div>

                <div
                  className={cx('rounded-lg p-2 text-center', {
                    'bg-[#1e293b]': theme === 'dark',
                    'bg-[#f0efef]': theme === 'light',
                  })}
                >
                  <p
                    className={cx('text-xs', {
                      'text-gray-400': theme === 'dark',
                      'text-black': theme === 'light',
                    })}
                  >
                    Winrate
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      dataMonth?.dayProfit === undefined
                        ? 'text-blue-500'
                        : dataMonth?.dayProfit
                          ? 'text-green-400'
                          : 'text-red-400'
                    }`}
                  >
                    {dataMonth?.winrate ? `${dataMonth?.winrate}` : '--'}
                  </p>
                </div>

                <div
                  className={cx('rounded-lg p-2 text-center', {
                    'bg-[#f0efef]': theme === 'light',
                    'bg-[#1e293b]': theme === 'dark',
                  })}
                >
                  <p
                    className={cx('text-xs', {
                      'text-black': theme === 'light',
                      'text-gray-400': theme === 'dark',
                    })}
                  >
                    Reward
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      dataMonth?.dayProfit === undefined
                        ? 'text-blue-500'
                        : dataMonth?.dayProfit
                          ? 'text-green-400'
                          : 'text-red-400'
                    }`}
                  >
                    {dataMonth?.reward ? `${dataMonth?.reward}R` : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={(v) => getDataMonthTrade(v)}
              month={month}
              className="rounded-lg border shadow-sm p-2 mt-3"
              modifiers={{
                dayProfit: Object.keys(profitByDate)
                  .filter((d) => profitByDate[d] > 0)
                  .map((d) => parseISO(d)),
                dayLoss: Object.keys(profitByDate)
                  .filter((d) => profitByDate[d] < 0)
                  .map((d) => parseISO(d)),
                // hasBoth: allTodos
                //   .filter((t) => {
                //     const sameDay = allTodos.filter((tt) => tt.formatDate === t.formatDate);
                //     return sameDay.some((tt) => tt.done) && sameDay.some((tt) => !tt.done);
                //   })
                //   .map((t) => parseISO(t.formatDate)),
              }}
              modifiersClassNames={{
                dayProfit: 'day-profit',
                dayLoss: 'day-loss',
                // hasBoth: 'day-has-both',
              }}
            /> */}
            <CustomDayPicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              profitByDate={profitByDate}
              month={month}
              getDataMonthTrade={getDataMonthTrade}
            />
            {/* <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Profit Day
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span> Loss Day
              </span>
            </div> */}

            {/* <h2 className="mt-4 font-semibold">
              {`${tradesOfSelectedDate.length} ${tradesOfSelectedDate.length > 1 ? 'trades' : 'trade'}`}{' '}
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '...'} ({winrateByDate}% ·{' '}
              {rewardOfDay}R)
            </h2> */}
            <motion.div
              key={selectedDate ? selectedDate.toISOString() : 'no-date'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              // className="bg-[#1e293b] rounded-xl px-4 py-3 mt-3 text-white shadow-sm flex items-center justify-between w-full"
              className={cx(
                'rounded-xl px-4 py-3 mt-3 shadow-sm flex items-center justify-between w-full',
                {
                  'bg-[#f0efef]': theme === 'light',
                  'bg-[#1e293b]': theme === 'dark',
                },
              )}
            >
              {/* Ngày */}
              <div className="flex flex-col items-start">
                <p
                  className={cx('text-xs', {
                    'text-black': theme === 'light',
                    'text-gray-400': theme === 'dark',
                  })}
                >
                  Date
                </p>
                <p className="text-[#0b71d6] text-base font-semibold">
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '—'}
                </p>
              </div>

              {/* Số trade */}
              <div className="flex flex-col items-center">
                <p
                  className={cx('text-xs', {
                    'text-black': theme === 'light',
                    'text-gray-400': theme === 'dark',
                  })}
                >
                  Trades
                </p>
                <p className="text-[#0b71d6] text-base font-semibold">
                  {tradesOfSelectedDate.length}{' '}
                  {tradesOfSelectedDate.length > 1 ? 'trades' : 'trade'}
                </p>
              </div>

              {/* Winrate & Reward */}
              <div className="flex flex-col items-end">
                <p
                  className={cx('text-xs', {
                    'text-black': theme === 'light',
                    'text-gray-400': theme === 'dark',
                  })}
                >
                  Winrate
                </p>
                <p className="text-base font-semibold">
                  <span
                    className={
                      rewardOfDay === 0
                        ? 'text-blue-500'
                        : rewardOfDay > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                    }
                  >
                    {winrateByDate}%
                  </span>{' '}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p
                  className={cx('text-xs', {
                    'text-black': theme === 'light',
                    'text-gray-400': theme === 'dark',
                  })}
                >
                  Reward
                </p>
                <p className="text-base font-semibold">
                  <span
                    className={
                      rewardOfDay === 0
                        ? 'text-blue-500'
                        : rewardOfDay > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                    }
                  >
                    {rewardOfDay}R
                  </span>
                </p>
              </div>
            </motion.div>

            <div className="space-y-3 w-full mt-3">
              <TradeList
                trades={tradesOfSelectedDate}
                onDelete={deleteTrade}
                handleOpenTrade={handleOpenTrade}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 3 - PLAN */}
        {/* <TabsContent value="plan" className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            <p>
              <strong>Type:</strong> {planData.type}
            </p>
            <p>
              <strong>Identity:</strong> {planData.identity}
            </p>
            <p>
              <strong>Profit:</strong> {planData.profit}$
            </p>
            <p>
              <strong>Plan:</strong> {planData.plan || '-'}
            </p>
            <p>
              <strong>Target:</strong> {planData.target || '-'}
            </p>
            <p>
              <strong>Risk:</strong> {planData.risk}%
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full mt-3">
                  <Pencil size={16} className="mr-2" /> Edit Plan
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Trading Plan</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <Select
                    value={planData.type}
                    onValueChange={(v) => setPlanData({ ...planData, type: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRADING">Trading</SelectItem>
                      <SelectItem value="POKER">Poker</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={planData.identity}
                    onValueChange={(v) => setPlanData({ ...planData, identity: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Identity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REAL">Real</SelectItem>
                      <SelectItem value="DEMO">Demo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={planData.plan}
                    onChange={(e) => setPlanData({ ...planData, plan: e.target.value })}
                    placeholder="Plan"
                  />
                  <Input
                    value={planData.target}
                    onChange={(e) => setPlanData({ ...planData, target: e.target.value })}
                    placeholder="Target"
                  />
                  <Input
                    type="number"
                    value={planData.risk}
                    onChange={(e) => setPlanData({ ...planData, risk: Number(e.target.value) })}
                    placeholder="Risk %"
                  />
                </div>

                <DialogFooter>
                  <Button onClick={handleSavePlan} className="w-full">
                    <Save size={16} className="mr-2" /> Save Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent> */}
        <TabsContent value="plan" className="flex-1 overflow-y-auto pb-12">
          <PlanSettings
            planData={planData}
            getUserSettingTrading={getUserSettingTrading}
            handleSavePlan={handleSavePlan}
          />
          <div className="mt-8">
            <p className="mb-3 font-bold text-xl">Images</p>
            <ImagesTab theme={theme} type="TRADING" active={tab === 'plan'} />
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL ADD/EDIT TRADE */}
      <Dialog open={isOpenTradeModal} onOpenChange={setIsOpenTradeModal}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-h-[90vh] overflow-y-auto max-w-[100vh]"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Trade' : 'Add New Trade'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* Symbol */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Symbol *</Label>
              <Input
                placeholder="e.g. BTCUSD"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              />
            </div>

            {/* lots */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Lots *</Label>
              <Input
                placeholder="e.g. 0.5"
                value={formData.lots}
                onChange={(e) => setFormData({ ...formData, lots: e.target.value })}
              />
            </div>

            {/* Entry Price */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Entry Price *</Label>
              <Input
                // placeholder="Entry price"
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
              />
            </div>

            {/* Close Price */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Close Price</Label>
              <Input
                // placeholder="Close price"
                value={formData.closePrice}
                onChange={(e) => setFormData({ ...formData, closePrice: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Stop Loss *</Label>
              <Input
                // placeholder="Stop Loss"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Take Profit</Label>
              <Input
                // placeholder="Take Profit"
                value={formData.takeProfit}
                onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
              />
            </div>

            {/* Entry Time */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Entry Time *</Label>
              <Datetime
                value={formData.entryTime ? moment(formData.entryTime) : undefined}
                onChange={(v) => setFormData({ ...formData, entryTime: moment(v).toDate() })}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-sm transition-colors md:text-sm date-time"
              />
            </div>

            {/* Close Time */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Close Time</Label>
              <Datetime
                value={formData.closeTime ? moment(formData.closeTime) : undefined}
                onChange={(v) => setFormData({ ...formData, closeTime: moment(v).toDate() })}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-sm transition-colors md:text-sm date-time close-time"
              />
            </div>

            {/* Trade Side */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Trade Side *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.tradeSide === 'BUY' ? 'default' : 'outline'}
                  className={`flex-1 ${
                    formData.tradeSide === 'BUY' ? 'bg-green-500 hover:bg-green-600 text-white' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, tradeSide: 'BUY' })}
                >
                  BUY
                </Button>
                <Button
                  type="button"
                  variant={formData.tradeSide === 'SELL' ? 'default' : 'outline'}
                  className={`flex-1 ${
                    formData.tradeSide === 'SELL' ? 'bg-red-500 hover:bg-red-600 text-white' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, tradeSide: 'SELL' })}
                >
                  SELL
                </Button>
              </div>
            </div>

            {/* Result */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Result (USD)</Label>
              <Input
                placeholder="$"
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Closed By</Label>
              {/* <Input
                // placeholder="Closed By"
                value={formData.closedBy}
                onChange={(e: any) => setFormData({ ...formData, closedBy: e.target.value })}
              /> */}
              <Select
                value={closeBy || ''}
                onValueChange={(val) => {
                  setCloseBy((prev: any) => (prev === val ? undefined : val));
                  setFormData({
                    ...formData,
                    closedBy: formData.closeBy === val ? undefined : val,
                  });
                }}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Close By" />
                </SelectTrigger>
                <SelectContent>
                  {closeByList.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                      onClick={(e) => {
                        // Dừng propagation để đảm bảo sự kiện được bắt
                        e.stopPropagation();
                        setFormData({
                          ...formData,
                          closeBy: formData.closeBy === p.value && undefined,
                        });
                        // setCloseBy((prev: any) => prev === p.value && undefined);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{p.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Rating</Label>
              <Rate
                onChange={(value) => {
                  // setRating(value);
                  setFormData({ ...formData, rating: value });
                }}
                value={formData.rating}
                className={cx(`${theme === 'dark' && 'rating-dark'}`)}
                // className="bg-blue-400 h-4"
                // onChange={(e: any) => setFormData({ ...formData, rating: e.target.value })}
              />
            </div>
          </div>

          {/* Thought */}
          <div className="mt-2">
            <Label className="text-sm font-medium mb-1 block">Your Thought</Label>
            <Textarea
              placeholder="Your thought..."
              value={formData.yourThought}
              onChange={(e) => setFormData({ ...formData, yourThought: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center mb-3">
            {/* Image Preview Grid */}
            <div className="flex gap-4 flex-wrap">
              {previewURLs.map((url, idx) => (
                <div key={idx} className="relative">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bordertransition cursor-pointer">
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      onClick={() => setSelectedImage(url)}
                    />
                  </div>

                  {/* nút xóa */}
                  <button
                    onClick={() => handleRemove(idx)}
                    className={cx(
                      'absolute -top-2 -right-2  rounded-full w-4 h-4 text-xs flex items-center justify-center cursor-pointer',
                      theme === 'dark' ? 'bg-gray-500' : 'bg-white',
                    )}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* + Upload box */}
              <label className="w-20 h-20 flex items-center justify-center rounded-xl border-1 border-dashed border-gray-300 cursor-pointer hover:border-gray-500">
                <span className="text-gray-500 font-bold">+ Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectImages}
                  className="hidden!"
                />
              </label>

              {/* Image Preview Modal */}
              <AnimatePresence>
                {selectedImage && (
                  <motion.div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                  >
                    <motion.img
                      src={selectedImage}
                      className="max-w-[80%] max-h-[80%] rounded-lg shadow-xl"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nút upload đến server */}
            <button
              type="button"
              className={cx(
                'text-xs p-2 cursor-pointer rounded-lg font-semibold transition text-white',
                theme === 'dark'
                  ? 'bg-indigo-400 hover:bg-indigo-700'
                  : 'bg-blue-400 hover:bg-indigo-600',
                localImages.length === 0 && 'bg-gray-400 hover:bg-gray-400!',
              )}
              onClick={uploadToServer}
              disabled={localImages.length === 0}
            >
              Upload
            </button>
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} className="w-full mt-4">
              {isEdit ? 'Save Trade' : 'Add Trade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const closeByList = [
  { label: 'Stop Loss', value: 'SL' },
  { label: 'Take Profit', value: 'TP' },
  { label: 'Break Even', value: 'BE' },
  { label: 'Manually', value: 'MA' },
  { label: 'Stop Out', value: 'SO' },
];
