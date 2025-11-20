import Image from 'next/image';
import Sidebar from '../components/desktop/Sidebar/Sidebar';
import Topbar from '../components/desktop/Topbar/Topbar';
import './page.scss';
import DailyQuote from '../components/DailyQuote';

export default function Home() {
  return (
    <div className="text-xl flex flex-col items-center">
      <h1 className="mt-6 mb-12">Welcome to The Journey of Discipline</h1>
      <DailyQuote />
    </div>
  );
}
