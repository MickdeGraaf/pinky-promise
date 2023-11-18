import react from 'react';
import { HeaderMenu } from './components/HeaderMenu';
import { Route, Routes } from 'react-router';
import Borrow from './pages/Borrow';
import Verify from './pages/Verify';
import Lend from './pages/Lend';

const Root = () => {
    return (
        <>
        <HeaderMenu />
        <Routes>
            <Route path="/" element={<Borrow />} />
            <Route path="/lend" element={<Lend />} />
            <Route path="/verify" element={<Verify />} />
        </Routes>
        </>
    )
}

export default Root