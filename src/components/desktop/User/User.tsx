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
import { ImagesTab } from './Images';
import PlansTab from './Plan';
import WeeklySchedule from './Schedule';
import WeeklyScheduleMobile from './ScheduleMobile';

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
  const [planData, setPlanData] = useState<any>([]);

  const tabs = ['About', 'Features', 'Plans', 'Images', 'Schedule'];

  const dispatch = useAppDispatch();

  const getUserSettingTrading = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/users/get-setting');
      setPlanData(data);
    } catch (err) {
      console.log('error123', err);
      setPlanData(null);
    } finally {
      dispatch(hideLoading()); // tắt loading dù có lỗi hay không
    }
  };

  useEffect(() => {
    getUserSettingTrading();
  }, []);

  const isMobile = useWindowResize(576);

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
        <div className="flex gap-6 md:gap-16 border-b pb-3">
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
          {activeTab === 'Plans' && <PlansTab theme={theme} planData={planData} />}
          {activeTab === 'Images' && (
            <ImagesTab
              theme={theme}
              //   images={imagesMock}
              //   selectedImage={selectedImage}
              //   setSelectedImage={setSelectedImage}
            />
          )}
          {!isMobile && activeTab === 'Schedule' && <WeeklySchedule theme={theme} />}
          {isMobile && activeTab === 'Schedule' && <WeeklyScheduleMobile theme={theme} />}
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
