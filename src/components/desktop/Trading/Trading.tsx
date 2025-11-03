'use client';
import React, { useState } from 'react';
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
  console.log('isMobile', isMobile);
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
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [openDetail, setOpenDetail] = useState<any>({
    open: false,
    data: {},
  });
  const [isOpenAddTrade, setIsOpenAddTrade] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState('recent');
  const [closedBy, setClosedBy] = useState(closeByList[0].value);
  const [rating, setRating] = useState(0);

  if (isMobile) {
    return <p>The feature is developing!</p>;
  }

  const handleMonthYearChange = (date: any) => {
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
    // const listData = getListData(value);
    const data = sampleData[value.date()];
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
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Close Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      align: 'center',
    },
    {
      title: 'Net P&L',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 120,
      align: 'right',
      render: (pnl: number) => (
        <span
          style={{
            color: pnl >= 0 ? '#16a34a' : '#dc2626',
            fontWeight: 600,
          }}
        >
          {pnl >= 0 ? `$${pnl.toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`}
        </span>
      ),
    },
  ];

  return (
    <div className="trading">
      <div className="add-trade">
        <Button className="btn-add" onClick={() => setIsOpenAddTrade(true)}>
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
                    columns={columns}
                    dataSource={dataTrades}
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
            defaultValue={moment()}
            placeholder="Chọn tháng và năm"
            cellRender={(current: any) => <div>Tháng {current.format('MM')}</div>}
          />
          <div>
            <p>
              <span style={{ fontWeight: 700 }}>Monthly stats:</span>{' '}
              <Tag color="green" style={{ fontSize: '18px' }}>
                4$
              </Tag>
            </p>
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
      {isOpenAddTrade && (
        <Modal
          centered
          open={isOpenAddTrade}
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
              <SlidersOutlined style={{ marginRight: '5px' }} /> {'Add New Trade'}
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
          onCancel={() => setIsOpenAddTrade(false)}
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
                  rules={[{ required: true, message: 'Please input close price!' }]}
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
                  rules={[{ required: true, message: 'Please input take profit!' }]}
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
                  rules={[{ required: true, message: 'Please select close time!' }]}
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
                  rules={[{ required: true, message: 'Please input result!' }]}
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
                  rules={[{ required: true, message: 'Please select trade side!' }]}
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
                  rules={[{ required: false, message: 'Please rate your trade' }]}
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
                Save Trade
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
