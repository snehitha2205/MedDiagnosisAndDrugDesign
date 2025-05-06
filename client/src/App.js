// import React, { useState } from 'react';
// import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { Sun, Moon } from 'lucide-react';
// import Navbar from './components/Navbar';
// import Hero from './components/Hero';
// import Features from './components/Features';
// import Footer from './components/Footer';
// import CTImage from './components/CTImage';
// import Login from './components/Login/index';
// import Signup from './components/Signup/index';
// import EmailVerify from './components/EmailVerify';
// import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
// import MobileVerification from './components/MobileVerification';
// import ProteinPredictor from './components/ProteinPredictor';
// import FAQs from './components/FAQs';
// import ProteinToSmilesConverter from './components/ProteinToSmilesConverter';
// import ContactUs from './components/ContactUs';
// import './index.css';

// function App() {
//   const [darkMode, setDarkMode] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const location = useLocation();

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     document.documentElement.classList.toggle('dark-mode');
//   };

//   // Only show Navbar and Footer on these specific routes
//   const showLayout = ['/', '/main'].includes(location.pathname);

//   const user = localStorage.getItem('token');

//   return (
//     <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
//       <div className="app-background">
//         {showLayout && (
//           <Navbar 
//             darkMode={darkMode} 
//             toggleDarkMode={toggleDarkMode}
//             mobileMenuOpen={mobileMenuOpen}
//             setMobileMenuOpen={setMobileMenuOpen}
//           />
//         )}

//         <main className="app-main">
//           <Routes>
//             <Route
//               path="/"
//               element={!user ? <WelcomeScreen /> : <Navigate replace to="/main" />}
//             />

//             <Route
//               path="/main"
//               element={
//                 user ? (
//                   <div className="content-container">
//                     <Hero />
//                     <Features />
//                   </div>
//                 ) : (
//                   <Navigate replace to="/login" />
//                 )
//               }
//             />

//             <Route path="/ct-image" element={<CTImage />} />
//             <Route path="/protein-structure" element={<ProteinPredictor />} />
//             <Route path="/faqs" element={<FAQs />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/email-verify/:id/:token" element={<EmailVerify />} />
//             <Route path="/mobile-verification" element={<MobileVerification />} />
//             <Route path="/protein-smiles" element={<ProteinToSmilesConverter />} />
//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </main>

//         {showLayout && (
//   <>
//     <ContactUs id="contact-section" />
//     <Footer />
//   </>
// )}

//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import CTImage from './components/CTImage';
import Login from './components/Login/index';
import Signup from './components/Signup/index';
import EmailVerify from './components/EmailVerify';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
import MobileVerification from './components/MobileVerification';
import ProteinPredictor from './components/ProteinPredictor';
import FAQs from './components/FAQs';
import ProteinToSmilesConverter from './components/ProteinToSmilesConverter';
import ContactUs from './components/ContactUs';
import Vit from './components/Vit';
// import Demo from './components/Demo';
import Testimonials from './components/Testimonials';
import Research from './components/Research';
import Team from './components/Team';
import Partners from './components/Partners';
import AboutUs from './components/AboutUs';
import Reinforcement from './components/reinforcement';
import './index.css';
import Chembel from './components/chembel';
import AutoDocking from './components/AutoDocking';
import Visualization from './components/Visualization';
function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark-mode');
  };

  // Only show Navbar and Footer on these specific routes
  const showLayout = ['/', '/main'].includes(location.pathname);

  const user = localStorage.getItem('token');

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="app-background">
        {showLayout && (
          <Navbar 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}

        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={!user ? <WelcomeScreen /> : <Navigate replace to="/main" />}
            />

            <Route
              path="/main"
              element={
                user ? (
                  <div className="content-container">
                    {/* <Hero />
                    <Features /> */}
                    <Hero />
        
        <Features />
        
        {/* <Demo /> */}
        <Testimonials />
        {/* <Research /> */}
        {/* <Team /> */}
        {/* <Partners /> */}
        
                  </div>
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />

            <Route path="/ct-image" element={<CTImage />} />
            <Route path="/protein-structure" element={<ProteinPredictor />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/email-verify/:id/:token" element={<EmailVerify />} />
            <Route path="/mobile-verification" element={<MobileVerification />} />
            <Route path="/protein-smiles" element={<ProteinToSmilesConverter />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/chembel" element={<Chembel />} />
            <Route path="/Reinforcement" element={<Reinforcement />} />
            <Route path="/docking" element={<AutoDocking />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/vit" element={<Vit/>} />
            <Route path="/Lung" element={<Visualization />} />
          </Routes>
        </main>

        {showLayout && (
          <>
            <ContactUs id="contact-section" />
            {/* <Metrics /> */}
            <Footer />
          </>
        )}
      </div>
    </div>
  );
}

export default App;