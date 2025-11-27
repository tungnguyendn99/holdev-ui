'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cx from 'classnames';
import { useTheme } from 'next-themes';
import { Camera, ChevronRight, Image as ImageIcon, Trash, X } from 'lucide-react';
import API from '../../../utils/api';
import { notification } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { hideLoading, setUserInfo, showLoading } from '../../../store/slices/user.slice';
import moment from 'moment';
import { useWindowResize } from '../../../common/func';

//
// MOCK DATA (bạn replace bằng API real)
//

const tradingPlan = {
  _id: '6912b119aebc1f625ad82bec',
  type: 'TRADING',
  identity: 'DEMO',
  monthTarget: 120,
  dayTarget: 5.45454545454545,
  plan: 'The Discipline Trading',
  risk: '4',
  rule: '* Chờ đợi thị trường di chuyển...\n* Không nên nhồi lệnh...',
  note: '1. Trade 5 days...\n2. (D/H4/H1)...',
};

export default function UserProfile() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('About');
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const userInfo = useAppSelector((state) => state.user.userInfo);
  const [preview, setPreview] = useState(userInfo.avatar || '');

  const tabs = ['About', 'Features', 'Plans', 'Images'];

  return (
    <div
      className={cx(
        'min-h-screen pb-32 transition-colors',
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900',
      )}
    >
      {/* ======================= Banner ======================= */}
      <div
        className={cx(
          'relative w-full h-32 flex items-end p-6 rounded-b-3xl bg-user-banner bg-cover bg-center bg-gradient-to-br',
          theme === 'dark' ? 'from-blue-700 to-purple-700' : 'from-indigo-500 to-blue-500',
        )}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={userInfo.avatar || '/default-avatar.png'}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
              onClick={() => preview && setShowPreviewModal(true)}
            />

            <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1 rounded-full shadow">
              <Camera size={18} />
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">{userInfo.username}</h1>
            {/* <p className="opacity-70 text-sm">Member since 2025</p> */}
          </div>
        </div>
      </div>

      {/* ======================= Tabs ======================= */}
      <div className="px-6 mt-6 overflow-x-auto">
        <div className="flex gap-6 border-b pb-3">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cx(
                'pb-2 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer',
                activeTab === t
                  ? 'text-indigo-500 border-b-2 border-indigo-500'
                  : theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ======================= TAB CONTENT ======================= */}
      <div className="px-6 mt-6 mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'About' && <AboutTab theme={theme} userInfo={userInfo} />}
          {activeTab === 'Features' && <FeaturesTab theme={theme} userInfo={userInfo} />}
          {activeTab === 'Plans' && <PlansTab theme={theme} userInfo={userInfo} />}
          {activeTab === 'Images' && (
            <ImagesTab
              theme={theme}
              //   images={imagesMock}
              //   selectedImage={selectedImage}
              //   setSelectedImage={setSelectedImage}
            />
          )}
        </AnimatePresence>
      </div>

      {showPreviewModal && (
        <div
          className={cx(
            'fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm',
            theme === 'dark' ? 'bg-black/80' : 'bg-black/50',
          )}
          onClick={() => setShowPreviewModal(false)}
        >
          <img
            src={preview}
            className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} // tránh đóng modal khi click vào ảnh
          />
        </div>
      )}
    </div>
  );
}

//
// ======================= TAB: ABOUT =======================
//
export function AboutTab({ theme, userInfo }: any) {
  const isDark = theme === 'dark';
  const [preview, setPreview] = useState(userInfo.avatar || '');
  const [file, setFile] = useState<File | null>(null);
  const [username, setUsername] = useState(userInfo.username);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  const dispatch = useAppDispatch();
  console.log('preview', preview);

  const handleFile = (e: any) => {
    const pickedFile = e.target.files?.[0];
    if (!pickedFile) return;

    setFile(pickedFile);
    setPreview(URL.createObjectURL(pickedFile));
  };

  //   const handleDrop = (e: any) => {
  //     e.preventDefault();
  //     const dropped = e.dataTransfer.files?.[0];
  //     if (!dropped) return;

  //     setFile(dropped);
  //     setPreview(URL.createObjectURL(dropped));
  //   };

  async function upload(file: File) {
    try {
      dispatch(showLoading());
      const fd = new FormData();
      fd.append('file', file);
      // optional: fd.append('transformation', JSON.stringify({ crop: 'limit', width: 1200 }));
      const { data } = await API.post('/images/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(data.result.db.url);
      api.success({
        message: 'Success!',
        description: 'Upload new avatar successfully.',
      });
      return data;
    } catch (error: any) {
      api.error({
        message: 'Error!',
        description: error?.response?.data?.message || 'Error upload new avatar.',
      });
    } finally {
      dispatch(hideLoading());
    }
  }

  const handleUpload = () => {
    if (file) upload(file);
  };

  const updateProfile = async () => {
    try {
      dispatch(showLoading());
      const { data } = await API.post('/users/update', {
        username,
        avatar: preview,
      });
      dispatch(setUserInfo(data));
      api.success({
        message: 'Success!',
        description: 'Add new word successfully.',
      });
    } catch (error) {
      api.error({
        message: 'Error!',
        description: 'Error update user profile.',
      });
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <motion.div
      key="about"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 md:w-[60%] mx-auto"
    >
      {contextHolder}
      <div
        className={cx(
          'rounded-2xl p-6 shadow-md border',
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        )}
      >
        <h2 className="text-lg font-semibold mb-6">Your Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <img
            src={preview || '/default-avatar.png'}
            className="w-16 h-16 rounded-full cursor-pointer object-cover border"
            onClick={() => preview && setShowPreviewModal(true)}
          />

          <div>
            <p className="font-medium">{username}</p>
            {/* <div
              className={cx(
                'flex gap-4 text-sm cursor-pointer mt-1',
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
              )}
            >
              <span className="hover:underline">Delete</span>
              <span className="hover:underline">Update</span>
            </div> */}
          </div>
        </div>

        {/* Upload box */}
        <div
          className={cx(
            'rounded-xl border-dashed border-2 p-6 text-center cursor-pointer transition',
            theme === 'dark'
              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 bg-gray-100 hover:bg-gray-200',
          )}
          //   onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('avatarInput')?.click()}
        >
          <input
            id="avatarInput"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFile}
          />

          <div className="text-4xl opacity-50 mb-2">⬆️</div>
          <p
            className={cx('text-sm mb-1', theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600')}
          >
            Click to upload
          </p>
          {/* <p className="text-xs opacity-60">or drag and drop</p> */}
          <p className="text-xs opacity-40 mt-1">SVG, PNG, JPG, GIF (max 800×800)</p>
          <p className="text-xs opacity-40 mt-1">
            After selecting the image, click the button below to get the image url
          </p>
        </div>

        {preview && (
          <button
            className={cx(
              'mt-4 w-full py-2 rounded-lg font-semibold transition',
              theme === 'dark'
                ? 'bg-neutral-400 hover:bg-indigo-700'
                : 'bg-neutral-400 text-white hover:bg-indigo-600',
            )}
            onClick={handleUpload}
          >
            Get Image Url
          </button>
        )}

        <h2 className="text-lg font-semibold mb-3 mt-3">Username</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={cx(
            'w-full p-3 rounded-lg border focus:outline-none transition',
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
          )}
        />

        <button
          className={cx(
            'mt-4 w-full py-2 rounded-lg font-semibold transition',
            theme === 'dark'
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-indigo-500 text-white hover:bg-indigo-600',
          )}
          onClick={updateProfile}
        >
          Save Profile
        </button>
      </div>

      {/* <div
        className={cx(
          'rounded-2xl p-6 shadow-md border',
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        )}
      >
        <h2 className="text-lg font-semibold mb-3">Username</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={cx(
            'w-full p-3 rounded-lg border focus:outline-none transition',
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
          )}
        />

        <button
          className={cx(
            'mt-4 w-full py-2 rounded-lg font-semibold transition',
            theme === 'dark'
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-indigo-500 text-white hover:bg-indigo-600',
          )}
          onClick={updateProfile}
        >
          Save Profile
        </button>
      </div> */}
      {showPreviewModal && (
        <div
          className={cx(
            'fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm',
            theme === 'dark' ? 'bg-black/80' : 'bg-black/50',
          )}
          onClick={() => setShowPreviewModal(false)}
        >
          <img
            src={preview}
            className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} // tránh đóng modal khi click vào ảnh
          />
        </div>
      )}
    </motion.div>
  );
}

//
// ======================= TAB: FEATURES =======================
//
function FeaturesTab({ theme, userInfo }: any) {
  return (
    <motion.div
      key="features"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
    >
      {userInfo.features.map((f: any) => (
        <motion.div
          key={f}
          className={cx(
            'p-4 rounded-xl cursor-pointer hover:scale-[1.03] transition shadow',
            theme === 'dark' ? 'bg-gray-800' : 'bg-white',
          )}
          whileHover={{ y: -3 }}
        >
          <p className="font-bold text-indigo-500">{f}</p>
          <p className="text-xs opacity-60">Tap to manage this feature</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

//
// ======================= TAB: PLANS =======================
//
function PlansTab({ theme, userInfo }: any) {
  return (
    <motion.div
      key="plans"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Card summary */}
      <div
        className={cx(
          'rounded-xl p-4 shadow cursor-pointer',
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-700'
            : 'bg-gradient-to-br from-white to-gray-50',
        )}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-lg">{tradingPlan.type}</p>
            <p className="opacity-70 text-sm">{tradingPlan.plan}</p>
          </div>

          <ChevronRight />
        </div>
      </div>

      {/* Expanding Detail */}
      <motion.div
        className={cx('rounded-xl p-4 shadow', theme === 'dark' ? 'bg-gray-800' : 'bg-white')}
      >
        <h3 className="font-semibold text-indigo-500 mb-2">{tradingPlan.plan}</h3>

        <p className="opacity-70 text-sm whitespace-pre-line">{tradingPlan.rule}</p>

        <div className="mt-4">
          <h4 className="font-semibold">Note</h4>
          <p className="opacity-70 text-sm whitespace-pre-line">{tradingPlan.note}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

//
// ======================= TAB: IMAGES =======================
//
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
