// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./index.css"

// const MobileVerification = () => {
//     const [phone, setPhone] = useState("");
//     const [otp, setOtp] = useState("");
//     const [otpSent, setOtpSent] = useState(false);
//     const [error, setError] = useState("");
//     const navigate = useNavigate();

//     // Send OTP request
//     const sendOtp = async () => {
//         try {
//             const { data } = await axios.post("http://localhost:8080/api/send-otp", { phone });
//             setOtpSent(true);
//             setError("");
//             alert("OTP sent successfully!");
//         } catch (error) {
//             setError(error.response?.data?.message || "Failed to send OTP");
//         }
//     };

//     // Verify OTP request
//     const verifyOtp = async () => {
//         try {
//             const { data } = await axios.post("http://localhost:8080/api/verify-otp", { phone, otp });
//             alert("OTP verified successfully!");
//             localStorage.setItem("verifiedPhone", phone);
//             navigate("/signup"); // Move to Signup Screen
//         } catch (error) {
//             setError(error.response?.data?.message || "Invalid OTP");
//         }
//     };

//     return (
//         <div className="mobile-bg">
//             <div className="card">
//             <h2 className="mobile-head">Mobile Verification</h2>
//             {!otpSent ? (
//                 <>
//                     <input
//                         type="text"
//                         placeholder="Enter mobile number"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         className="input"
//                     />
//                     <button onClick={sendOtp} className="green_btn">Send OTP</button>
//                 </>
//             ) : (
//                 <>
//                     <input
//                         type="text"
//                         placeholder="Enter OTP"
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value)}
//                         className="input"
//                     />
//                     <button onClick={verifyOtp} className="green_btn">Verify OTP</button>
//                 </>
//             )}
//             <div className="t">
//                {error && <p className="error_msg">{error}</p>}
//             </div>
//             </div>
//         </div>
//     );
// };

// export default MobileVerification;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { FaMobileAlt, FaLock } from "react-icons/fa"; // Icons for mobile and lock
// import "./index.css";

// const MobileVerification = () => {
// 	const [phone, setPhone] = useState("");
// 	const [otp, setOtp] = useState("");
// 	const [otpSent, setOtpSent] = useState(false);
// 	const [error, setError] = useState("");
// 	const navigate = useNavigate();

// 	// Send OTP request
// 	const sendOtp = async () => {
// 		try {
// 			const { data } = await axios.post("http://localhost:8080/api/send-otp", { phone });
// 			setOtpSent(true);
// 			setError("");
// 			alert("OTP sent successfully!");
// 		} catch (error) {
// 			setError(error.response?.data?.message || "Failed to send OTP");
// 		}
// 	};

// 	// Verify OTP request
// 	const verifyOtp = async () => {
// 		try {
// 			const { data } = await axios.post("http://localhost:8080/api/verify-otp", { phone, otp });
// 			alert("OTP verified successfully!");
// 			localStorage.setItem("verifiedPhone", phone);
// 			navigate("/signup"); // Move to Signup Screen
// 		} catch (error) {
// 			setError(error.response?.data?.message || "Invalid OTP");
// 		}
// 	};

// 	return (
// 		<div className="mobile-bg">
// 			<div className="card">
// 				<div className="lock-icon-container">
// 					<FaLock className="lock-icon" />
// 					<h2 className="mobile-head">OTP Verification</h2>
// 				</div>
// 				{!otpSent ? (
// 					<>
// 						<div className="input-container">
// 							<FaMobileAlt className="input-icon" />
// 							<input
// 								type="text"
// 								placeholder="Enter mobile number"
// 								value={phone}
// 								onChange={(e) => setPhone(e.target.value)}
// 								className="input"
// 							/>
// 						</div>
// 						<button onClick={sendOtp} className="green_btn">
// 							Send OTP
// 						</button>
// 					</>
// 				) : (
// 					<>
// 						<div className="input-container">
// 							<FaMobileAlt className="input-icon" />
// 							<input
// 								type="text"
// 								placeholder="Enter OTP"
// 								value={otp}
// 								onChange={(e) => setOtp(e.target.value)}
// 								className="input"
// 							/>
// 						</div>
// 						<button onClick={verifyOtp} className="green_btn">
// 							Verify OTP
// 						</button>
// 					</>
// 				)}
// 				{error && <p className="error_msg">{error}</p>}
// 			</div>
// 		</div>
// 	);
// };

// export default MobileVerification;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMobileAlt, FaLock, FaArrowRight } from "react-icons/fa";
import "./index.css";

const MobileVerification = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("http://localhost:8080/api/send-otp", { phone });
      setOtpSent(true);
      setError("");
      alert("OTP sent successfully!");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("http://localhost:8080/api/verify-otp", { phone, otp });
      alert("OTP verified successfully!");
      localStorage.setItem("verifiedPhone", phone);
      navigate("/signup");
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verification-screen">
      {/* Animated Background */}
      <div className="verification-background">
        <div className="verification-pattern"></div>
      </div>
      
      {/* Main Content */}
      <div className="verification-container">
        {/* Glass Card */}
        <div className="verification-glass-card">
          {/* Header Section */}
          <div className="verification-header">
            <div className="verification-icon-circle">
              <div className="icon-pulse"></div>
              <FaLock className="verification-lock-icon" />
            </div>
            <h1 className="verification-title">Mobile Verification</h1>
            <p className="verification-subtitle">
              {otpSent 
                ? "Enter the OTP sent to your mobile" 
                : "Enter your mobile number to receive OTP"}
            </p>
          </div>

          {/* Input Section */}
          <div className="verification-input-section">
            {!otpSent ? (
              <div className="verification-input-group">
                <div className="verification-input-icon-container">
                  <FaMobileAlt className="verification-input-icon" />
                </div>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="verification-input"
                />
              </div>
            ) : (
              <div className="verification-input-group">
                <div className="verification-input-icon-container">
                  <FaLock className="verification-input-icon" />
                </div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="verification-input"
                />
              </div>
            )}

            {error && (
              <div className="verification-error-message">
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={otpSent ? verifyOtp : sendOtp}
              disabled={isLoading}
              className="verification-button"
            >
              {isLoading ? (
                <div className="verification-spinner"></div>
              ) : (
                <>
                  <span>{otpSent ? "Verify OTP" : "Send OTP"}</span>
                  <FaArrowRight className="verification-button-icon" />
                </>
              )}
            </button>
          </div>

          {/* Footer Note */}
          <div className="verification-footer">
            <p>By continuing, you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileVerification;