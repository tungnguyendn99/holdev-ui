'use client';

import { useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Star, Trash2 } from 'lucide-react';
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

export default function TradeList({ trades, onDelete, handleOpenTrade }: any) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {trades.map((t: any) => (
        <SwipeToRevealDelete
          key={t.id}
          trade={t}
          handleOpenTrade={handleOpenTrade}
          onConfirmDelete={() => setConfirmDeleteId(t.id)}
        />
      ))}

      {/* Popup confirm delete */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete Trade?</DialogTitle>
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

function SwipeToRevealDelete({ trade, onConfirmDelete, handleOpenTrade }: any) {
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
        onClick={() => handleOpenTrade(trade)}
      >
        <Card className="flex justify-between items-center px-3 py-2">
          <div>
            <p className="font-medium">{trade.symbol}</p>
            <p className="text-xs text-muted-foreground">
              {moment(trade.closeTime || trade.entryTime).format('DD/MM/YYYY')} ·{' '}
              <span className={trade.tradeSide === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                {trade.tradeSide}
              </span>
            </p>
          </div>
          <div className="text-right">
            {trade.result && (
              <p
                className={`font-semibold ${trade.result >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {trade.result > 0 ? `+${trade.result}` : trade.result}$
              </p>
            )}
            {trade.rating > 0 && (
              <div className="flex items-center justify-end gap-1 text-yellow-400 text-xs">
                <Star className="w-3 h-3 fill-yellow-400" /> {trade.rating}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
