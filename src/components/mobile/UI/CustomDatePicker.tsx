import { DayPicker } from 'react-day-picker';
import { parseISO, format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import cx from 'classnames';
import './ui.scss';

const CustomDayPicker = ({
  selectedDate,
  setSelectedDate,
  profitByDate,
  month,
  getDataMonthTrade,
}: any) => {
  return (
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      onMonthChange={getDataMonthTrade}
      month={month}
      className="rounded-lg border shadow-sm p-2 mt-3 text-white"
      components={{
        Day: (props) => {
          const date = props.day.date;
          const dateStr = format(date, 'yyyy-MM-dd');
          const profit = profitByDate[dateStr];

          const isProfit = profit > 0;
          const isLoss = profit < 0;

          return (
            <div
              {...props}
              className={cx('rdp-day relative flex items-center justify-center transition', {
                'bg-[#584ff1] text-white font-semibold': props.modifiers.selected,
                'hover:bg-[#2a2658] hover:text-white': !props.modifiers.selected,
              })}
            >
              {/* Ngày */}
              <span>{date.getDate()}</span>

              {/* Profit/Loss bên dưới */}
              {profit !== undefined && (
                <span
                  className={cx('text-xs mt-1 font-semibold', {
                    'text-green-400': isProfit,
                    'text-red-400': isLoss,
                  })}
                >
                  {profit > 0 ? `+${profit}` : profit}
                </span>
              )}
            </div>
          );
        },
      }}
    />
  );
};

export default CustomDayPicker;
