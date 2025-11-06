'use client';

import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import clsx from 'clsx';

interface LoadingOverlayProps {
  show: boolean;
  fullscreen?: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  fullscreen = false,
  message = 'Loading...',
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={clsx(
            'flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]',
            fullscreen ? 'fixed inset-0' : 'absolute inset-0 rounded-lg',
          )}
        >
          <div className="flex flex-col items-center space-y-3 text-center">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
            <p className="text-white text-sm font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
