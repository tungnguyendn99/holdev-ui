import { headers } from 'next/headers';
import Poker from '../../components/desktop/Poker/Poker';
import PokerMobile from '../../components/mobile/PokerMobile/PokerMobile';

export default async function TradingPage() {
  const hdrs = await headers();
  const userAgent = hdrs.get('user-agent') || '';
  const isMobile = /Mobi|Android|iPhone/i.test(userAgent);
  console.log('isMobile', isMobile);

  if (isMobile) {
    // return <TradingMobile />;
    return <PokerMobile />;
  }
  return <Poker />;
}
