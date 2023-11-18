import react from 'react';
import { HeaderMenu } from './components/HeaderMenu';
import { Route, Routes } from 'react-router';
import Bonds from './pages/Bonds';
import Verify from './pages/Verify';
import Lend from './pages/Lend';
import ManageBond from './pages/ManageBond';

const Root = () => {
    return (
        <>
        <HeaderMenu />
        <Routes>
            <Route path="/" element={<Bonds />} />
            <Route path="/lend" element={<Lend />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/manage-bond/:bondId" element={<ManageBond />} />
        </Routes>
        </>
    )
}

export default Root