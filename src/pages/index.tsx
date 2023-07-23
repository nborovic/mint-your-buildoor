import { Stack, Spacer, Center, Box } from '@chakra-ui/layout';
import { useWallet } from '@solana/wallet-adapter-react';
import Head from 'next/head';

import Connected from 'components/Connected';
import Disconnected from 'components/Disconnected';
import NavBar from 'components/NavBar';

export default function Home() {
  const { connected } = useWallet();

  return (
    <>
      <Head>
        <title>Buildoors</title>
        <meta name='The NFT Collection for Buildoors' />
        <link rel='icon' href='/assets/favicon.ico' />
      </Head>
      <main>
        <Box
          w='full'
          h='calc(100vh)'
          bgImage={'url(/assets/images/backgrounds/home-background.svg)'}
          backgroundPosition='center'
        >
          <Stack w='full' h='calc(100vh)' justify='center'>
            <NavBar />

            <Spacer />
            <Center>
              <Center>{connected ? <Connected /> : <Disconnected />}</Center>
            </Center>
            <Spacer />

            <Center>
              <Box marginBottom={4} color='white'>
                <a
                  href='https://twitter.com/_buildspace'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  built with @_buildspace
                </a>
              </Box>
            </Center>
          </Stack>
        </Box>
      </main>
    </>
  );
}
