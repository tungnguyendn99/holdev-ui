'use client';
import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Plus, Save } from 'lucide-react';
import { notification, Rate, Tag } from 'antd';
import { useTheme } from 'next-themes';
import moment from 'moment';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { format, parseISO } from 'date-fns';
import cx from 'classnames';

import API from '../../../utils/api';
import { openNotification } from '../../../common/utils.notification';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { hideLoading, showLoading } from '../../../store/slices/user.slice';
import CustomDayPicker from '../UI/CustomDatePicker';
import { Textarea } from '@/components/ui/textarea';
import PokerList from './PokerList';
import { AnimatePresence, motion } from 'framer-motion';
import PlanSettings from './Plan';
import { ImagesTab } from '../../desktop/User/Images';

export default function PokerMobile() {
  const { theme } = useTheme();
  const [tab, setTab] = useState<'sessions' | 'calendar' | 'plan'>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [month, setMonth] = useState<any>(moment().toDate());
  const [dataMonth, setDataMonth] = useState<any>({});

  const dispatch = useAppDispatch();
  const [api, contextHolder] = notification.useNotification();

  // ==== FETCH DATA ====
  const getRecentSessions = async () => {
    try {
      dispatch(showLoading());
      const { data } = await API.post('/poker/list', { mode: 'year' });
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const getDataMonthSession = async (time?: any) => {
    try {
      dispatch(showLoading());
      setMonth(moment(time).toDate());
      const { data } = await API.post('/poker/group', {
        mode: 'month',
        group: 'month',
        dateString: time ? moment(time).format('YYYY-MM') : moment().format('YYYY-MM'),
      });
      setDataMonth(data[moment(time).format('YYYY-MM')]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getRecentSessions();
    getDataMonthSession();
  }, []);

  const syncPageData = async () => {
    await Promise.all([getRecentSessions(), getDataMonthSession()]);
  };

  // ==== MODAL FORM ====
  const [formData, setFormData] = useState<any>({
    blind: '',
    format: '',
    totalBefore: '',
    totalAfter: '',
    startTime: new Date(),
    endTime: undefined,
    result: '',
    rating: 0,
    yourThought: '',
  });

  const handleOpenSession = (session?: any) => {
    if (session) {
      setIsEdit(true);
      setSelectedSession(session);
      setFormData({
        ...session,
        startTime: moment(session.startTime).toDate(),
        endTime: session.endTime ? moment(session.endTime).toDate() : undefined,
      });
      setPreviewURLs(session.images);
    } else {
      setIsEdit(false);
      setFormData({
        blind: '',
        format: '',
        totalBefore: '',
        totalAfter: '',
        startTime: new Date(),
        endTime: undefined,
        result: '',
        rating: 0,
        yourThought: '',
      });
    }
    setIsOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      dispatch(showLoading());
      if (isEdit) {
        await API.post('/poker/update', { id: selectedSession.id, ...formData });
      } else {
        await API.post('/poker/add-session', formData);
      }
      setIsOpenModal(false);
      getRecentSessions();
    } catch {
      openNotification('error', { message: 'Lỗi khi lưu poker session' });
    } finally {
      dispatch(hideLoading());
    }
  };

  const deletePokerSession = async (id: string) => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      await API.delete(`/poker/${id}`);
      getRecentSessions();
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  // ==== CALENDAR ====
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const profitByDate = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      const date = moment(s.endTime || s.startTime).format('YYYY-MM-DD');
      map[date] = (map[date] || 0) + (s.result || 0);
    });
    return map;
  }, [sessions]);

  const sessionsOfSelectedDate = sessions.filter(
    (s) => moment(s.endTime).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD'),
  );

  // const totalResultOfDay = useMemo(() => {
  //   return sessionsOfSelectedDate.reduce((acc, s) => acc + (s.result || 0), 0);
  // }, [sessionsOfSelectedDate]);

  const totalHandsOfDay = useMemo(() => {
    return sessionsOfSelectedDate.reduce((acc, s) => acc + (s.hands || 0), 0);
  }, [sessionsOfSelectedDate]);

  const winrateByDate = useMemo(() => {
    const totalHands = sessionsOfSelectedDate.reduce((sum, s) => sum + s.hands, 0);
    const totalResultBB = sessionsOfSelectedDate.reduce((sum, s) => sum + s.resultBB, 0);

    if (totalHands === 0) return 0;

    const winrate = (totalResultBB / totalHands) * 100;

    return Math.round(winrate);
  }, [sessionsOfSelectedDate]);

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
  }, [isOpenModal]);

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
        type: 'POKER',
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
        await API.post('/users/update-setting', { ...data });
      } else {
        await API.post('/users/setting', { ...data, type: 'POKER' });
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
      <h1 className="text-xl font-bold mb-5 text-center">📚 Poker Journey</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="sessions" className="font-bold">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="calendar" className="font-bold">
            Stats
          </TabsTrigger>
          <TabsTrigger value="plan" className="font-bold">
            Plan
          </TabsTrigger>
        </TabsList>

        {/* TAB 1 - SESSIONS */}
        <TabsContent value="sessions" className="flex-1 overflow-y-auto">
          <div className="flex justify-between mb-3">
            <Button
              onClick={() => {
                handleOpenSession();
                setPreviewURLs([]);
              }}
              className="w-full"
            >
              <Plus size={20} className="mr-2" /> Add Session
            </Button>
          </div>

          {/* TODO: Session list component here */}
          <PokerList
            sessions={sessions}
            onDelete={deletePokerSession}
            handleOpenSession={handleOpenSession}
          />
        </TabsContent>

        {/* TAB 2 - CALENDAR */}
        <TabsContent value="calendar" className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center">
            {/* <div className="flex gap-2">
              <p>
                <span className="font-semibold mr-1">Monthly Stats:</span>
                <Tag color="green" style={{ fontSize: '18px' }}>
                  {dataMonth?.profit}
                </Tag>
              </p>
              <button
                onClick={syncPageData}
                className="w-20 h-6 bg-indigo-500 text-blue-50 rounded-lg cursor-pointer hover:opacity-90"
              >
                Sync
              </button>
            </div> */}
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
                      dataMonth?.dayProfit ? 'text-green-400' : 'text-red-400'
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
                    Sessions
                  </p>
                  <p
                    className={cx(`text-lg font-semibold`, {
                      'text-white': theme === 'dark',
                      'text-[#0b71d6]': theme === 'light',
                    })}
                  >
                    {dataMonth?.count ? dataMonth?.count : '--'}
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
                    Hands
                  </p>
                  <p
                    className={cx(`text-lg font-semibold`, {
                      'text-white': theme === 'dark',
                      'text-[#0b71d6]': theme === 'light',
                    })}
                  >
                    {dataMonth?.hands ?? '--'}
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
                    className={cx(`text-sm mt-1 font-semibold`, {
                      'text-white': theme === 'dark',
                      'text-[#0b71d6]': theme === 'light',
                    })}
                  >
                    {dataMonth?.winrate ?? '--'}
                  </p>
                </div>
              </div>
            </div>

            <CustomDayPicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              profitByDate={profitByDate}
              month={month}
              getDataMonthTrade={getDataMonthSession}
            />

            {/* <h2 className="mt-4 font-semibold">
              {`${sessionsOfSelectedDate.length} session${
                sessionsOfSelectedDate.length > 1 ? 's' : ''
              }`}{' '}
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '...'} ({totalResultOfDay}$)
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
                <p
                  className={cx(`text-base font-semibold `, {
                    'text-black': theme === 'light',
                    'text-[#0b71d6]': theme === 'dark',
                  })}
                >
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
                  Sessions
                </p>
                <p
                  className={cx(`text-base font-semibold`, {
                    'text-white': theme === 'dark',
                    'text-[#0b71d6]': theme === 'light',
                  })}
                >
                  {sessionsOfSelectedDate.length}{' '}
                  {sessionsOfSelectedDate.length > 1 ? 'sessions' : 'session'}
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
                  Hands
                </p>
                <p
                  className={cx(`text-base font-semibold`, {
                    'text-white': theme === 'dark',
                    'text-[#0b71d6]': theme === 'light',
                  })}
                >
                  {totalHandsOfDay}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p
                  className={cx('text-xs', {
                    'text-black': theme === 'light',
                    'text-gray-400': theme === 'dark',
                  })}
                >
                  Winrate
                </p>
                <p
                  className={cx(`text-base font-semibold`, {
                    'text-white': theme === 'dark',
                    'text-[#0b71d6]': theme === 'light',
                  })}
                >
                  {winrateByDate}bb/100
                </p>
              </div>
            </motion.div>

            <div className="space-y-3 w-full mt-3">
              <PokerList
                sessions={sessionsOfSelectedDate}
                onDelete={deletePokerSession}
                handleOpenSession={handleOpenSession}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 3 - PLAN */}
        <TabsContent value="plan" className="flex-1 overflow-y-auto">
          {/* <div className="space-y-3">
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
                  <DialogTitle>Edit Poker Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
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
                  <Button onClick={() => {}} className="w-full">
                    <Save size={16} className="mr-2" /> Save Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div> */}
          <PlanSettings
            planData={planData}
            getUserSettingTrading={getUserSettingTrading}
            handleSavePlan={handleSavePlan}
          />
          <div className="mt-8">
            <p className="mb-3 font-bold text-xl">Images</p>
            <ImagesTab theme={theme} type="POKER" active={tab === 'plan'} />
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL ADD/EDIT SESSION */}
      <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-h-[90vh] overflow-y-auto max-w-[100vh]"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Session' : 'Add New Poker Session'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Blind *</Label>
              <Input
                placeholder="e.g. 1/2"
                value={formData.blind}
                onChange={(e) => setFormData({ ...formData, blind: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Format *</Label>
              <Input
                placeholder="e.g. 8-max, straddle"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Total Before *</Label>
              <Input
                type="number"
                value={formData.totalBefore}
                onChange={(e) => setFormData({ ...formData, totalBefore: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Total After</Label>
              <Input
                type="number"
                value={formData.totalAfter}
                onChange={(e) => setFormData({ ...formData, totalAfter: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Start Time *</Label>
              <Datetime
                value={formData.startTime ? moment(formData.startTime) : undefined}
                onChange={(v) => setFormData({ ...formData, startTime: moment(v).toDate() })}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-sm transition-colors md:text-sm date-time"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">End Time</Label>
              <Datetime
                value={formData.endTime ? moment(formData.endTime) : undefined}
                onChange={(v) => setFormData({ ...formData, endTime: moment(v).toDate() })}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-sm transition-colors md:text-sm date-time close-time"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Result ($)</Label>
              <Input
                type="number"
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">Rating</Label>
              <Rate
                onChange={(v) => setFormData({ ...formData, rating: v })}
                value={formData.rating}
                className={cx(`${theme === 'dark' && 'rating-dark'}`)}
              />
            </div>
          </div>
          <div className="mt-2">
            <Label className="text-sm font-medium mb-1 block">Your Thought</Label>
            <Textarea
              placeholder="Thoughts about your session..."
              value={formData.yourThought}
              onChange={(e) => setFormData({ ...formData, yourThought: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex justify-between items-center mb-3">
            {/* Image Preview Grid */}
            <div className="flex gap-4 flex-wrap">
              {previewURLs.map((url, idx) => (
                <div key={idx} className="relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bordertransition cursor-pointer">
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
              <label className="w-12 h-12 flex items-center justify-center rounded-xl border-1 border-dashed border-gray-300 cursor-pointer hover:border-gray-500">
                <span className="text-gray-500 font-bold text-[10px]">+ Upload</span>
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
                    className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}
                  >
                    <div className="max-h-[85%] max-w-[90vw] overflow-auto">
                      <motion.img
                        key={selectedImage}
                        src={selectedImage}
                        // className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
                        className="w-auto max-w-full h-auto max-h-none rounded-lg shadow-xl"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                      />
                    </div>
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
              {isEdit ? 'Save Session' : 'Add Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
