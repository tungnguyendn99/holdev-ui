'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar as CalendarIcon,
  Info,
  Pencil,
  Save,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import 'react-day-picker/dist/style.css';
import './TodoMobile.scss';
import { Tag } from 'antd';
import { cn } from '../../../../lib/utils';
import { usePushNotification } from '../../../hooks/usePushNotification';

interface TodoItem {
  id: string;
  title: string;
  done: boolean;
  date: string;
  description?: string;
  priority?: string;
}

export default function TodoMobile() {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      title: 'Làm bài tập',
      done: false,
      date: '2025-11-01',
      description: 'Toán + Lý',
      priority: 'MEDIUM',
    },
    {
      id: '2',
      title: 'Đi siêu thị',
      done: true,
      date: '2025-11-02',
      description: 'Mua rau và sữa',
      priority: 'HIGH',
    },
    { id: '3', title: 'Viết báo cáo', done: false, date: '2025-11-03', priority: 'LOW' },
    { id: '4', title: 'Tập gym', done: true, date: '2025-11-03', description: 'Ngày tập chân' },
  ]);

  const [newTask, setNewTask] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>(new Date());
  const [priority, setPriority] = useState<any>('MEDIUM');
  const [tab, setTab] = useState<'pending' | 'done' | 'calendar'>('pending');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleAdd = () => {
    if (!newTask.trim() || !newDate) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: newTask.trim(),
      done: false,
      date: format(newDate, 'yyyy-MM-dd'),
      priority,
    };
    setTodos([newTodo, ...todos]);
    setNewTask('');
  };

  console.log('newDate', newDate);

  const toggleDone = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id: string) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const filtered = todos.filter((t) => (tab === 'done' ? t.done : !t.done));

  const todosOfSelectedDate = todos.filter(
    (t) => t.date === format(selectedDate || new Date(), 'yyyy-MM-dd'),
  );

  const pendingDays = useMemo(
    () => todos.filter((t) => !t.done).map((t) => parseISO(t.date)),
    [todos],
  );

  const doneDays = useMemo(() => todos.filter((t) => t.done).map((t) => parseISO(t.date)), [todos]);

  const handleSaveTodo = () => {
    if (!selectedTodo) return;
    setTodos((prev) => prev.map((t) => (t.id === selectedTodo.id ? selectedTodo : t)));
    setEditMode(false);
  };

  const handleToggleDoneInModal = (checked: boolean) => {
    if (!selectedTodo) return;
    const updated = { ...selectedTodo, done: checked };
    setSelectedTodo(updated);
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  console.log('todos', todos);

  const { subscribe, unsubscribe, isSubscribed } = usePushNotification(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  );

  console.log('process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
  console.log('subscribe', subscribe);
  console.log('unsubscribe', unsubscribe);
  console.log('isSubscribed', isSubscribed);

  return (
    <div className="h-full flex flex-col bg-background text-foreground px-3 pt-3 pb-16">
      <div>
        <h1 className="text-xl font-bold">🔔 Web Push Notification</h1>

        {!isSubscribed ? (
          <button onClick={() => subscribe()} className="px-4 py-2 bg-blue-500 text-white rounded">
            Đăng ký nhận thông báo
          </button>
        ) : (
          <button onClick={unsubscribe} className="px-4 py-2 bg-red-500 text-white rounded">
            Hủy đăng ký
          </button>
        )}
      </div>
      <h1 className="text-xl font-bold mb-5 text-center">🗓️ Những việc cần làm của Txinh</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-5">
          <TabsTrigger value="pending">Việc cần làm</TabsTrigger>
          <TabsTrigger value="done">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="calendar">Lịch</TabsTrigger>
        </TabsList>

        {(tab === 'pending' || tab === 'done') && (
          <>
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập công việc..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 mb-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} className="px-3">
                  <Plus size={20} />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {/* <CalendarIcon size={16} /> */}
                {/* <input
                  type="date"
                  value={newDate ? format(newDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setNewDate(new Date(e.target.value))}
                  className="border rounded-md px-2 py-1 text-sm"
                /> */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[160px] justify-start text-left font-normal h-8 text-sm',
                        !newDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newDate ? format(newDate, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={newDate} onSelect={setNewDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <Select
                  value={priority || ''}
                  onValueChange={(val) => {
                    setPriority((prev: any) => (prev === val ? undefined : val));
                  }}
                >
                  <SelectTrigger className="w-[130px] h-8 text-sm">
                    <SelectValue placeholder="Ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityList.map((p) => (
                      <SelectItem
                        key={p.value}
                        value={p.value}
                        onClick={(e) => {
                          // Dừng propagation để đảm bảo sự kiện được bắt
                          e.stopPropagation();
                          setPriority((prev: any) => prev === p.value && undefined);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Circle className={`${p.color} w-3 h-3`} />
                          <span>{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={tab} className="flex-1 overflow-y-auto">
              <TodoList
                todos={filtered}
                toggleDone={toggleDone}
                deleteTodo={deleteTodo}
                onOpenDetail={(todo) => {
                  setSelectedTodo(todo);
                  setEditMode(false);
                }}
              />
            </TabsContent>
          </>
        )}

        <TabsContent value="calendar" className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-lg border shadow-sm p-2"
              modifiers={{
                hasPending: pendingDays,
                hasDone: doneDays,
                hasBoth: todos
                  .filter((t) => {
                    const sameDay = todos.filter((tt) => tt.date === t.date);
                    return sameDay.some((tt) => tt.done) && sameDay.some((tt) => !tt.done);
                  })
                  .map((t) => parseISO(t.date)),
              }}
              modifiersClassNames={{
                hasPending: 'day-has-pending',
                hasDone: 'day-has-done',
                hasBoth: 'day-has-both',
              }}
            />
            <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Chưa hoàn thành
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> Đã hoàn thành
              </span>
            </div>

            <h2 className="mt-4 font-semibold">
              Công việc ngày {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '...'}
            </h2>
            <div className="mt-3 w-full">
              <TodoList
                todos={todosOfSelectedDate}
                toggleDone={toggleDone}
                deleteTodo={deleteTodo}
                onOpenDetail={(todo) => {
                  setSelectedTodo(todo);
                  setEditMode(false);
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 📋 Modal chi tiết */}
      <Dialog open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? '✏️ Chỉnh sửa công việc' : '📄 Chi tiết công việc'}
            </DialogTitle>
          </DialogHeader>

          {selectedTodo && (
            <div className="space-y-4">
              {editMode ? (
                <>
                  <Input
                    value={selectedTodo.title}
                    onChange={(e) => setSelectedTodo({ ...selectedTodo, title: e.target.value })}
                    placeholder="Tiêu đề công việc"
                  />
                  <textarea
                    value={selectedTodo.description || ''}
                    onChange={(e) =>
                      setSelectedTodo({ ...selectedTodo, description: e.target.value })
                    }
                    placeholder="Mô tả chi tiết..."
                    className="w-full border rounded-md p-2 text-sm"
                    rows={4}
                  />
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} />
                    <input
                      type="date"
                      value={selectedTodo.date}
                      onChange={(e) => setSelectedTodo({ ...selectedTodo, date: e.target.value })}
                      className="border rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Tiêu đề:</strong> {selectedTodo.title}
                  </p>
                  <p>
                    <strong>Ngày:</strong> {format(parseISO(selectedTodo.date), 'dd/MM/yyyy')}
                  </p>
                  <div>
                    <strong>Mô tả:</strong>{' '}
                    {selectedTodo.description ? (
                      <div className="mt-1 text-sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedTodo.description}
                      </div>
                    ) : (
                      <em>Chưa có mô tả</em>
                    )}
                  </div>
                </>
              )}

              {/* ✅ Toggle trạng thái */}
              <div className="flex items-center justify-between border-t pt-3 mt-2">
                <Label htmlFor="" className="flex gap-3 text-sm font-medium">
                  <p>
                    Trạng thái:{' '}
                    {selectedTodo.done ? (
                      <span className="text-green-600">Đã hoàn thành</span>
                    ) : (
                      <span className="text-blue-600">Chưa hoàn thành</span>
                    )}
                  </p>
                  <p>Ưu tiên: {handlePriority(selectedTodo.priority)}</p>
                </Label>
                <Switch
                  id="done-switch"
                  checked={selectedTodo.done}
                  onCheckedChange={handleToggleDoneInModal}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between mt-4">
            {editMode ? (
              <Button onClick={handleSaveTodo} variant="default">
                <Save size={16} className="mr-2" /> Lưu
              </Button>
            ) : (
              <Button onClick={() => setEditMode(true)} variant="secondary">
                <Pencil size={16} className="mr-2" /> Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TodoList({
  todos,
  toggleDone,
  deleteTodo,
  onOpenDetail,
}: {
  todos: TodoItem[];
  toggleDone: (id: string) => void;
  deleteTodo: (id: string) => void;
  onOpenDetail: (todo: TodoItem) => void;
}) {
  return (
    <div className="space-y-3">
      <AnimatePresence>
        {todos.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground py-6"
          >
            Không có công việc nào
          </motion.p>
        )}

        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <Card className="flex items-center justify-between px-3 py-2">
              <div
                // onClick={() => toggleDone(todo.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                {todo.done ? (
                  <CheckCircle2
                    className="text-green-500"
                    size={20}
                    onClick={() => toggleDone(todo.id)}
                  />
                ) : (
                  <Circle className="text-gray-400" size={20} onClick={() => toggleDone(todo.id)} />
                )}
                <div className="flex flex-col">
                  <span className={`text-base ${todo.done ? 'line-through text-gray-400' : ''}`}>
                    {todo.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(todo.date), 'dd/MM/yyyy')}</span>
                    {handlePriority(todo.priority)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => onOpenDetail(todo)}
                  className="p-1 hover:bg-blue-100 rounded-md text-blue-500"
                >
                  <Info size={18} />
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 hover:bg-red-100 rounded-md text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const priorityList = [
  //   { label: 'Ưu ti', value: 'HIGH', color: 'text-red-500' },
  { label: 'Cao', value: 'HIGH', color: 'text-red-500' },
  { label: 'Trung bình', value: 'MEDIUM', color: 'text-yellow-500' },
  { label: 'Thấp', value: 'LOW', color: 'text-blue-500' },
];

const handlePriority = (priority: string | undefined) => {
  switch (priority) {
    case 'HIGH':
      return (
        <Tag color="red" className="text-[10px]! px-1! py-px! rounded-md! leading-none!">
          Cao
        </Tag>
      );
    case 'MEDIUM':
      return (
        <Tag color="gold" className="text-[10px]! px-1! py-px! rounded-md! leading-none!">
          Trung bình
        </Tag>
      );
    case 'LOW':
      return (
        <Tag color="geekblue" className="text-[10px]! px-1! py-px! rounded-md! leading-none!">
          Thấp
        </Tag>
      );
    default:
      return null;
  }
};
