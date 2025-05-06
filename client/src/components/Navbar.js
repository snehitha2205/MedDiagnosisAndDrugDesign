// import React from 'react';
// import { Sun, Moon, Menu, X, Activity } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import './Navbar.css';

// const Navbar = ({ darkMode, toggleDarkMode, mobileMenuOpen, setMobileMenuOpen }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const navItems = [
//     { name: 'Home', path: '/' },
//     { name: 'About', path: '/about' },
//     { name: 'FAQs', path: '/faqs' },
//     { name: 'Contact Us', path: '/contact' },
//   ];

//   const handleNavigation = (path) => {
//     if (path === '/contact') {
//       if (location.pathname === '/' || location.pathname === '/main') {
//         // If we're already on the main page, scroll to contact section
//         const contactSection = document.getElementById('contact-section');
//         if (contactSection) {
//           contactSection.scrollIntoView({ behavior: 'smooth' });
//         }
//       } else {
//         // Otherwise navigate to main page and then scroll
//         navigate('/main');
//         setTimeout(() => {
//           const contactSection = document.getElementById('contact-section');
//           if (contactSection) {
//             contactSection.scrollIntoView({ behavior: 'smooth' });
//           }
//         }, 100); // Small delay to allow page to load
//       }
//     } else {
//       navigate(path);
//     }
//     setMobileMenuOpen(false);
//   };

//   const handleLogout = () => {
//     navigate('/login');
//   };

//   return (
//     <nav className={`navbar ${darkMode ? 'dark' : ''}`}>
//       <div className="navbar-container">
//         {/* Left side - Logo */}
//         <div className="navbar-brand" onClick={() => navigate('/')}>
//           <Activity />
//           <span>MedPharmAI</span>
//         </div>

//         {/* Middle - Navigation Links (hidden on mobile) */}
//         <div className="navbar-links">
//           {navItems.map((item) => (
//             <button
//               key={item.name}
//               onClick={() => handleNavigation(item.path)}
//               className="navbar-link"
//             >
//               {item.name}
//             </button>
//           ))}
//         </div>

//         {/* Right side - Actions */}
//         <div className="navbar-actions">
//           <button onClick={toggleDarkMode} className="navbar-button">
//             {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//           </button>

//           <button onClick={handleLogout} className="navbar-button">
//             Logout
//           </button>

//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="mobile-menu-button"
//           >
//             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {mobileMenuOpen && (
//         <div className="mobile-menu open">
//           {navItems.map((item) => (
//             <button
//               key={item.name}
//               onClick={() => handleNavigation(item.path)}
//               className="mobile-menu-link"
//             >
//               {item.name}
//             </button>
//           ))}
//           <button onClick={toggleDarkMode} className="mobile-menu-link">
//             {darkMode ? 'Light Mode' : 'Dark Mode'}
//           </button>
//           <button onClick={handleLogout} className="mobile-menu-link">
//             Logout
//           </button>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

import React from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const handleNavigation = (path) => {
    if (path === '/contact') {
      if (location.pathname === '/' || location.pathname === '/main') {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/main');
        setTimeout(() => {
          const contactSection = document.getElementById('contact-section');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      navigate(path);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side - Logo */}
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <Activity />
          <span>MedPharmAI</span>
        </div>

        {/* Middle - Navigation Links (hidden on mobile) */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className="navbar-link"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Right side - Actions */}
        <div className="navbar-actions">
          <button onClick={handleLogout} className="navbar-button">
            Logout
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-button"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu open">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className="mobile-menu-link"
            >
              {item.name}
            </button>
          ))}
          <button onClick={handleLogout} className="mobile-menu-link">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;