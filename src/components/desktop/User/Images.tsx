'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cx from 'classnames';
import API from '../../../utils/api';
import { useAppDispatch } from '../../../store/hooks';
import { hideLoading, showLoading } from '../../../store/slices/user.slice';
import moment from 'moment';
import { useWindowResize } from '../../../common/func';
import { Trash } from 'lucide-react';

export function ImagesTab({ theme, type, active }: any) {
  const [images, setImages] = useState<any>([]);
  const [selectedImage, setSelectedImage] = useState<any>();
  const [selectedTypeImage, setSelectedTypeImage] = useState<any>();
  const [imageToDelete, setImageToDelete] = useState<any>(null);

  const dispatch = useAppDispatch();

  const getListImages = async () => {
    try {
      dispatch(showLoading());
      const { data } = await API.get(`/images${type ? `?type=${type}` : ''}`);
      setImages(data);
    } catch (error) {
    } finally {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getListImages();
  }, []);

  useEffect(() => {
    if (active === true) {
      getListImages();
    }
  }, [active]);

  async function handleDeleteImage(img: any) {
    try {
      dispatch(showLoading());
      await API.delete(`/images?publicId=${img.publicId}`);
      setImageToDelete(null);
      getListImages();
    } catch {
    } finally {
      dispatch(hideLoading());
    }
  }

  const [touchStartX, setTouchStartX] = useState(0);

  // ===============================
  // GROUP IMAGES BY DATE
  // ===============================
  const groupImagesByDay = (imgs: any[]) => {
    const groups: Record<string, any[]> = {};

    imgs.forEach((img) => {
      // const dateKey = new Date(img.createdAt).toLocaleDateString('en-GB');
      const dateKey = moment(img.createdAt).format('DD/MM/YYYY');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(img);
    });

    return Object.entries(groups).sort((a, b) => {
      const da = new Date(a[0].split('/').reverse().join('-')).getTime();
      const db = new Date(b[0].split('/').reverse().join('-')).getTime();
      return db - da;
    });
  };

  const grouped = groupImagesByDay(images);

  console.log('grouped', grouped);

  // ===============================
  // PREVIEW KEYBOARD NAVIGATION
  // ===============================

  const currentIndex = selectedImage
    ? images.findIndex((img: any) => img.url === selectedImage)
    : -1;

  const showNextImage = () => {
    if (currentIndex < 0) return;
    const next = (currentIndex + 1) % images.length;
    setSelectedImage(images[next].url);
  };

  const showPrevImage = () => {
    if (currentIndex < 0) return;
    const prev = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prev].url);
  };

  useEffect(() => {
    if (!selectedImage) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowRight') showNextImage();
      if (e.key === 'ArrowLeft') showPrevImage();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedImage, currentIndex]);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden'; // khóa scroll body
    } else {
      document.body.style.overflow = ''; // mở scroll lại
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  // ===============================
  // MOBILE SWIPE
  // ===============================
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStartX;

    if (Math.abs(diff) < 50) return;

    if (diff < 0)
      showNextImage(); // swipe trái
    else showPrevImage(); // swipe phải
  };

  // ===============================
  // IMAGE ITEM COMPONENT
  // ===============================
  const ImageItem = ({ img }: any) => (
    <motion.div
      key={img._id}
      className="relative group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image */}
      <motion.img
        src={img.url}
        className="w-full h-28 object-cover rounded-lg shadow cursor-pointer"
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          setSelectedImage(img.url);
          setSelectedTypeImage(img.type);
        }}
      />

      {/* Delete Button */}
      <button
        className="
          cursor-pointer absolute top-1 right-1 opacity-0 group-hover:opacity-100
          transition bg-black/60 hover:bg-red-600 text-white p-1 rounded-full
        "
        onClick={(e) => {
          e.stopPropagation();
          setImageToDelete(img);
        }}
      >
        <Trash size={14} />
      </button>
    </motion.div>
  );

  const isMobile = useWindowResize(576);
  console.log('isMobile', isMobile);

  return (
    <>
      {/* =============================== */}
      {/* GROUPED IMAGE LIST */}
      {/* =============================== */}
      {grouped.map(([date, imgs]) => (
        <div key={date} className="mb-6">
          <h3
            className={cx(
              'font-bold text-sm mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-800',
            )}
          >
            {date}
          </h3>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {imgs.map((img) => (
              <ImageItem key={img._id} img={img} />
            ))}
          </div>
        </div>
      ))}

      {/* =============================== */}
      {/* PREVIEW MODAL */}
      {/* =============================== */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)} // CLICK OUTSIDE
          >
            {/* Container cho image — chặn click ra ngoài */}
            {selectedTypeImage === 'POKER' ? (
              <div
                className={`${isMobile ? 'max-h-[85%]' : 'max-h-screen'} max-w-[90vw] overflow-auto`}
              >
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  // className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
                  className="w-auto max-w-full h-auto max-h-none rounded-lg shadow-xl"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  // SWIPE
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -80) showNextImage();
                    if (info.offset.x > 80) showPrevImage();
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  // SWIPE
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -80) showNextImage();
                    if (info.offset.x > 80) showPrevImage();
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================== */}
      {/* DELETE CONFIRM MODAL */}
      {/* =============================== */}
      <AnimatePresence>
        {imageToDelete && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImageToDelete(null)}
          >
            <motion.div
              className={cx(
                'p-6 rounded-xl shadow-xl w-80',
                theme === 'dark' ? 'bg-gray-800' : 'bg-white',
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className={cx(
                  'text-lg font-semibold mb-3',
                  theme === 'dark' ? 'text-white' : 'text-gray-800',
                )}
              >
                Confirm delete?
              </h3>

              <p
                className={cx('text-sm mb-4', theme === 'dark' ? 'text-gray-300' : 'text-gray-600')}
              >
                Are you sure you want to delete this image? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className={cx(
                    'px-4 py-2 rounded-lg text-sm',
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
                  )}
                  onClick={() => setImageToDelete(null)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                  onClick={() => handleDeleteImage(imageToDelete)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
