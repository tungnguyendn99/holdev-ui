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
import { Eye, Images, Star } from 'lucide-react';
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

  // const getDataMonths = async () => {
  //   try {
  //     dispatch(showLoading());
  //     const { data } = await API.post('/poker/group', {
  //       mode: 'year',
  //       group: 'month',
  //       //   dateString: selectedDate.format('YYYY-MM'),
  //     });
  //     setDataMonths(data);
  //     setDetailMonth(data[selectedDate.format('YYYY-MM')]);
  //   } catch (err) {
  //     console.log('error123', err);
  //   } finally {
  //     dispatch(hideLoading());
  //   }
  // };

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
        // getDataMonths(),
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
    // getDataMonths();
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
        <span className={cx(`text-[#0D706E]`)}>{winrate}</span>
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
        <span className="text-[#0D706E]">{monthData?.winrate}</span>
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
                        // size="small"
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
                    // size="small"
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
