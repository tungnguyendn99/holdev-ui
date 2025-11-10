'use client';

import { useState } from 'react';
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
import { Plus, Pencil, Save, Target, Flame } from 'lucide-react';
import clsx from 'clsx';

export default function PlanSettings() {
  const [planData, setPlanData] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleSavePlan = () => {
    if (!planData) return;
    setOpen(false);
  };

  return (
    <div className="relative flex flex-col flex-1 overflow-y-auto h-full pb-24">
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} /> Create Plan
                </Button>
              </DialogTrigger>
              <PlanDialog planData={planData} setPlanData={setPlanData} onSave={handleSavePlan} />
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
            <div className="p-4 flex flex-col items-start text-sm space-y-1">
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
                <span className="text-purple-500 font-semibold">{planData.monthlyTarget} USD</span>
              </p>
              <p>
                <strong>Risk:</strong>{' '}
                <span className="text-orange-500 font-semibold">{planData.risk}%</span>
              </p>
            </div>

            {/* My Goal Section */}
            <Card className="p-5 bg-[#1E1B2E] text-white rounded-2xl shadow-md relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="text-purple-400" size={20} />
                  <h3 className="font-semibold text-base">My Goal</h3>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="bg-black/20 p-2 rounded-full hover:bg-black/30">
                      <Pencil size={16} />
                    </button>
                  </DialogTrigger>
                  <PlanDialog
                    planData={planData}
                    setPlanData={setPlanData}
                    onSave={handleSavePlan}
                  />
                </Dialog>
              </div>

              <p className="text-sm text-purple-300 mb-1">Monthly Target</p>
              <p className="text-2xl font-bold text-purple-400 mb-3">
                {planData.monthlyTarget.toFixed(1)} USD
              </p>

              <div className="space-y-1 text-sm text-gray-300">
                <p>{planData.plan || 'No specific plan yet.'}</p>
                <p className="text-purple-400 mt-2 cursor-pointer">+ Add a new rule</p>
              </div>
            </Card>

            {/* Risk Management Section */}
            <Card className="p-5 bg-[#1E1B2E] text-white rounded-2xl shadow-md relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="text-purple-400" size={20} />
                  <h3 className="font-semibold text-base">Risk Management</h3>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="bg-black/20 p-2 rounded-full hover:bg-black/30">
                      <Pencil size={16} />
                    </button>
                  </DialogTrigger>
                  <PlanDialog
                    planData={planData}
                    setPlanData={setPlanData}
                    onSave={handleSavePlan}
                  />
                </Dialog>
              </div>

              <div className="flex justify-between text-sm text-gray-300 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide">Minimum Risk:Reward</p>
                  <p className="text-purple-400 font-bold">1 : 2</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide">Max Daily Drawdown</p>
                  <p className="text-purple-400 font-bold">{planData.risk} USD</p>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-300">
                {planData.rule ? (
                  <p>{planData.rule}</p>
                ) : (
                  <p className="italic text-gray-500">No risk rules defined.</p>
                )}
                {planData.note && <p>{planData.note}</p>}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* ✅ Button fixed ở cuối */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-background via-background/95 to-transparent pt-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 text-base font-semibold">
              {planData ? (
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
          <PlanDialog planData={planData} setPlanData={setPlanData} onSave={handleSavePlan} />
        </Dialog>
      </div>
    </div>
  );
}

/* 🧱 Component: Dialog form để tạo / chỉnh sửa Plan */
function PlanDialog({ planData, setPlanData, onSave }: any) {
  const initialData = planData || {
    identity: 'REAL',
    // monthlyTarget: '',
    plan: '',
    // risk: '',
    rule: '',
    note: '',
  };

  const [localData, setLocalData] = useState(initialData);

  return (
    <DialogContent className="max-w-11/12">
      <DialogHeader>
        <DialogTitle>{planData ? 'Edit Trading Plan' : 'Create Trading Plan'}</DialogTitle>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <Select
          value={localData.identity}
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
          value={localData.monthlyTarget}
          onChange={(e) => setLocalData({ ...localData, monthlyTarget: Number(e.target.value) })}
          placeholder="Monthly Target ($)"
        />

        <Input
          value={localData.plan}
          onChange={(e) => setLocalData({ ...localData, plan: e.target.value })}
          placeholder="Plan description"
        />

        <Input
          type="number"
          value={localData.risk}
          onChange={(e) => setLocalData({ ...localData, risk: e.target.value })}
          placeholder="Risk (R)"
        />

        {/* <Input
          value={localData.rule}
          onChange={(e) => setLocalData({ ...localData, rule: e.target.value })}
          placeholder="Rule"
        /> */}
        <Textarea
          placeholder="Rule"
          value={localData.rule}
          onChange={(e) => setLocalData({ ...localData, rule: e.target.value })}
          rows={4}
        />

        {/* <Input
          value={localData.note}
          onChange={(e) => setLocalData({ ...localData, note: e.target.value })}
          placeholder="Note"
        /> */}
        <Textarea
          placeholder="Note"
          value={localData.note}
          onChange={(e) => setLocalData({ ...localData, note: e.target.value })}
          rows={4}
        />
      </div>

      <DialogFooter>
        <Button
          onClick={() => {
            setPlanData(localData);
            onSave();
          }}
          className="w-full"
        >
          <Save size={16} className="mr-2" /> Save Plan
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
