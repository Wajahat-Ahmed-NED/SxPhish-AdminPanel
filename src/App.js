import React, {useState} from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { Navbar, Footer, Sidebar } from './components';
import { Users, Home} from './pages';
import { useStateContext } from './contexts/ContextProvider';
import './App.css';

const App = () => {
  const {activeMenu} = useStateContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
   // State to manage the visibility of Sidebar and Navbar
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);

  return (
    <div>
    <BrowserRouter>
    <div className="flex relative bg-main-dark-bg">
        {activeMenu ? (
            <div className="w-72 fixed sidebar bg-main-dark-bg  text-white p-3">
              {showSidebar &&<Sidebar />} 
            </div>
          ) : (
            <div className="w-0 dark:bg-secondary-dark-bg">
              {showSidebar &&<Sidebar />}
            </div>
          )}
          <div
          className={
            activeMenu
              ? 'bg-main-dark-bg min-h-screen md:ml-72 w-full  '
              : ' bg-main-dark-bg  w-full min-h-screen flex-2 '
          }
          >
            {activeMenu && showNavbar &&(
            <div className="fixed md:static bg-main-dark-bg navbar w-full text-white p-3 ">
              <Navbar />
            </div>
          )}
          <div>
            <Routes>
              {/* Dashboard overview of the usage of accounts*/}
              <Route path='/' element={<Home setShowSidebar={setShowSidebar} setShowNavbar={setShowNavbar} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}/>

              {/* pages */}
              <Route path='/users' element={isLoggedIn ? <Users /> : <Navigate to="/" replace />}></Route>
              <Route path='/Logout' element={<Home setShowSidebar={setShowSidebar} setShowNavbar={setShowNavbar}/>}></Route>
            </Routes>

          </div>
          <Footer />
          </div>
    </div>
    </BrowserRouter>
    </div>
  )
}

export default App

