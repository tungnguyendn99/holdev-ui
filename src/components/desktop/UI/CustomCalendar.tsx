import React, { useState } from 'react';
import { Calendar, Select, Button, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTheme } from 'next-themes';
import cx from 'classnames';
import './ui.scss';

const CustomCalendar = ({
  dateCellRender,
  monthCellRender,
  handleSelectDate,
  selectedDate,
}: any) => {
  // const [selectedDate, setSelectedDate] = useState(dayjs());
  console.log('selectedDate', selectedDate);
  const { theme } = useTheme();
  const [mode, setMode] = useState<'month' | 'year'>('month');

  const locale: any = {
    lang: {
      locale: 'en_US',
      shortWeekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  };

  return (
    <Calendar
      locale={locale}
      className={cx(
        // base style
        '[&_.ant-picker-cell]:h-[140px]',
        // '[&_.ant-picker-cell-inner]:flex [&_.ant-picker-cell-inner]:items-center [&_.ant-picker-cell-inner]:justify-center',

        // dark mode custom
        {
          'calendar-dark': theme === 'dark', // custom class khi dark
        },
      )}
      value={selectedDate}
      mode={mode}
      onPanelChange={(value, newMode) => {
        handleSelectDate(value);
        setMode(newMode);
      }}
      onSelect={(date) => handleSelectDate(date)}
      dateCellRender={dateCellRender}
      monthCellRender={monthCellRender}
      headerRender={({ value, onChange }) => {
        const year = value.year();
        const month = value.month();

        const years = Array.from({ length: 11 }, (_, i) => year - 5 + i);
        const months = Array.from({ length: 12 }, (_, i) => i);

        return (
          <div
            // className="flex justify-between items-center px-4 py-2 bg-card/50 backdrop-blur-md rounded-lg border border-border mb-2"
            className={cx(
              'flex justify-between items-center px-4 py-2 rounded-lg border mb-2 transition-colors duration-200',
              theme === 'dark'
                ? 'bg-[#3566da] border-[#584ff1] text-white shadow-md'
                : 'bg-card/50 backdrop-blur-md border-border text-black',
            )}
          >
            {/* Left navigation */}
            <Button
              size="large"
              icon={<LeftOutlined />}
              type="text"
              onClick={() => {
                const newDate =
                  mode === 'year'
                    ? value.clone().subtract(1, 'year')
                    : value.clone().subtract(1, 'month');
                onChange(newDate);
              }}
              className={cx(
                'hover:opacity-80 transition',
                theme === 'dark' && 'text-white! hover:text-gray-200!',
              )}
            />

            {/* Center controls */}
            <Space size="small" align="center">
              <Select
                size="large"
                value={year}
                onChange={(newYear) => onChange(value.clone().year(newYear))}
                style={{ width: 120 }}
                options={years.map((y) => ({ label: y, value: y }))}
                className={cx({
                  'dark-select': theme === 'dark',
                })}
              />
              {mode === 'month' && (
                <Select
                  size="large"
                  value={month}
                  onChange={(newMonth) => onChange(value.clone().month(newMonth))}
                  style={{ width: 120 }}
                  options={months.map((m) => ({
                    label: dayjs().month(m).format('MMMM'),
                    value: m,
                  }))}
                  className={cx({
                    'dark-select': theme === 'dark',
                  })}
                />
              )}
              <Button
                size="large"
                onClick={() => setMode(mode === 'month' ? 'year' : 'month')}
                // className="text-xs"
                className={cx('text-xs border-none!', {
                  'bg-indigo-500! text-white! hover:text-gray-200! font-bold!': theme === 'dark',
                })}
              >
                {mode === 'month' ? 'Year View' : 'Month View'}
              </Button>
              <Button
                size="large"
                onClick={() => onChange(dayjs())}
                // className="text-xs"
                className={cx('text-xs border-none!', {
                  'bg-indigo-500! text-white! hover:text-gray-200! font-bold!': theme === 'dark',
                })}
              >
                Today
              </Button>
            </Space>

            {/* Right controls */}
            <Space>
              <Button
                size="large"
                icon={<RightOutlined />}
                type="text"
                onClick={() => {
                  const newDate =
                    mode === 'year' ? value.clone().add(1, 'year') : value.clone().add(1, 'month');
                  onChange(newDate);
                }}
                className={cx(
                  'hover:opacity-80 transition',
                  theme === 'dark' && 'text-white! hover:text-gray-200!',
                )}
              />
            </Space>
          </div>
        );
      }}
    />
  );
};

export default CustomCalendar;
