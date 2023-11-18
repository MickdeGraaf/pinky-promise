import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@chakra-ui/button'

import Root from './Root'

// Hack to force darkmode
localStorage.setItem("chakra-ui-color-mode", "dark");

function App() {

  return (
    <>
      <Root />
    </>
  )
}

export default App
