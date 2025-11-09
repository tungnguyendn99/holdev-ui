import { DayPicker } from 'react-day-picker';
import { parseISO, format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import cx from 'classnames';
import './ui.scss';
import { useTheme } from 'next-themes';
import moment from 'moment';

const CustomDayPicker = ({
  selectedDate,
  setSelectedDate,
  profitByDate,
  month,
  getDataMonthTrade,
}: any) => {
  const { theme } = useTheme();
  console.log('selectedDate', selectedDate);
  console.log('month', month);

  return (
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      //   onSelect={(p) => console.log('p', p)}
      onMonthChange={getDataMonthTrade}
      month={month}
      className="rounded-lg border shadow-sm p-2 mt-3"
      components={{
        Day: (props) => {
          const date = props.day.date; // ✅ react-day-picker v9 props
          const dateStr = format(date, 'yyyy-MM-dd');
          const profit = profitByDate[dateStr];

          const isProfit = profit > 0;
          const isLoss = profit < 0;
          //   console.log('props', props);
          const dateInMonth = moment(date).isSame(month, 'month');

          if (!dateInMonth) {
            return <th className="rdp-day"></th>;
          }
          return (
            <th
              {...props}
              className={cx(
                'rdp-day',
                {
                  'text-[#0b71d6]!': props.modifiers.selected && theme === 'light',
                  'text-white! ': props.modifiers.selected && theme === 'dark',
                  'bg-emerald-900': isProfit && theme === 'dark',
                  'bg-red-900': isLoss && theme === 'dark',
                },
                isProfit ? 'bg-emerald-100' : isLoss ? 'bg-red-100' : '',
                theme === 'dark' ? 'text-[#a9a9a9]' : 'text-[#656464]',
              )}
              onClick={() => setSelectedDate(date)}
            >
              {/* Ngày */}
              {dateInMonth && (
                <>
                  <span>{date.getDate()}</span>

                  {/* Profit/Loss */}
                  {profit !== undefined && (
                    <span
                      className={cx('text-xs font-semibold', {
                        'text-green-400': isProfit,
                        'text-red-400': isLoss,
                      })}
                    >
                      {profit > 0 ? `+${profit}` : profit}
                    </span>
                  )}
                </>
              )}
            </th>
          );
        },
      }}
    />
  );
};

export default CustomDayPicker;
