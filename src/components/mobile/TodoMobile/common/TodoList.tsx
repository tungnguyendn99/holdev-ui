'use client';

import { useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { CheckCircle2, Circle, Info, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Tag } from 'antd';

export default function TodoList({ todos, onDelete, handleOpenTodo, toggleDone }: any) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {todos.map((t: any) => (
        <SwipeToRevealDelete
          key={t.id}
          todo={t}
          handleOpenTodo={handleOpenTodo}
          toggleDone={toggleDone}
          onConfirmDelete={() => setConfirmDeleteId(t.id)}
        />
      ))}

      {/* Popup confirm delete */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete Todo?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SwipeToRevealDelete({ todo, onConfirmDelete, handleOpenTodo, toggleDone }: any) {
  const x = useMotionValue(0);
  const [showDelete, setShowDelete] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    // Nếu vuốt sang trái quá 60px → mở nút xóa
    if (info.offset.x < -60) {
      animate(x, -60, { duration: 0.2 });
      setShowDelete(true);
    } else {
      animate(x, 0, { duration: 0.2 });
      setShowDelete(false);
    }
  };

  const resetPosition = () => {
    animate(x, 0, { duration: 0.2 });
    setShowDelete(false);
  };

  return (
    <div className="relative">
      {/* Icon delete nằm bên phải */}
      {showDelete && (
        <div className="absolute right-3 top-0 bottom-0 flex items-center">
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full"
            onClick={() => {
              resetPosition();
              onConfirmDelete?.();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Card có thể kéo */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="cursor-pointer"
      >
        <Card className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3 cursor-pointer flex-1">
            {todo.done ? (
              <CheckCircle2
                className="text-green-500"
                size={20}
                onClick={() => toggleDone(todo.id, !todo.done)}
              />
            ) : (
              <Circle
                className="text-gray-400"
                size={20}
                onClick={() => toggleDone(todo.id, !todo.done)}
              />
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
              onClick={() => handleOpenTodo(todo)}
              className="p-1 hover:bg-blue-100 rounded-md text-blue-500"
            >
              <Info size={18} />
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

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
