'use client';

import { useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Trash2, Star, Images } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import moment from 'moment';

export default function PokerSessionList({ sessions, onDelete, handleOpenSession }: any) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {sessions.map((s: any) => (
        <SwipeToRevealDelete
          key={s.id}
          session={s}
          handleOpenSession={handleOpenSession}
          onConfirmDelete={() => setConfirmDeleteId(s.id)}
        />
      ))}

      {/* Popup confirm delete */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete Session?</DialogTitle>
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

function SwipeToRevealDelete({ session, onConfirmDelete, handleOpenSession }: any) {
  const x = useMotionValue(0);
  const [showDelete, setShowDelete] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
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

  const duration =
    session.startTime && session.endTime
      ? moment(session.endTime).diff(moment(session.startTime), 'minutes')
      : null;

  return (
    <div className="relative">
      {/* Icon delete */}
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

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="cursor-pointer"
        onClick={() => handleOpenSession(session)}
      >
        <Card className="flex justify-between items-center px-3 py-2">
          <div>
            <div className="flex gap-3 items-center">
              <p className="font-medium">{session.blind}</p>
              {!!session.images.length && <Images size={16} />}
            </div>
            <p className="text-xs text-muted-foreground">
              {session.format} · {session.hands} hands
            </p>
            <p className="text-xs text-muted-foreground">
              {moment(session.startTime).format('DD/MM/YYYY HH:mm')}
              {session.endTime && ` → ${moment(session.endTime).format('HH:mm')}`}
            </p>
          </div>

          <div className="text-right">
            {session.result !== undefined && (
              <p
                className={`font-semibold ${
                  session.result >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {session.result > 0 ? `+${session.result}` : session.result}$
              </p>
            )}
            <div
              className={`flex items-center justify-end gap-1 ${session.rating > 0 ? 'text-yellow-500' : 'text-zinc-400'} text-xs`}
            >
              <Star
                className={`w-3 h-3 ${session.rating > 0 ? 'fill-yellow-400' : 'fill-zinc-300'}`}
              />{' '}
              {session.rating || 0}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
