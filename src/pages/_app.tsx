import type { AppProps } from 'next/app';

import ChakraContextProvider from 'providers/ChakraContextProvider';
import WalletContextProvider from 'providers/WalletContextProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraContextProvider>
      <WalletContextProvider>
        <Component {...pageProps} />
      </WalletContextProvider>
    </ChakraContextProvider>
  );
}
