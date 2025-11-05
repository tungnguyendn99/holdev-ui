import { headers } from 'next/headers';
import Trading from '../../components/desktop/Trading/Trading';
import TradingMobile from '../../components/mobile/TradingMobile/TradingMobile';

export default async function TradingPage() {
  const hdrs = await headers();
  const userAgent = hdrs.get('user-agent') || '';
  const isMobile = /Mobi|Android|iPhone/i.test(userAgent);
  console.log('isMobile', isMobile);

  if (isMobile) {
    return <TradingMobile />;
  }
  return <Trading />;
}
