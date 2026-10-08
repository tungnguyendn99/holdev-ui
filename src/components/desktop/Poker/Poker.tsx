'use client';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Table,
  Tabs,
  Tag,
  Rate,
  Calendar,
  Select,
  notification,
} from 'antd';
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import { useAppDispatch } from '../../../store/hooks';
import { showLoading, hideLoading } from '../../../store/slices/user.slice';
import API from '../../../utils/api';
import { useTheme } from 'next-themes';
import cx from 'classnames';
import CustomCalendar from '../UI/CustomCalendar';
import './Poker.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { ColumnsType } from 'antd/es/table';
import { Award, Eye, Images, Star } from 'lucide-react';
import PlanSettings from '../../mobile/PokerMobile/Plan';
import { ImagesTab } from '../User/Images';

const Poker = () => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [dataDays, setDataDays] = useState<Record<string, any>>({});
  // const [dataMonths, setDataMonths] = useState<Record<string, any>>({});
  const [dataYear, setDataYear] = useState<any>({});
  const [detailMonth, setDetailMonth] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState<{ status: boolean; type: 'add' | 'edit' }>({
    status: false,
    type: 'add',
  });
  const [idUpdate, setIdUpdate] = useState('');
  const [rating, setRating] = useState(0);

  const [mode, setMode] = useState<string>('month');
  const [dataYearStats, setDataYearStats] = useState<any>({});
  const [selectedDaySessions, setSelectedDaySessions] = useState<any>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const locale: any = {
    lang: {
      locale: 'en_US',
      shortWeekDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      //   weekStartsOn: 1,
    },
  };

  // ======== FETCH DATA ========
  const getRecentSessions = async () => {
    try {
      const { data } = await API.post('/poker/list', {
        mode: 'month',
        dateString: selectedDate.format('YYYY-MM'),
      });
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getRecentSessions();
  }, []);

  const getDataDays = async () => {
    try {
      const { data } = await API.post('/poker/group', {
        mode: 'month',
        dateString: selectedDate.format('YYYY-MM'),
      });
      setDataDays(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDataMonths = async () => {
    try {
      dispatch(showLoading());
      const { data } = await API.post('/poker/group', {
        mode: 'month',
        group: 'month',
        dateString: selectedDate.format('YYYY-MM'),
      });
      // setDataMonths(data);
      setDetailMonth(data[selectedDate.format('YYYY-MM')]);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const getSelectedDaySessions = async () => {
    try {
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/poker/list', {
        mode: 'day',
        dateString: selectedDate.format('YYYY-MM-DD'),
      });
      setSelectedDaySessions(data);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const getDataYearStats = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/poker/group', {
        mode: 'year',
        group: 'year',
        dateString: selectedDate.format('YYYY'),
      });
      setDataYearStats(data[selectedDate.format('YYYY')]);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleChangeViewMode = async (mode: string) => {
    console.log('modeee', mode);

    setMode(mode);
    if (mode === 'month') {
      getDataYearSession();
    } else {
      getDataYearStats();
      getDataYearSession();
    }
  };

  const getDataYearSession = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/poker/group', {
        mode: 'year',
        group: 'month',
        dateString: selectedDate.format('YYYY'),
      });
      setDataYear(data);
      setDetailMonth(data[selectedDate.format('YYYY-MM')]);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const syncPageData = async () => {
    try {
      dispatch(showLoading());
      await Promise.all([
        getRecentSessions(),
        getDataDays(),
        getDataMonths(),
        getDataYearSession(),
        getDataYearStats(),
        getSelectedDaySessions(),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getDataDays();
    getDataMonths();
    getDataYearSession();
    getDataYearStats();
    getSelectedDaySessions();
    getRecentSessions();
  }, [selectedDate]);

  // ======== ADD/UPDATE SESSION ========
  const addSession = async (formData: any) => {
    try {
      dispatch(showLoading());
      console.log('formData', formData);

      await API.post('/poker/add-session', formData);
      syncPageData();
      setIsOpen({ status: false, type: 'add' });
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const updateSession = async (formData: any) => {
    try {
      dispatch(showLoading());
      await API.post('/poker/session/update', { ...formData, id: idUpdate });
      syncPageData();
      setIsOpen({ status: false, type: 'add' });
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoading());
    }
  };

  // ======== CALENDAR CELL RENDER ========
  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format('YYYY-MM-DD');
    const dayData = dataDays[dateKey];

    if (!dayData) return null;

    const winrate = dayData.winrate || 0;

    return (
      <div
        //   className="flex flex-col text-center font-semibold h-full"
        className={cx(
          'flex flex-col text-center font-semibold h-full',
          dayData.dayProfit && 'profit',
          dayData.dayLoss && 'loss',
        )}
      >
        <span
          className={cx(
            'text-[18px] font-semibold',
            dayData.dayProfit ? 'text-green-600' : 'text-red-500',
          )}
        >
          {dayData.profit}$
        </span>
        <span className={cx(`text-[#0D706E]`)}>
          {`${dayData.count} session${dayData.count > 1 ? 's' : ''}`} ({dayData.hands} hands)
        </span>
        <span className={cx(`text-[#0D706E]`)}>{winrate} ({dayData.duration})</span>
      </div>
    );
  };

  const monthCellRender = (value: Dayjs) => {
    const dateKey = value.format('YYYY-MM');
    const monthData = dataYear[dateKey];

    if (!monthData) return null;

    return (
      <div
        // className="flex flex-col text-center font-semibold h-full"
        className={cx(
          'flex flex-col text-center font-semibold h-full',
          monthData?.dayProfit && 'profit',
          monthData?.dayLoss && 'loss',
        )}
      >
        <span
          className={cx(
            'text-[18px] font-semibold',
            monthData?.dayProfit ? 'text-green-600' : 'text-red-500',
          )}
        >
          {monthData?.profit}$
        </span>
        <span className="text-[#0D706E]">
          {`${monthData?.count} session${monthData?.count > 1 ? 's' : ''}`} ({monthData?.hands}{' '}
          hands)
        </span>
        <span className="text-[#0D706E]">{monthData?.winrate} ({monthData.duration})</span>
      </div>
    );
  };

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
  };

  // ======== TABLE COLUMNS ========
  const columns: ColumnsType<any> = [
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
      align: 'center' as const,
      width: 150,
      render: (_, record) => (
        <div className="ml-3 flex gap-2 justify-center items-center">
          <span className="font-bold">{record.format}</span>
          <div className="w-4">{!!record.images.length && <Images size={16} />}</div>
        </div>
      ),
    },
    {
      title: 'Blind',
      dataIndex: 'blind',
      key: 'blind',
      align: 'center' as const,
      width: 80,
      render: (_, record) => <span className="font-bold">{record.blind}</span>,
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      align: 'center' as const,
      width: 100,
      render: (text: string) => moment(text).format('DD/MM/YYYY ~~ HH:mm'),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      align: 'center' as const,
      width: 100,
      render: (text: string) => moment(text).format('DD/MM/YYYY ~~ HH:mm'),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center' as const,
      width: 60,
      render: (text) => <span className={cx(``)}>⏳ {text}</span>,
    },
    {
      title: 'Hands',
      dataIndex: 'hands',
      key: 'hands',
      align: 'center' as const,
      width: 50,
      render: (_, record) => <span className="font-bold">{record.hands}</span>,
    },
    {
      title: 'Bbs',
      dataIndex: 'resultBB',
      key: 'resultBB',
      align: 'center' as const,
      width: 60,
      render: (val: number) =>
        val >= 0 ? (
          <Tag
            color="green"
            className="text-[14px]! font-bold px-2! py-px! rounded-md! leading-none!"
          >
            {val}
          </Tag>
        ) : (
          <Tag
            color="red"
            className="text-[14px]! font-bold px-2! py-px! rounded-md! leading-none!"
          >
            {val}
          </Tag>
        ),
    },
    {
      title: 'Winrate',
      dataIndex: 'winrate',
      key: 'winrate',
      align: 'center' as const,
      width: 80,
      render: (text: string) => (
        <Tag
          color="geekblue"
          className="text-[14px]! font-bold px-2! py-px! rounded-md! leading-none!"
        >
          {text}bb/100
        </Tag>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      align: 'center' as const,
      width: 50,
      render: (_, record) => (
        <div
          className={`flex items-center justify-center gap-1 ${record.rating > 0 ? 'text-yellow-500' : 'text-zinc-400'} text-xs`}
        >
          <Star className={`w-3 h-3 ${record.rating > 0 ? 'fill-yellow-400' : 'fill-zinc-300'}`} />{' '}
          {record.rating || 0}
        </div>
      ),
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      align: 'center' as const,
      width: 80,
      render: (val: number) => (
        <span
          className={cx('text-[14px]! font-semibold', val >= 0 ? 'text-green-400' : 'text-red-400')}
        >
          {val === null || val === undefined
            ? undefined
            : val >= 0
              ? `$${val.toLocaleString()}`
              : `-$${Math.abs(val).toLocaleString()}`}
        </span>
      ),
    },
  ];

  //upload images
  const [api, contextHolder] = notification.useNotification();
  const [localImages, setLocalImages] = useState<File[]>([]);
  const [previewURLs, setPreviewURLs] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>();
  const [uploadedURLs, setUploadedURLs] = useState<string[]>([]); // URL từ server

  console.log('previewURLs', previewURLs);

  const handleSelectImages = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    setLocalImages((prev) => [...prev, ...files]);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewURLs((prev) => [...prev, ...urls]);
  };

  const handleRemove = (index: number) => {
    setPreviewURLs((prev) => prev.filter((_, i) => i !== index));
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setLocalImages([]);
  }, [isOpen]);
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedImage]);

  const uploadToServer = async () => {
    try {
      console.log('localImages', localImages);

      dispatch(showLoading());
      const formData = new FormData();
      localImages.forEach((f) => formData.append('files', f));
      formData.append('type', 'POKER');
      const { data } = await API.post('/images/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data) {
        const filteredImages = previewURLs.filter((url) => !url.startsWith('blob:'));
        const newDataImages = [...filteredImages, ...data];

        setUploadedURLs(newDataImages);
        setLocalImages([]);
        api.success({
          message: 'Success!',
          description: 'Upload image successfully!',
        });
      } else {
        api.error({
          message: 'Error!',
          description: 'Error upload multiple images.',
        });
      }
    } catch (error: any) {
      api.error({
        message: 'Error!',
        description: error?.response?.data?.message || 'Error upload multiple images.',
      });
    } finally {
      dispatch(hideLoading());
    }
  };

  const onFinish = (value: any) => {
    let images = [];
    if (uploadedURLs.length) {
      images = uploadedURLs;
    } else {
      images = previewURLs;
    }
    const dataSubmit = { ...value, images };
    if (isOpen.type === 'add') addSession(dataSubmit);
    else updateSession(dataSubmit);
  };

  // ==== Tab Plan ====
  const [planData, setPlanData] = useState<any>({});
  // const [editPlan, setEditPlan] = useState(false);

  const getUserSettingTrading = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/users/get-setting', {
        type: 'POKER',
      });
      setPlanData(data);
    } catch (err) {
      console.log('error123', err);
      setPlanData(null);
    } finally {
      dispatch(hideLoading()); // tắt loading dù có lỗi hay không
    }
  };

  const handleSavePlan = async (data: any, isEdit: boolean) => {
    try {
      dispatch(showLoading());
      if (isEdit) {
        await API.post('/users/update-setting', { ...data });
      } else {
        await API.post('/users/setting', { ...data, type: 'POKER' });
      }
      getUserSettingTrading();
      api.success({
        message: 'Success!',
        description: 'Save plan successfully!',
      });
    } catch {
      api.error({
        message: 'Error!',
        description: 'Error save plan.',
      });
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="poker-session flex-col">
      {/* HEADER */}
      {contextHolder}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => {
            setIsOpen({ status: true, type: 'add' });
            setPreviewURLs([]);
          }}
          icon={<PlusOutlined />}
          type="primary"
        >
          Add Session
        </Button>
        {/* <DatePicker picker="month" value={selectedDate} onChange={(d) => d && setSelectedDate(d)} /> */}
        {/* <div className="flex">
          <p className="mt-2">
            <span style={{ fontWeight: 700 }}>Monthly stats:</span>{' '}
            <Tag color="green" style={{ fontSize: '18px' }}>
              {detailMonth?.profit}
            </Tag>
          </p>
          <button
            onClick={syncPageData}
            className="w-20 h-6 mt-2 bg-indigo-500 text-blue-50 rounded-lg cursor-pointer hover:opacity-90"
          >
            Sync
          </button>
        </div> */}
        <div className="flex w-[50%] justify-end">
          {mode === 'month'
            ? detailMonth && (
              <p className="mt-2">
                <span style={{ fontWeight: 700 }}>Monthly stats:</span>{' '}
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {detailMonth?.count} sessions
                </Tag>
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {detailMonth?.hands} hands
                </Tag>
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {detailMonth?.winrate}
                </Tag>
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {detailMonth?.duration}
                </Tag>
                <Tag
                  color={detailMonth?.dayProfit ? 'green' : 'red'}
                  style={{ fontSize: '18px' }}
                >
                  {detailMonth?.profit}$
                </Tag>
              </p>
            )
            : dataYearStats && (
              <p className="mt-2">
                <span style={{ fontWeight: 700 }}>Yearly stats:</span>{' '}
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {dataYearStats?.count} sessions
                </Tag>
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {dataYearStats?.hands} hands
                </Tag>
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {dataYearStats?.winrate}
                </Tag>
                <Tag color="geekblue" style={{ fontSize: '18px' }}>
                  {dataYearStats?.duration}
                </Tag>
                <Tag
                  color={dataYearStats?.dayProfit ? 'green' : 'red'}
                  style={{ fontSize: '18px' }}
                >
                  {dataYearStats?.profit}$
                </Tag>
              </p>
            )}
          <button
            onClick={syncPageData}
            className="w-20 h-6 mt-2 bg-indigo-500 text-blue-50 rounded-lg cursor-pointer hover:opacity-90"
          >
            Sync
          </button>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="mb-4">
        {/* <Card
          //   className={`shadow-sm ${theme === 'dark' ? 'bg-neutral-900' : 'bg-white'}`}
          style={{ borderRadius: 12 }}
        > */}
        <CustomCalendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          handleSelectDate={handleSelectDate}
          selectedDate={selectedDate}
          handleChangeViewMode={handleChangeViewMode}
        />
        {/* </Card> */}
      </div>

      {/* TABS */}
      <div className="mb-4">
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
          // className={`recent-session mt-4 ${theme === 'dark' && 'recent-sessions-dark'}`}
          className={cx(`recent-session ${theme === 'dark' && 'recent-session-dark'}`, {
            '': theme === 'light',
            'bg-[#222d3f]! text-white!': theme === 'dark',
          })}
        >
          <Tabs
            defaultActiveKey="selecteDay"
            items={[
              {
                key: 'selecteDay',
                label: 'Selected Day Sessions',
                children: (
                  <>
                    <p
                      className={cx('font-bold text-center mb-3', {
                        'text-white': theme === 'dark',
                      })}
                    >
                      {selectedDate.format('DD / MM / YYYY')}
                    </p>
                    {!!selectedDaySessions.length ? (
                      <Table
                        rowKey={(r) => r.id}
                        columns={columns}
                        dataSource={selectedDaySessions}
                        pagination={false}
                        scroll={{ y: 420 }}
                        size="small"
                        className={cx(`w-full`, {
                          '': theme === 'light',
                          'dark-table': theme === 'dark',
                        })}
                        onRow={(record) => ({
                          onClick: () => {
                            setIdUpdate(record.id);
                            form.setFieldsValue({
                              ...record,
                              ...(record?.startTime !== undefined && {
                                startTime: dayjs(record.startTime),
                              }),
                              ...(record?.endTime !== undefined && {
                                endTime: dayjs(record.endTime),
                              }),
                            });
                            setPreviewURLs(record.images);
                            setIsOpen({ status: true, type: 'edit' });
                          },
                        })}
                      />
                    ) : (
                      <p
                        className={cx('font-bold text-center mb-3 text-xl', {
                          'text-white': theme === 'dark',
                        })}
                      >
                        No Trade!
                      </p>
                    )}
                  </>
                ),
              },
              {
                key: 'recent',
                label: 'Recent Sessions',
                children: (
                  <Table
                    rowKey={(r) => r.id}
                    columns={columns}
                    dataSource={sessions}
                    pagination={false}
                    scroll={{ y: 420 }}
                    size="small"
                    className={cx(`w-full`, {
                      '': theme === 'light',
                      'dark-table': theme === 'dark',
                    })}
                    onRow={(record) => ({
                      onClick: () => {
                        setIdUpdate(record.id);
                        form.setFieldsValue({
                          ...record,
                          ...(record?.startTime !== undefined && {
                            startTime: dayjs(record.startTime),
                          }),
                          ...(record?.endTime !== undefined && { endTime: dayjs(record.endTime) }),
                        });
                        setPreviewURLs(record.images);
                        setIsOpen({ status: true, type: 'edit' });
                      },
                    })}
                  />
                ),
              },
              {
                key: 'images',
                label: 'Images',
                children: <ImagesTab theme={theme} type="POKER" />,
              },
              {
                key: 'plan',
                label: 'Plan',
                children: (
                  <PlanSettings
                    planData={planData}
                    getUserSettingTrading={getUserSettingTrading}
                    handleSavePlan={handleSavePlan}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* PSYCHOLOGICAL REMINDERS */}
      {(() => {
        const toggleGroup = (key: string) => {
          setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
        };

        const mindsetGroups = [
          {
            key: 'mindset',
            icon: '🧠',
            title: 'Mindset Nền Tảng',
            cssClass: 'group-mindset',
            quotes: [
              '\u201cI am not here to win today. I am here to become better over 100,000 hands.\u201d',
              '\u201cProfit is the scoreboard. Process is the game.\u201d',
              '\u201cMy job is to make good decisions, not to control the outcome.\u201d',
              '\u201cOne session means nothing. One month means little. The sample is everything.\u201d',
              '\u201cI don\u2019t need to win this hand. I need to play this hand correctly.\u201d',
              '\u201cVariance decides short-term results. My decisions decide my long-term career.\u201d',
              '\u201cJudge yourself by decisions, not by results.\u201d',
            ],
          },
          {
            key: 'winning',
            icon: '💰',
            title: 'Khi Đang WIN — Cực Kỳ Quan Trọng',
            cssClass: 'group-winning',
            quotes: [
              '\u201cBeing up is not a reason to stop.\u201d',
              '\u201cI don\u2019t protect today\u2019s profit. I build tomorrow\u2019s edge.\u201d',
              '\u201cA winning session is not the goal. A good session is the goal.\u201d',
              '\u201cDon\u2019t cash out mentally just because you\u2019re winning.\u201d',
              '\u201c+$100 doesn\u2019t mean my work is finished.\u201d',
              '\u201cI am not paid for winning one session. I am paid for playing thousands of good hands.\u201d',
            ],
            featured: '\u201cWinning is not permission to quit.\u201d',
          },
          {
            key: 'losing',
            icon: '🔥',
            title: 'Khi Đang LOSING',
            cssClass: 'group-losing',
            quotes: [
              '\u201cLosing is not a signal to grind harder.\u201d',
              '\u201cI don\u2019t chase losses. I execute my process.\u201d',
              '\u201cThe money I lost does not belong to the next hand.\u201d',
              '\u201cI don\u2019t need to get even today.\u201d',
              '\u201cA losing session can still be a successful workday.\u201d',
              '\u201cMy bankroll does not need emotional protection. My decision-making does.\u201d',
            ],
            featured: '\u201cI don\u2019t play longer because I am losing. I play longer because it is my planned work.\u201d',
          },
          {
            key: 'badbeat',
            icon: '🧘',
            title: 'Bad Beat / Cooler / Suckout',
            cssClass: 'group-badbeat',
            quotes: [
              '\u201cBad beats are the cost of playing poker.\u201d',
              '\u201cI cannot control the cards. I can control my response.\u201d',
              '\u201cThis hand is over. The next decision is a new decision.\u201d',
              '\u201cI don\u2019t need justice from poker.\u201d',
              '\u201cI don\u2019t need to get my money back from this player.\u201d',
              '\u201cIf the decision was +EV, I am satisfied\u2014even when I lose.\u201d',
            ],
            featured: '\u201cI can lose money and still win the decision.\u201d',
          },
          {
            key: 'agame',
            icon: '🎯',
            title: 'A-Game',
            cssClass: 'group-agame',
            quotes: [
              '\u201cOne decision at a time.\u201d',
              '\u201cSlow down. Observe. Think. Execute.\u201d',
              '\u201cRange first. Hand second.\u201d',
              '\u201cWhat is his range? What is my range? What is the best action?\u201d',
              '\u201cDon\u2019t play my cards. Play the situation.\u201d',
              '\u201cDon\u2019t guess. Build a range.\u201d',
              '\u201cDon\u2019t react to the last hand. Analyze the current hand.\u201d',
              '\u201cStrong players don\u2019t avoid difficult decisions. They make better decisions inside them.\u201d',
            ],
          },
          {
            key: 'discipline',
            icon: '🧊',
            title: 'Discipline',
            cssClass: 'group-discipline',
            quotes: [
              '\u201cI do what I planned, not what I feel like doing.\u201d',
              '\u201cDiscipline is playing when I\u2019m bored and stopping when I\u2019m tilted.\u201d',
              '\u201cConsistency beats intensity.\u201d',
              '\u201cI don\u2019t need motivation. I need a system.\u201d',
              '\u201cI don\u2019t negotiate with my rules during a session.\u201d',
              '\u201cThe professional version of me follows the plan.\u201d',
              '\u201cSmall boring actions, repeated for years, create extraordinary results.\u201d',
            ],
            featured: '\u201cI am building a career, not chasing a session.\u201d',
          },
          {
            key: 'volume',
            icon: '📈',
            title: 'Volume',
            cssClass: 'group-volume',
            quotes: [
              '\u201cMy edge needs a sample size.\u201d',
              '\u201cNo volume, no data. No data, no growth.\u201d',
              '\u201cI cannot judge my poker career from a few sessions.\u201d',
              '\u201cThe goal is not to maximize today\u2019s profit. The goal is to maximize quality volume.\u201d',
              '\u201c100 good hands today are better than 0 hands because I was afraid of losing yesterday\u2019s profit.\u201d',
              '\u201cI get paid for making decisions repeatedly.\u201d',
            ],
            featured: '\u201cVolume is not punishment. Volume is how my edge gets paid.\u201d',
          },
          {
            key: 'stakeup',
            icon: '🏆',
            title: 'Leo Stake',
            cssClass: 'group-stakeup',
            quotes: [
              '\u201cI don\u2019t move up because I run good. I move up because my game is ready.\u201d',
              '\u201cMy goal is not to beat NL10 forever. My goal is to become a player who can beat higher stakes.\u201d',
              '\u201cEvery session is preparation for the next stake.\u201d',
              '\u201cStudy like a NL20 player while playing NL10.\u201d',
              '\u201cBankroll gives me permission to move up. Skill gives me permission to stay.\u201d',
              '\u201cI don\u2019t need to prove I belong at the next stake. I need to prepare until it becomes obvious.\u201d',
            ],
            featured: '\u201cDon\u2019t chase the next stake. Build the player who deserves it.\u201d',
          },
          {
            key: 'fear',
            icon: '💎',
            title: 'Khi Bắt Đầu Sợ Tiền',
            cssClass: 'group-fear',
            quotes: [
              '\u201cChips are units of decision-making, not emotions.\u201d',
              '\u201c$20 is not a threat. It is one unit of variance.\u201d',
              '\u201cI don\u2019t protect my bankroll by playing scared. I protect it by following my risk rules.\u201d',
              '\u201cFear of losing money is not a poker strategy.\u201d',
              '\u201cI accept variance before I sit down.\u201d',
            ],
            featured: '\u201cIf I cannot emotionally accept the normal variance of this stake, I am not ready for this stake.\u201d',
          },
          {
            key: 'identity',
            icon: '🐐',
            title: 'Identity — Phần Quan Trọng Nhất',
            cssClass: 'group-identity',
            quotes: [
              '\u201cI am a poker player who studies, reviews and executes consistently.\u201d',
              '\u201cI am the type of player who finishes what he planned.\u201d',
              '\u201cI am calm when winning and disciplined when losing.\u201d',
              '\u201cI don\u2019t need poker to make me feel good today.\u201d',
              '\u201cI respect the game enough to follow the process.\u201d',
            ],
            featured: '\u201cI am building something that will take years.\u201d',
          },
        ];

        const top10 = [
          { context: 'Trước khi grind', text: '\u201cMy job is to make good decisions, not to control the outcome.\u201d', color: '#3b82f6' },
          { context: 'Trước khi grind', text: '\u201cI am building a career, not chasing a session.\u201d', color: '#3b82f6' },
          { context: 'Trước khi grind', text: '\u201cI do what I planned, not what I feel like doing.\u201d', color: '#3b82f6' },
          { context: 'Khi đang winning', text: '\u201cWinning is not permission to quit.\u201d', color: '#10b981' },
          { context: 'Khi đang winning', text: '\u201cI don\u2019t protect today\u2019s profit. I build tomorrow\u2019s edge.\u201d', color: '#10b981' },
          { context: 'Khi đang losing', text: '\u201cI don\u2019t need to get even today.\u201d', color: '#ef4444' },
          { context: 'Khi đang losing', text: '\u201cLosing is not a signal to grind harder.\u201d', color: '#ef4444' },
          { context: 'Khi vào tough spot', text: '\u201cOne decision at a time.\u201d', color: '#06b6d4' },
          { context: 'Khi vào tough spot', text: '\u201cJudge yourself by decisions, not by results.\u201d', color: '#06b6d4' },
          { context: 'Mục tiêu dài hạn', text: '\u201cDon\u2019t chase the next stake. Build the player who deserves it.\u201d', color: '#f97316' },
        ];

        const mantraLines = [
          ['I don\u2019t chase profit.', 'I don\u2019t chase losses.', 'I don\u2019t protect winnings.'],
          ['I follow my schedule.', 'I play my A-game.', 'I make one good decision at a time.'],
          ['I accept variance.', 'I respect my bankroll.', 'I study when I\u2019m away from the tables.'],
          ['I build volume.', 'I build discipline.', 'I build my edge.'],
          ['I don\u2019t chase the next stake.', 'I become the player who deserves it.'],
        ];

        return (
          <div className="td-card td-mindset-card">
            <div className="td-card-header">
              <Award size={20} className="text-emerald-400" />
              <h3>Poker Mindset & Psychological Reminders</h3>
            </div>

            {/* TOP 10 ESSENTIAL QUOTES */}
            <div className="poker-mindset-top10">
              <div className="top10-header">
                <span className="top10-icon">🔥</span>
                <h4>10 Câu Quan Trọng Nhất</h4>
                <span className="top10-badge">ESSENTIAL</span>
              </div>
              <div className="top10-list">
                {top10.map((item, idx) => (
                  <div key={idx} className="top10-item">
                    <span
                      className="top10-number"
                      style={{
                        background: `${item.color}20`,
                        color: item.color,
                        border: `1px solid ${item.color}40`,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="top10-context">{item.context}</div>
                      <div className="top10-text">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* POKER GRIND MANTRA */}
            <div className="poker-mantra-card">
              <div className="mantra-header">
                <h4>🃏 Poker Grind Mantra</h4>
                <span className="mantra-badge">ĐỌC 30s TRƯỚC MỖI SESSION</span>
              </div>
              <div className="mantra-lines">
                {mantraLines.map((group, gIdx) => (
                  <div key={gIdx} className="mantra-group">
                    {group.map((line, lIdx) => (
                      <div key={lIdx} className="mantra-line">{line}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* GROUPED QUOTES */}
            <div className="poker-mindset-groups">
              {mindsetGroups.map((group) => {
                const isExpanded = expandedGroups[group.key] ?? false;

                return (
                  <div key={group.key} className={`poker-mindset-group ${group.cssClass}`}>
                    <div className="group-header" onClick={() => toggleGroup(group.key)}>
                      <div className="group-header-left">
                        <span className="group-icon">{group.icon}</span>
                        <span className="group-title">{group.title}</span>
                        <span className="group-count">
                          {group.quotes.length + (group.featured ? 1 : 0)}
                        </span>
                      </div>
                      <span className={`group-chevron ${isExpanded ? 'expanded' : ''}`}>▼</span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          className="group-quotes"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          {group.featured && (
                            <div className="group-quote-item group-featured-quote">
                              <p>{group.featured}</p>
                            </div>
                          )}
                          {group.quotes.map((q, qIdx) => (
                            <div key={qIdx} className="group-quote-item">
                              <p>{q}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* MODAL FORM */}
      {isOpen.status && (
        <Modal
          centered
          open={isOpen.status}
          title={
            <div className="flex items-center text-lg font-semibold text-blue-600">
              <ClockCircleOutlined className="mr-2" />
              {isOpen.type === 'add' ? 'Add New Session' : 'Edit Session'}
            </div>
          }
          onCancel={() => {
            form.resetFields();
            setIsOpen({ status: false, type: 'add' });
          }}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Blind"
                  name="blind"
                  rules={[{ required: true, message: 'Please input blind!' }]}
                >
                  <Input placeholder="0.01/0.02" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Format"
                  name="format"
                  rules={[{ required: true, message: 'Please input format!' }]}
                >
                  <Input placeholder="Live 9-max, Online 6-max" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Start Time" name="startTime" rules={[{ required: true }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="End Time" name="endTime">
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Total Before" name="totalBefore">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Total After" name="totalAfter">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Result ($)" name="result">
                  <InputNumber style={{ width: '100%' }} formatter={(v) => `$ ${v}`} step={1} />
                </Form.Item>
              </Col>
              {/* <Col span={12}>
                <Form.Item label="Winrate (bb/100)" name="winrate">
                  <InputNumber style={{ width: '100%' }} step={0.1} />
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item label="Rating" name="rating">
                  <Rate onChange={(val) => setRating(val)} value={rating} />
                </Form.Item>
              </Col>
            </Row>

            {/* <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Rating" name="rating">
                  <Rate onChange={(val) => setRating(val)} value={rating} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Duration" name="duration">
                  <Input placeholder="2h15m" />
                </Form.Item>
              </Col>
            </Row> */}

            <Form.Item label="Your Thought" name="yourThought">
              <Input.TextArea rows={3} placeholder="What went well or badly this session?" />
            </Form.Item>

            <div className="flex justify-between items-center mb-3">
              {/* Image Preview Grid */}
              <div className="flex gap-4 flex-wrap">
                {previewURLs.map((url, idx) => (
                  <div key={idx} className="relative">
                    <div className="w-28 h-28 rounded-xl overflow-hidden border border-gray-300 hover:border-blue-500 transition cursor-pointer">
                      <img
                        src={url}
                        className="w-full h-full object-cover"
                        onClick={() => setSelectedImage(url)}
                      />
                    </div>

                    {/* nút xóa */}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 text-xs flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* + Upload box */}
                <label className="w-28 h-28 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-500">
                  <span className="text-gray-500">+ Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectImages}
                    className="hidden!"
                  />
                </label>

                {/* Image Preview Modal */}
                <AnimatePresence>
                  {selectedImage && (
                    <motion.div
                      className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-1020"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedImage(null)}
                    >
                      <div className="max-h-screen max-w-[90vw] overflow-auto">
                        <motion.img
                          src={selectedImage}
                          className="w-auto max-w-full h-auto max-h-none rounded-lg shadow-xl"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Nút upload đến server */}
              <button
                type="button"
                className={cx(
                  'p-2 cursor-pointer rounded-lg font-semibold transition text-white',
                  theme === 'dark' && 'bg-indigo-400 hover:bg-indigo-700',
                  theme === 'light' && 'bg-blue-400 hover:bg-indigo-600',
                  localImages.length === 0 && 'bg-gray-400! hover:bg-gray-400!',
                )}
                onClick={uploadToServer}
                disabled={localImages.length === 0}
              >
                Upload
              </button>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className="btn-submit-session">
                {isOpen.type === 'add' ? 'Add Session' : 'Save Session'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default Poker;
