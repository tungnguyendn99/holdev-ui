'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Pencil,
  Save,
  Target,
  Flame,
  User2,
  Badge,
  ShieldAlert,
  Monitor,
} from 'lucide-react';
import clsx from 'clsx';
import cx from 'classnames';
import { Tag } from 'antd';
import { useTheme } from 'next-themes';

export default function PlanSettings({ planData, getUserSettingTrading, handleSavePlan }: any) {
  // const [planData, setPlanData] = useState<any>(null);
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  console.log('planData', planData);
  useEffect(() => {
    // Fetch plan data from API or props
    // For demo, we assume planData is passed as prop
    getUserSettingTrading();
    if (planData) {
      setIsEdit(true);
    } else {
      setIsEdit(false);
    }
  }, []);

  const handleSubmitPlan = async (data: any) => {
    await handleSavePlan(data, isEdit);
    setOpen(false);
  };

  return (
    <div className="relative flex flex-col flex-1">
      <div className="space-y-4">
        {!planData ? (
          // ✅ Chưa có plan
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-muted rounded-xl flex flex-col items-center justify-center"
          >
            <p className="text-sm text-muted-foreground mb-3">
              You don’t have any trading plan yet.
            </p>
            <Dialog
              open={open}
              onOpenChange={() => {
                setOpen(true);
                setIsEdit(false);
              }}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} /> Create Plan
                </Button>
              </DialogTrigger>
              <PlanDialog planData={planData} onSave={handleSubmitPlan} />
            </Dialog>
          </motion.div>
        ) : (
          // ✅ Đã có plan
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Thông tin tổng quan */}
            {/* <div className="p-4 flex flex-col items-start text-sm space-y-1">
              <p>
                <strong>Identity:</strong>{' '}
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded text-xs font-semibold',
                    planData.identity === 'REAL'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700',
                  )}
                >
                  {planData.identity}
                </span>
              </p>
              <p>
                <strong>Monthly Target:</strong>{' '}
                <span className="text-purple-500 font-semibold">{planData?.monthlyTarget} USD</span>
              </p>
              <p>
                <strong>Risk:</strong>{' '}
                <span className="text-orange-500 font-semibold">{planData?.risk}$</span>
              </p>
            </div> */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cx(
                'w-full font-semibold rounded-2xl bg-gradient-to-br from-[#3a3554] to-[#29293a] p-4 shadow-md',
                {
                  'from-[#706cdd] to-[#313f67] text-gray-200': theme === 'light',
                  'from-[#3a3554] to-[#29293a] text-white': theme === 'dark',
                },
              )}
              // className="w-full rounded-2xl bg-linear-to-br from-white to-gray-50 text-gray-900 p-4 shadow-md"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {/* <Target size={16} /> */}
                  <Monitor size={16} />
                  <span className="text-xs uppercase tracking-wide">Category</span>
                </div>
                <span className="text-blue-400 font-semibold text-base">{planData?.type}</span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <User2 size={16} />
                  <span className="text-xs uppercase tracking-wide">Identity</span>
                </div>
                <Tag color="geekblue" className="font-bold px-2! py-px! leading-none!">
                  {planData?.identity}
                </Tag>
              </div>

              {/* <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span className="text-xs uppercase tracking-wide">Risk</span>
                </div>
                <span className="text-orange-400 font-semibold text-base">{planData?.risk}$</span>
              </div> */}
            </motion.div>

            {/* My Goal Section */}
            <Card
              // className="p-5 bg-[#273047] text-white rounded-2xl shadow-md relative"
              className={cx('p-5 rounded-2xl shadow-md relative', {
                'bg-[white] text-[#1c2e54]': theme === 'light',
                'bg-[#273047] text-white': theme === 'dark',
              })}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target
                    // className="text-purple-400"
                    className={cx({
                      'text-blue-500': theme === 'light',
                      'text-purple-400': theme === 'dark',
                    })}
                    size={20}
                  />
                  <h3 className="font-semibold text-base">
                    {planData.plan || 'No specific plan yet.'}
                  </h3>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button
                      // className="bg-black/20 p-2 rounded-full hover:bg-black/30"
                      className={cx('p-2 rounded-full hover:bg-black/30', {
                        'text-blue-500 bg-blue-100': theme === 'light',
                        'bg-black/20': theme === 'dark',
                      })}
                    >
                      <Pencil size={16} />
                    </button>
                  </DialogTrigger>
                  <PlanDialog planData={planData} onSave={handleSavePlan} />
                </Dialog>
              </div>
              <div className="flex justify-between">
                <div>
                  <p
                    // className="text-sm text-indigo-700 mb-1"
                    className={cx('mb-1', {
                      'text-indigo-700': theme === 'light',
                      'text-purple-400': theme === 'dark',
                    })}
                  >
                    Monthly Target
                  </p>
                  <p className="text-2xl font-bold text-purple-400 mb-3">
                    {planData?.monthTarget?.toFixed(0)} USD
                  </p>
                </div>
                <div>
                  <p
                    className={cx('mb-1', {
                      'text-indigo-700': theme === 'light',
                      'text-purple-400': theme === 'dark',
                    })}
                  >
                    Just earning each trading day
                  </p>
                  <p className="text-2xl font-bold text-purple-400 mb-3">
                    {planData?.dayTarget?.toFixed(0)} USD
                  </p>
                </div>
              </div>
              {/* <p className="text-sm text-purple-300 mb-1">Monthly Target</p>
              <p className="text-2xl font-bold text-purple-400 mb-3">
                {planData?.monthTarget?.toFixed(0)} USD
              </p>

              <p className="text-sm text-purple-300 mb-1">Just earning each trading day</p>
              <p className="text-2xl font-bold text-purple-400 mb-3">
                {planData?.dayTarget?.toFixed(0)} USD
              </p> */}

              {/* <div className="space-y-1 text-sm text-gray-300">
                <p>{planData.plan || 'No specific plan yet.'}</p>
                <p className="text-purple-400 mt-2 cursor-pointer">+ Add a new rule</p>
              </div> */}
            </Card>

            {/* Risk Management Section */}
            <Card
              // className="p-5 bg-[#273047] text-white rounded-2xl shadow-md relative"
              className={cx('p-5 rounded-2xl shadow-md relative', {
                'bg-[white] text-[#1c2e54]': theme === 'light',
                'bg-[#273047] text-white': theme === 'dark',
              })}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="text-purple-400" size={20} />
                  <h3 className="font-semibold text-base">Risk Management</h3>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button
                      className={cx('p-2 rounded-full hover:bg-black/30', {
                        'text-blue-500 bg-blue-100': theme === 'light',
                        'bg-black/20': theme === 'dark',
                      })}
                    >
                      <Pencil size={16} />
                    </button>
                  </DialogTrigger>
                  <PlanDialog planData={planData} onSave={handleSavePlan} />
                </Dialog>
              </div>

              <div className="flex justify-between text-sm text-gray-300 mb-3">
                <div>
                  <p
                    // className="text-xs uppercase tracking-wide"
                    // className="text-sm text-purple-300 mb-1 uppercase"
                    className={cx('text-sm mb-1 uppercase', {
                      'text-indigo-700': theme === 'light',
                      'text-purple-400': theme === 'dark',
                    })}
                  >
                    Minimum Risk:Reward
                  </p>
                  <p className="text-purple-400 font-bold">1 : 2</p>
                </div>
                <div>
                  <p
                    className={cx('text-sm mb-1 uppercase', {
                      'text-indigo-700': theme === 'light',
                      'text-purple-400': theme === 'dark',
                    })}
                  >
                    Risk per trade
                  </p>
                  <p className="text-purple-400 font-bold">{planData.risk} USD</p>
                </div>
              </div>

              <div
                // className="flex flex-col gap-2 space-y-1 text-sm text-gray-300"
                className={cx('flex flex-col gap-2 space-y-1 text-sm', {
                  'text-gray-800': theme === 'light',
                  'text-gray-300': theme === 'dark',
                })}
              >
                <div>
                  <p
                    // className="text-sm mb-1 uppercase"
                    className={cx('flex flex-col gap-2 space-y-1 text-sm', {
                      'text-purple-700': theme === 'light',
                      'text-purple-300': theme === 'dark',
                    })}
                  >
                    Rule
                  </p>
                  {planData.rule ? (
                    <p className="whitespace-pre-wrap">{planData.rule}</p>
                  ) : (
                    <p className="italic text-gray-500">No risk rules defined.</p>
                  )}
                </div>
                <div>
                  <p
                    className={cx('flex flex-col gap-2 space-y-1 text-sm', {
                      'text-purple-700': theme === 'light',
                      'text-purple-300': theme === 'dark',
                    })}
                  >
                    Note
                  </p>
                  {planData.note && <p className="whitespace-pre-wrap">{planData.note}</p>}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* ✅ Button fixed ở cuối */}
      {/* <div className="fixed bottom-0 left-0 right-0 px-4 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-background via-background/95 to-transparent pt-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="btn-theme w-full h-12 text-base font-semibold">
              {isEdit ? (
                <>
                  <Pencil size={18} className="mr-2" /> Edit Plan
                </>
              ) : (
                <>
                  <Plus size={18} className="mr-2" /> Create Plan
                </>
              )}
            </Button>
          </DialogTrigger>
          <PlanDialog planData={planData} onSave={handleSubmitPlan} />
        </Dialog>
      </div> */}
    </div>
  );
}

/* 🧱 Component: Dialog form để tạo / chỉnh sửa Plan */
function PlanDialog({ planData, onSave }: any) {
  const initialData = planData || {
    identity: 'REAL',
    // monthlyTarget: '',
    plan: '',
    // risk: '',
    rule: '',
    note: '',
  };

  const [localData, setLocalData] = useState<any>(planData);

  return (
    <DialogContent className="max-w-11/12 md:max-w-5/12 md:h-[60%]">
      <DialogHeader>
        <DialogTitle>{planData ? 'Edit Trading Plan' : 'Create Trading Plan'}</DialogTitle>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <Select
          value={localData?.identity}
          onValueChange={(v) => setLocalData({ ...localData, identity: v })}
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
          type="number"
          value={localData?.monthTarget}
          onChange={(e) => setLocalData({ ...localData, monthTarget: Number(e.target.value) })}
          placeholder="Monthly Target ($)"
        />

        <Input
          type="number"
          value={localData?.risk}
          onChange={(e) => setLocalData({ ...localData, risk: e.target.value })}
          placeholder="Risk (R)"
        />

        <Input
          value={localData?.plan}
          onChange={(e) => setLocalData({ ...localData, plan: e.target.value })}
          placeholder="Plan description"
        />

        {/* <Input
          value={localData.rule}
          onChange={(e) => setLocalData({ ...localData, rule: e.target.value })}
          placeholder="Rule"
        /> */}
        <Textarea
          placeholder="Rule"
          value={localData?.rule}
          onChange={(e) => setLocalData({ ...localData, rule: e.target.value })}
          rows={6}
        />

        {/* <Input
          value={localData.note}
          onChange={(e) => setLocalData({ ...localData, note: e.target.value })}
          placeholder="Note"
        /> */}
        <Textarea
          placeholder="Note"
          value={localData?.note}
          onChange={(e) => setLocalData({ ...localData, note: e.target.value })}
          rows={6}
        />
      </div>

      <DialogFooter>
        <Button
          onClick={() => {
            // setPlanData(localData);
            onSave(localData);
          }}
          className="btn-theme w-full"
        >
          <Save size={16} className="mr-2" /> Save Plan
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
