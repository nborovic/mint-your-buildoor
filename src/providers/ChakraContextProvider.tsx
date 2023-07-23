import { PropsWithChildren } from 'react';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const colors = {
  background: '#1F1F1F',
  accent: '#833BBE',
  bodyText: 'rgba(255, 255, 255, 0.75)',
};

const theme = extendTheme({ colors });

const ChakraContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

export default ChakraContextProvider;
