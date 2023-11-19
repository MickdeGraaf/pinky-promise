import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App.tsx'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import chainsConfig from "./config/chains";

const router = createBrowserRouter([
  {
    path: "*",
    element: <Root />,
  },
]);

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';

import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import Root from './Root.tsx'


const { chains, publicClient } = configureChains(
  chainsConfig,
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    alchemyProvider({ apiKey: "Or2LuQsubZ-IDPClDCnhUB0fN1uKLrdr" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

const theme = extendTheme({
  initialColorMode: "dark",
  useSystemColorMode: false,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <ChakraProvider theme={theme}>
          <RouterProvider router={router}/>
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
)
