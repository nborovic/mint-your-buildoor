import { FC } from 'react';

import { HStack, Spacer } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

import classes from './NavBar.module.scss';

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const NavBar: FC = () => {
  return (
    <HStack width='full' padding={4}>
      <Spacer />
      <WalletMultiButtonDynamic
        className={classes['wallet-adapter-button-trigger']}
      />
    </HStack>
  );
};

export default NavBar;
