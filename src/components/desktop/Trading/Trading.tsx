'use client';
import React, { useEffect, useState } from 'react';
import './Trading.scss';
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

const getListData = (value: Dayjs) => {
  let listData: { type: string; content: string }[] = []; // Specify the type of listData
  switch (value.date()) {
    case 10:
      listData = [
        { type: 'success', content: '6$' },
        { type: 'success', content: '4 trades' },
        { type: 'success', content: '50%' },
        // { type: 'error', content: 'This is warning event.' },
      ];
      break;
    case 11:
      listData = [
        { type: 'error', content: 'This is error event.' },
        { type: 'error', content: 'This is error event.' },
        { type: 'error', content: 'This is error event.' },
      ];
      break;
    // case 15:
    //   listData = [
    //     { type: 'warning', content: 'This is warning event' },
    //     { type: 'success', content: 'This is very long usual event......' },
    //     { type: 'error', content: 'This is error event 1.' },
    //     { type: 'error', content: 'This is error event 2.' },
    //     { type: 'error', content: 'This is error event 3.' },
    //     { type: 'error', content: 'This is error event 4.' },
    //   ];
    //   break;
    default:
  }
  return listData || [];
};

const sampleData: any = {
  1: null,
  7: {
    profit: '-8$',
    reward: '-2R',
    trades: '7 trades',
    winrate: '20%',
    dayProfit: false,
    dayLoss: true,
  },
  9: {
    profit: '4$',
    reward: '1R',
    trades: '5 trades',
    winrate: '60%',
    dayProfit: true,
    dayLoss: false,
  },
  10: {
    profit: '4$',
    reward: '1R',
    trades: '5 trades',
    winrate: '60%',
    dayProfit: true,
    dayLoss: false,
  },
  16: {
    profit: '4$',
    reward: '1R',
    trades: '5 trades',
    winrate: '60%',
    dayProfit: true,
    dayLoss: false,
  },
};

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
      shortWeekDays: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      weekStartsOn: 1,
    },
  };
  const { theme } = useTheme();

  const [dataDays, setDataDays] = useState<any>({});
  const [dataMonth, setDataMonth] = useState<any>({});
  const [dataRecent, setDataRecent] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [openDetail, setOpenDetail] = useState<any>({
    open: false,
    data: {},
  });
  const [isOpenAddTrade, setIsOpenAddTrade] = useState<any>({
    status: false,
    type: 'add',
  });
  const [activeKey, setActiveKey] = useState('recent');
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
      const { data } = await API.post('/trading/list', {
        mode: 'day',
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
      const { data } = await API.post('/trading/list', {
        mode: 'month',
        dateString: selectedDate.format('YYYY-MM'),
      });
      setDataMonth(data[selectedDate.format('YYYY-MM')]);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading());
    }
  };
  const getRecentTrade = async () => {
    try {
      // Simulate API call (replace with actual API request)
      const { data } = await API.post('/trading/list', {});
      setDataRecent(data);
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
      await Promise.all([getRecentTrade(), getDataDaysTrade(), getDataMonthTrade()]);
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
        <div className={cx('dayTrade', data.dayProfit && 'profit', data.dayLoss && 'loss')}>
          <p className="profit-cell">
            {data?.profit} ({data?.reward})
          </p>
          <p>{data?.trades}</p>
          <p>{data?.winrate}</p>
        </div>
      );
    }
  };

  const monthCellRender = (value: Dayjs) => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
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

  const onFinish = (value: any) => {
    console.log('test finish', value);
    console.log('time', moment(value.entryTime.format()));
    if (isOpenAddTrade.type === 'add') {
      return addTrade(value);
    } else {
      return updateTrade(value);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Close Date',
      dataIndex: 'closeTime',
      key: 'closeTime',
      width: 110,
      render: (text) => <span>{moment(text).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <span
          className="cursor-pointer"
          onClick={() => {
            console.log('asd', { ...record });
            setIdUpdate(record.id);
            form.setFieldsValue({
              ...record,
              ...(record?.entryTime !== undefined && { entryTime: dayjs(record.entryTime) }),
              ...(record?.closeTime !== undefined && { closeTime: dayjs(record.closeTime) }),
            });
            setIsOpenAddTrade({ status: true, type: 'edit' });
          }}
        >
          {record.symbol}
        </span>
      ),
    },
    {
      title: 'Trade Side',
      dataIndex: 'tradeSide',
      key: 'tradeSide',
      width: 80,
      align: 'center',
      render: (text) => (
        <span className={cx(`font-bold ${text === 'BUY' ? 'text-green-500' : 'text-red-400'}`)}>
          {text}
        </span>
      ),
    },
    {
      title: 'Net P&L',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      align: 'right',
      render: (pnl: number) => (
        <span
          style={{
            color: pnl >= 0 ? '#16a34a' : '#dc2626',
            fontWeight: 600,
          }}
        >
          {!pnl
            ? undefined
            : pnl >= 0
              ? `$${pnl.toLocaleString()}`
              : `-$${Math.abs(pnl).toLocaleString()}`}
        </span>
      ),
    },
  ];

  // if (isMobile) {
  //   return <TradingMobile />;
  // }

  return (
    <div className="trading">
      <div className="add-trade">
        <Button
          className="btn-add"
          onClick={() => setIsOpenAddTrade({ status: true, type: 'add' })}
        >
          <PlusOutlined /> Add New Trade
        </Button>
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
          // className="recent-trade"
          className={`recent-trade ${theme === 'dark' && 'recent-trade-dark'}`}
          // bodyStyle={{ padding: 16 }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            items={[
              {
                key: 'recent',
                label: 'Recent trades',
                children: (
                  <Table
                    rowKey={(r) => r.id}
                    columns={columns}
                    dataSource={dataRecent}
                    pagination={false}
                    scroll={{ y: 240 }}
                    size="small"
                    className="table-trades"
                  />
                ),
              },
              {
                key: 'plan',
                label: 'Plan',
                children: (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: '40px 0',
                      color: '#9ca3af',
                    }}
                  >
                    Plan Setting
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
      <div className="calendar">
        <div className="calendar-title">
          <DatePicker
            picker="month"
            onChange={handleMonthYearChange}
            className="datepicker"
            defaultValue={dayjs()}
            placeholder="Chọn tháng và năm"
            cellRender={(current: any) => <div>Tháng {current.format('MM')}</div>}
          />
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
        <Calendar
          className="calendarContainer"
          locale={locale}
          headerRender={customHeaderRender}
          cellRender={cellRender}
          disabledDate={disabledDate}
          value={selectedDate}
          // onSelect={handleDateChange}
        />
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
                  label="Volume"
                  name="volume"
                  rules={[{ required: true, message: 'Please input volume!' }]}
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
