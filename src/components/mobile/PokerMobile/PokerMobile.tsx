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
import { Rate, Tag } from 'antd';
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
import PokerList from './common/PokerList';

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

  const totalResultOfDay = useMemo(() => {
    return sessionsOfSelectedDate.reduce((acc, s) => acc + (s.result || 0), 0);
  }, [sessionsOfSelectedDate]);

  // ==== PLAN ====
  const [planData, setPlanData] = useState({
    type: 'POKER',
    identity: 'REAL',
    profit: 0,
    plan: '',
    target: '',
    risk: 2,
  });

  return (
    <div className="h-full flex flex-col bg-background text-foreground px-3 pt-3 pb-16">
      <h1 className="text-xl font-bold mb-5 text-center">🎰 Poker Mobile Dashboard</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>

        {/* TAB 1 - SESSIONS */}
        <TabsContent value="sessions" className="flex-1 overflow-y-auto">
          <div className="flex justify-between mb-3">
            <Button onClick={() => handleOpenSession()} className="w-full">
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
            <div className="flex gap-2">
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
            </div>

            <CustomDayPicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              profitByDate={profitByDate}
              month={month}
              getDataMonthTrade={getDataMonthSession}
            />

            <h2 className="mt-4 font-semibold">
              {`${sessionsOfSelectedDate.length} session${
                sessionsOfSelectedDate.length > 1 ? 's' : ''
              }`}{' '}
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '...'} ({totalResultOfDay}$)
            </h2>
            <div className="space-y-3 w-full mt-3">
              <PokerList
                sessions={sessions}
                onDelete={deletePokerSession}
                handleOpenSession={handleOpenSession}
              />
            </div>
          </div>
        </TabsContent>

        {/* TAB 3 - PLAN */}
        <TabsContent value="plan" className="flex-1 overflow-y-auto">
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
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL ADD/EDIT SESSION */}
      <Dialog open={isOpenModal} onOpenChange={setIsOpenModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[100vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Session' : 'Add New Poker Session'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Blind *</Label>
              <Input
                placeholder="e.g. 1/2"
                value={formData.blind}
                onChange={(e) => setFormData({ ...formData, blind: e.target.value })}
              />
            </div>

            <div>
              <Label>Format *</Label>
              <Input
                placeholder="e.g. 8-max, straddle"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              />
            </div>

            <div>
              <Label>Total Before *</Label>
              <Input
                type="number"
                value={formData.totalBefore}
                onChange={(e) => setFormData({ ...formData, totalBefore: e.target.value })}
              />
            </div>

            <div>
              <Label>Total After</Label>
              <Input
                type="number"
                value={formData.totalAfter}
                onChange={(e) => setFormData({ ...formData, totalAfter: e.target.value })}
              />
            </div>

            <div>
              <Label>Start Time *</Label>
              <Datetime
                value={formData.startTime ? moment(formData.startTime) : undefined}
                onChange={(v) => setFormData({ ...formData, startTime: moment(v).toDate() })}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-sm transition-colors md:text-sm date-time"
              />
            </div>

            <div>
              <Label>End Time</Label>
              <Datetime
                value={formData.endTime ? moment(formData.endTime) : undefined}
                onChange={(v) => setFormData({ ...formData, endTime: moment(v).toDate() })}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-base shadow-sm transition-colors md:text-sm date-time close-time"
              />
            </div>

            <div>
              <Label>Result ($)</Label>
              <Input
                type="number"
                value={formData.result}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              />
            </div>

            <div>
              <Label>Rating</Label>
              <Rate
                onChange={(v) => setFormData({ ...formData, rating: v })}
                value={formData.rating}
                className={cx(`${theme === 'dark' && 'rating-dark'}`)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Your Thought</Label>
            <Textarea
              placeholder="Thoughts about your session..."
              value={formData.yourThought}
              onChange={(e) => setFormData({ ...formData, yourThought: e.target.value })}
            />
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
