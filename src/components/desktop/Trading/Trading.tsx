'use client';
import React, { useEffect, useState } from 'react';
import './Trading.scss';
import './../UI/ui.scss';
import {
  Badge,
  BadgeProps,
  Button,
  Calendar,
  CalendarProps,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Radio,
  Rate,
  Row,
  Select,
  Tabs,
  Tag,
} from 'antd';
import moment, { Moment } from 'moment';
import dayjs, { Dayjs } from 'dayjs';
import cx from 'classnames';
import { PlusOutlined, SlidersOutlined } from '@ant-design/icons';
import Table, { ColumnsType } from 'antd/es/table';
import { useTheme } from 'next-themes';
import { useWindowResize } from '../../../common/func';
import API from '../../../utils/api';
import TradingMobile from '../../mobile/TradingMobile/TradingMobile';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { hideLoading, showLoading } from '../../../store/slices/user.slice';
import { openNotification } from '../../../common/utils.notification';
import { Label } from '../../../../components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import CustomCalendar from '../UI/CustomCalendar';
import { ImagesTab } from '../User/User';
import PlanSettings from '../../mobile/TradingMobile/Plan';
import { handleClosedBy } from '../../mobile/UI/ClosedByTag';

const getMonthData = (value: Dayjs) => {
  if (value.month() === 8) {
    return 1394;
  }
};

const Trading = () => {
  const isMobile = useWindowResize(576);
  const { Option } = Select;
  const data: any = {};
  const [form] = Form.useForm();
  const locale: any = {
    lang: {
      locale: 'en_US',
      shortWeekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekStartsOn: 1,
    },
  };
  const { theme } = useTheme();

  const [dataDays, setDataDays] = useState<any>({});
  const [dataMonth, setDataMonth] = useState<any>({});
  const [dataYear, setDataYear] = useState<any>({});
  const [dataRecent, setDataRecent] = useState<any>([]);
  const [selectedDayTrades, setSelectedDayTrades] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [openDetail, setOpenDetail] = useState<any>({
    open: false,
    data: {},
  });
  const [isOpenAddTrade, setIsOpenAddTrade] = useState<any>({
    status: false,
    type: 'add',
  });
  const [activeKey, setActiveKey] = useState('selecteDay');
  const [closedBy, setClosedBy] = useState(closeByList[0].value);
  const [rating, setRating] = useState(0);
  const [idUpdate, setIdUpdate] = useState('');

  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);

  const addTrade = async (formData: any) => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/add-trade', {
        ...formData,
      });
      syncPageData();
      setIsOpenAddTrade({ status: false });
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const updateTrade = async (formData: any) => {
    try {
      dispatch(showLoading());
      console.log('formData', formData);

      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/update', {
        ...formData,
        id: idUpdate,
      });
      syncPageData();
      setIsOpenAddTrade({ status: false });
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const getDataDaysTrade = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/group', {
        mode: 'month',
        dateString: selectedDate.format('YYYY-MM'),
      });
      setDataDays(data);
    } catch (err) {
      console.log('error123', err);
    }
  };
  const getDataMonthTrade = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/group', {
        mode: 'month',
        group: 'month',
        dateString: selectedDate.format('YYYY-MM'),
      });
      setDataMonth(data[selectedDate.format('YYYY-MM')]);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const getDataYearTrade = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/group', {
        mode: 'year',
        group: 'month',
      });
      setDataYear(data);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };
  const getRecentTrade = async () => {
    try {
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/list', { mode: 'month' });
      setDataRecent(data);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const getSelectedDayTrades = async () => {
    try {
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/list', {
        mode: 'day',
        dateString: selectedDate.format('YYYY-MM-DD'),
      });
      setSelectedDayTrades(data);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getRecentTrade();
  }, []);

  useEffect(() => {
    getDataDaysTrade();
    getDataMonthTrade();
    getSelectedDayTrades();
  }, [selectedDate]);

  // const syncPageData = async () => {
  //   getRecentTrade();
  //   getDataDaysTrade();
  //   getDataMonthTrade();
  // };

  const syncPageData = async () => {
    try {
      dispatch(showLoading());
      // Gọi 3 API song song
      await Promise.all([
        getRecentTrade(),
        getDataDaysTrade(),
        getDataMonthTrade(),
        getDataYearTrade(),
        getSelectedDayTrades(),
      ]);
    } catch (err) {
      console.error('Lỗi khi sync dữ liệu:', err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleMonthYearChange = (date: any) => {
    console.log('date', date);
    setSelectedDate(date); // Cập nhật ngày đã chọn
  };
  const handleDateChange = (date: any) => {
    // setDate(moment(date).format('YYYY-MM-DD'));
  };
  const customHeaderRender = () => <></>;
  const disabledDate = (current: Dayjs) => {
    return !current.isSame(selectedDate, 'month'); // Vô hiệu hóa các ngày không thuộc tháng hiện tại
  };
  const dateCellRender = (value: Dayjs) => {
    // console.log('value', value.format('YYYY-MM-DD'));
    // console.log('value1', value.format('YYYY-MM'));

    // const listData = getListData(value);
    const data = dataDays[value.format('YYYY-MM-DD')];
    if (data && value.isSame(selectedDate, 'month')) {
      return (
        // <ul className="events">
        //   {listData.map((item, i) => (
        //     <li key={i}>
        //       <Badge status={item.type as BadgeProps['status']} text={item.content} />
        //     </li>
        //   ))}
        // </ul>
        <div
          className={cx(
            'dayTrade font-semibold',
            data.dayProfit && 'profit',
            data.dayLoss && 'loss',
          )}
          onClick={() => setSelectedDate(value)}
        >
          <p className="profit-cell">
            <span
              className={cx(`font-semibold ${data.dayProfit ? 'text-green-600' : 'text-red-400'}`)}
            >
              {data?.profit}$
            </span>{' '}
            {/* ({data?.reward}) */}
          </p>
          <p className={cx(`${'text-[#4b3db6]'}`)}>
            {data?.trades} {data?.trades > 1 ? 'trades' : 'trade'}
          </p>
          <p className={cx(`${theme === 'light' && 'text-[#737373]'}`)}>
            {data?.winrate} ({data?.reward}R)
          </p>
        </div>
      );
    }
  };

  const monthCellRender = (value: Dayjs) => {
    console.log('dataYear', dataYear);
    const dateKey = value.format('YYYY-MM');
    const monthData = dataYear[dateKey];

    if (!monthData) return null;

    return (
      <div
        className={cx(
          'dayTrade font-semibold',
          monthData.dayProfit && 'profit',
          monthData.dayLoss && 'loss',
        )}
        onClick={() => setSelectedDate(value)}
      >
        <p className="profit-cell">
          <span
            className={cx(
              `font-semibold ${monthData.dayProfit ? 'text-green-500' : 'text-red-400'}`,
            )}
          >
            {monthData?.profit}$
          </span>{' '}
          {/* ({data?.reward}) */}
        </p>
        <p className={cx(`${theme === 'light' && 'text-[#737373]'}`)}>
          {monthData?.trades} {monthData?.trades > 1 ? 'trades' : 'trade'}
        </p>
        <p className={cx(`${theme === 'light' && 'text-[#737373]'}`)}>
          {monthData?.winrate} ({monthData?.reward}R)
        </p>
      </div>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    if (info.type === 'month') {
      return monthCellRender(current);
    }
    return info.originNode;
  };

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <span
          className="font-bold"
          // onClick={() => {
          //   console.log('asd', { ...record });
          //   setIdUpdate(record.id);
          //   form.setFieldsValue({
          //     ...record,
          //     ...(record?.entryTime !== undefined && { entryTime: dayjs(record.entryTime) }),
          //     ...(record?.closeTime !== undefined && { closeTime: dayjs(record.closeTime) }),
          //   });
          //   setPreviewURLs(record.images);
          //   setIsOpenAddTrade({ status: true, type: 'edit' });
          // }}
        >
          {record.symbol}
        </span>
      ),
    },
    {
      title: 'Side',
      dataIndex: 'tradeSide',
      key: 'tradeSide',
      width: 60,
      align: 'center',
      render: (text) => (
        <span className={cx(`font-semibold ${text === 'BUY' ? 'text-green-500' : 'text-red-400'}`)}>
          {text}
        </span>
      ),
    },
    {
      title: 'Close Date',
      dataIndex: 'closeTime',
      key: 'closeTime',
      align: 'center',
      width: 90,
      render: (text) => <span>{moment(text).format('HH:mm ~~ DD/MM/YYYY')}</span>,
    },
    {
      title: 'Time',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      align: 'center',
      render: (text) => <span className={cx(``)}>⏳ {text}</span>,
    },
    {
      title: 'Closed By',
      dataIndex: 'closedBy',
      key: 'closedBy',
      width: 80,
      align: 'center',
      render: (text) => <>{handleClosedBy(text)}</>,
    },
    {
      title: 'Net P&L',
      dataIndex: 'result',
      key: 'result',
      width: 80,
      align: 'center',
      render: (pnl: number) => (
        <span
          // style={{
          //   color: pnl >= 0 ? '#16a34a' : '#dc2626',
          //   fontWeight: 600,
          // }}
          className={cx(`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`)}
        >
          {pnl === null || pnl === undefined
            ? undefined
            : pnl >= 0
              ? `$${pnl.toLocaleString()}`
              : `-$${Math.abs(pnl).toLocaleString()}`}
        </span>
      ),
    },
    {
      title: '',
      dataIndex: 'view',
      key: 'view',
      width: 40,
      align: 'center',
      render: (_, record) => (
        <span
          className="cursor-pointer flex justify-center"
          onClick={() => {
            console.log('asd', { ...record });
            setIdUpdate(record.id);
            form.setFieldsValue({
              ...record,
              ...(record?.entryTime !== undefined && { entryTime: dayjs(record.entryTime) }),
              ...(record?.closeTime !== undefined && { closeTime: dayjs(record.closeTime) }),
            });
            setPreviewURLs(record.images);
            setIsOpenAddTrade({ status: true, type: 'edit' });
          }}
        >
          <Eye />
        </span>
      ),
    },
  ];

  // if (isMobile) {
  //   return <TradingMobile />;
  // }

  //upload excel
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState<string>('');
  const [api, contextHolder] = notification.useNotification();

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
    if (e.target.files?.length) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    // Tên 'file' phải khớp với tên trong FileInterceptor('file') của NestJS
    formData.append('file', file);

    try {
      dispatch(showLoading());
      // Thay đổi URL API của bạn
      const response = await API.post('/trading/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      api.success({
        message: 'Success!',
        description: response.data.message,
      });
      setFile(null);
      setFileName('');
      syncPageData();
    } catch (error) {
      api.error({
        message: 'Error!',
        description: 'error upload excel',
      });
    } finally {
      dispatch(hideLoading());
    }
  };

  //upload images
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
  }, [isOpenAddTrade]);
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
      formData.append('type', 'TRADING');
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

    if (isOpenAddTrade.type === 'add') {
      return addTrade(dataSubmit);
    } else {
      return updateTrade(dataSubmit);
    }
  };

  // ==== Tab Plan ====
  const [planData, setPlanData] = useState<any>({});
  // const [editPlan, setEditPlan] = useState(false);

  const getUserSettingTrading = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/users/get-setting', {
        type: 'TRADING',
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
        await API.post('/users/update-setting', { ...data, type: 'TRADING' });
      } else {
        await API.post('/users/setting', { ...data, type: 'TRADING' });
      }
      getUserSettingTrading();
      openNotification('success', { message: 'Lưu kế hoạch thành công' });
    } catch {
      openNotification('error', { message: 'Lỗi khi lưu kế hoạch' });
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="trading pb-16">
      {/* CALENDAR */}
      <div className="mb-4">
        {/* <Card
                //   className={`shadow-sm ${theme === 'dark' ? 'bg-neutral-900' : 'bg-white'}`}
                style={{ borderRadius: 12 }}
              > */}
        <div className="flex justify-between mb-3">
          {/* <DatePicker
            picker="month"
            onChange={handleMonthYearChange}
            className="datepicker"
            defaultValue={dayjs()}
            placeholder="Chọn tháng và năm"
            cellRender={(current: any) => <div>Tháng {current.format('MM')}</div>}
          /> */}
          <div className="flex gap-2 w-[75%]">
            <Button
              className="btn-add"
              onClick={() => {
                setIsOpenAddTrade({ status: true, type: 'add' });
                setPreviewURLs([]);
              }}
            >
              <PlusOutlined /> Add New Trade
            </Button>
            <div className="flex w-[50%] items-center justify-between gap-3 shadow-sm border border-border bg-white rounded-xl">
              {/* File input */}
              {contextHolder}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Label
                  htmlFor="excel-upload"
                  className="cursor-pointer bg-indigo-50 text-indigo-600 font-medium px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition"
                >
                  Chọn file
                </Label>
                <input
                  id="excel-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx"
                  className="hidden"
                />
                <span className="text-sm text-muted-foreground truncate">
                  {fileName || 'Chưa có file nào được chọn'}
                </span>
              </div>

              {/* Upload button */}
              <Button
                onClick={handleUpload}
                disabled={!file}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-36"
              >
                Upload & Save
              </Button>
            </div>
          </div>
          <div className="flex">
            <p className="mt-2">
              <span style={{ fontWeight: 700 }}>Monthly stats:</span>{' '}
              <Tag color="green" style={{ fontSize: '18px' }}>
                {dataMonth?.profit}
              </Tag>
            </p>
            <button
              onClick={syncPageData}
              className="w-20 h-6 mt-2 bg-indigo-500 text-blue-50 rounded-lg cursor-pointer hover:opacity-90"
            >
              Sync
            </button>
          </div>
        </div>
        <CustomCalendar
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
          handleSelectDate={handleSelectDate}
          selectedDate={selectedDate}
        />
        {/* </Card> */}
      </div>
      <div className="">
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
          // className="recent-trade"
          className={cx(`recent-trade ${theme === 'dark' && 'recent-trade-dark'}`, {
            '': theme === 'light',
            'bg-[#222d3f]! text-white!': theme === 'dark',
          })}
          // bodyStyle={{ padding: 16 }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            items={[
              {
                key: 'selecteDay',
                label: 'Selected Day Trades',
                children: (
                  <>
                    <p
                      className={cx('font-bold text-center mb-3', {
                        'text-white': theme === 'dark',
                      })}
                    >
                      {selectedDate.format('DD / MM / YYYY')}
                    </p>
                    {!!selectedDayTrades.length ? (
                      <Table
                        rowKey={(r) => r.id}
                        columns={columns}
                        dataSource={selectedDayTrades}
                        pagination={false}
                        scroll={{ y: 420 }}
                        size="small"
                        // className="table-trades"
                        className={cx(`w-full`, {
                          '': theme === 'light',
                          'dark-table': theme === 'dark',
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
                label: 'Recent Trades',
                children: (
                  <Table
                    rowKey={(r) => r.id}
                    columns={columns}
                    dataSource={dataRecent}
                    pagination={false}
                    scroll={{ y: 420 }}
                    size="small"
                    // className="table-trades"
                    className={cx(`table-trades`, {
                      '': theme === 'light',
                      'dark-table': theme === 'dark',
                    })}
                  />
                ),
              },
              {
                key: 'images',
                label: 'Images',
                children: (
                  <ImagesTab theme={theme} type="TRADING" active={activeKey === 'images'} />
                ),
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
      {isOpenAddTrade.status && (
        <Modal
          centered
          open={isOpenAddTrade.status}
          title={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '20px',
                color: '#3977bd',
                paddingBottom: '0.2rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #dddddd',
              }}
            >
              <SlidersOutlined style={{ marginRight: '5px' }} />{' '}
              {isOpenAddTrade.type === 'add' ? 'Add New Trade' : 'Edit Trade'}
            </div>
          }
          okText={null}
          // cancelText={'Cancel'}
          // cancelButtonProps={{ type: 'text', size: 'large' }}
          // okButtonProps={{ size: 'large' }}
          width={720}
          className="modal-add-trade"
          // onOk={() => {
          //   () => setIsOpenAddTrade(false);
          // }}
          keyboard={false}
          onCancel={() => {
            form.resetFields();
            setIsOpenAddTrade({ status: false });
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ tradeSide: 'LONG' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Symbol"
                  name="symbol"
                  rules={[{ required: true, message: 'Please input the symbol!' }]}
                >
                  <Input
                    style={{ width: '100%' }}
                    placeholder="e.g. BTCUSD, XAUUSD"
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Lots"
                  name="lots"
                  rules={[{ required: true, message: 'Please input lots!' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    placeholder="e.g. 0.5"
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Entry Price"
                  name="entryPrice"
                  rules={[{ required: true, message: 'Please input entry price!' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Close Price"
                  name="closePrice"
                  // rules={[{ required: true, message: 'Please input close price!' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Stop Loss"
                  name="stopLoss"
                  rules={[{ required: true, message: 'Please input stop loss!' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Take Profit"
                  name="takeProfit"
                  // rules={[{ required: true, message: 'Please input take profit!' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Entry Time"
                  name="entryTime"
                  rules={[{ required: true, message: 'Please select entry time!' }]}
                >
                  <DatePicker showTime style={{ width: '100%' }} className="input-trade" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Close Time"
                  name="closeTime"
                  // rules={[{ required: true, message: 'Please select close time!' }]}
                >
                  <DatePicker showTime style={{ width: '100%' }} className="input-trade" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Trade Side"
                  name="tradeSide"
                  rules={[{ required: true, message: 'Please select trade side!' }]}
                >
                  <Radio.Group className="trade-side-group">
                    <Radio.Button value="BUY" className="trade-side buy">
                      BUY
                    </Radio.Button>
                    <Radio.Button value="SELL" className="trade-side sell">
                      SELL
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Result (USD)"
                  name="result"
                  // rules={[{ required: true, message: 'Please input result!' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    step={0.01}
                    formatter={(value) => `$ ${value}`}
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Closed By"
                  name="closedBy"
                  // rules={[{ required: true, message: 'Please select trade side!' }]}
                >
                  <Select
                    style={{ width: '100%' }}
                    className="input-trade"
                    placeholder="Please input closed by"
                    value={closedBy}
                    onChange={(v) => setClosedBy(v)}
                  >
                    {closeByList.map((item: any, index: number) => (
                      <Option key={index} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Rating"
                  name="rating"
                  // rules={[{ required: false, message: 'Please rate your trade' }]}
                >
                  <Rate onChange={(value) => setRating(value)} value={rating} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Your Thought"
                  name="yourThought"
                  rules={[{ required: false, message: 'Please input the symbol!' }]}
                >
                  <Input
                    style={{ width: '100%' }}
                    placeholder="Your thought..."
                    className="input-trade"
                  />
                </Form.Item>
              </Col>
              {/* <Col span={12}>
                <Form.Item
                  label="Rating"
                  name="rating"
                  rules={[{ required: false, message: 'Please rate your trade' }]}
                >
                  <Rate onChange={(value) => setRating(value)} value={rating} />
                </Form.Item>
              </Col> */}
            </Row>

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
                      className="fixed inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedImage(null)}
                    >
                      <motion.img
                        src={selectedImage}
                        className="max-w-[80%] max-h-[80%] rounded-lg shadow-xl"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                      />
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
              <Button type="primary" htmlType="submit" block className="btn-submit-trade">
                {isOpenAddTrade.type === 'add' ? 'Add Trade' : 'Save Trade'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default Trading;

const symbolList = [
  {
    label: 'BTC/USD',
    value: 'BTCUSD',
  },
  {
    label: 'ETH/USD',
    value: 'ETHUSD',
  },
  {
    label: 'XAU/USD',
    value: 'XAUUSD',
  },
  {
    label: 'EUR/USD',
    value: 'EURUSD',
  },
  {
    label: 'USTECH',
    value: 'USTECH',
  },
  {
    label: 'US500',
    value: 'US500',
  },
  {
    label: 'US30',
    value: 'US30',
  },
];

const closeByList = [
  { label: 'Stop Loss', value: 'SL' },
  { label: 'Take Profit', value: 'TP' },
  { label: 'Break Even', value: 'BE' },
  { label: 'Manually', value: 'MA' },
  { label: 'Stop Out', value: 'SO' },
];

const dataTrades: any[] = [
  { key: '1', date: '09/29/2025', symbol: 'BTCUSD', pnl: 6 },
  { key: '2', date: '09/29/2025', symbol: 'BTCUSD', pnl: -4 },
  { key: '3', date: '09/29/2025', symbol: 'BTCUSD', pnl: 8 },
  { key: '4', date: '09/29/2025', symbol: 'XAUUSD', pnl: -4 },
  { key: '5', date: '09/29/2025', symbol: 'XAUUSD', pnl: 12 },
  { key: '6', date: '09/29/2025', symbol: 'XAUUSD', pnl: -4 },
];
