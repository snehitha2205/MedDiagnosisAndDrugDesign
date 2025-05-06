// import { useState } from "react";
// import axios from "axios";
// import Lottie  from 'lottie-react'
// import { Link } from "react-router-dom";
// import styles from "./styles.module.css";
// import login from "../pages/login.json"

// const Login = () => {
// 	const [data, setData] = useState({ email: "", password: "" });
// 	const [error, setError] = useState("");

// 	const handleChange = ({ currentTarget: input }) => {
// 		setData({ ...data, [input.name]: input.value });
// 	};

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
// 		try {
// 			const url = "http://localhost:8080/api/auth";
// 			const { data: res } = await axios.post(url, data);
// 			localStorage.setItem("token", res.data);
// 			window.location = "/";
// 		} catch (error) {
// 			if (
// 				error.response &&
// 				error.response.status >= 400 &&
// 				error.response.status <= 500
// 			) {
// 				setError(error.response.data.message);
// 			}
// 		}
// 	};

// 	return (
// 		<div className={styles.login_container  }>
// 			<div className={styles.login_form_container}>
// 				<div className={styles.left}>
// 					<form className={styles.form_container} onSubmit={handleSubmit}>
// 						<h1>Login to Your Account</h1>
// 						<input
// 							type="email"
// 							placeholder="Email"
// 							name="email"
// 							onChange={handleChange}
// 							value={data.email}
// 							required
// 							className={styles.input}
// 						/>
// 						<input
// 							type="password"
// 							placeholder="Password"
// 							name="password"
// 							onChange={handleChange}
// 							value={data.password}
// 							required
// 							className={styles.input}
// 						/>
// 						{error && <div className={styles.error_msg}>{error}</div>}
// 						<button type="submit" className={styles.green_btn}>
// 							Login
// 						</button>
// 					</form>
// 				</div>
// 				<div className={styles.right}>
// 					<h1>New Here ?</h1>
// 					<div><Lottie animationData={login} /></div>
// 					<Link to="/mobile-verification">
// 						<button type="button" className={styles.white_btn}>
// 							Register
// 						</button>
// 					</Link>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default Login;




// import { useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import styles from "./styles.module.css";

// const Login = () => {
// 	const [data, setData] = useState({ email: "", password: "" });
// 	const [error, setError] = useState("");

// 	const handleChange = ({ currentTarget: input }) => {
// 		setData({ ...data, [input.name]: input.value });
// 	};

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
// 		try {
// 			const url = "http://localhost:8080/api/auth";
// 			const { data: res } = await axios.post(url, data);
// 			localStorage.setItem("token", res.data);
// 			window.location = "/";
// 		} catch (error) {
// 			if (
// 				error.response &&
// 				error.response.status >= 400 &&
// 				error.response.status <= 500
// 			) {
// 				setError(error.response.data.message);
// 			}
// 		}
// 	};

// 	return (
// 		<div className={styles.login_container}>
// 			<div className={styles.login_card}>
// 				<div className={styles.login_illustration}>
// 					<h1>Welcome Back!</h1>
// 					<p>Login to access your account and continue your journey.</p>
// 				</div>
// 				<div className={styles.login_form}>
// 					<h2>Login</h2>
// 					<form onSubmit={handleSubmit}>
// 						<div className={styles.input_group}>
// 							<label htmlFor="email">Email</label>
// 							<input
// 								type="email"
// 								id="email"
// 								name="email"
// 								placeholder="Enter your email"
// 								onChange={handleChange}
// 								value={data.email}
// 								required
// 							/>
// 						</div>
// 						<div className={styles.input_group}>
// 							<label htmlFor="password">Password</label>
// 							<input
// 								type="password"
// 								id="password"
// 								name="password"
// 								placeholder="Enter your password"
// 								onChange={handleChange}
// 								value={data.password}
// 								required
// 							/>
// 						</div>
// 						{error && <div className={styles.error_msg}>{error}</div>}
// 						<button type="submit" className={styles.login_btn}>
// 							Login
// 						</button>
// 					</form>
// 					<div className={styles.register_link}>
// 						<p>Don't have an account?</p>
// 						<Link to="/mobile-verification">Register</Link>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default Login;


import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import"./styles.css";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  UserPlus
} from "react-feather";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "http://localhost:8080/api/auth";
      const { data: res } = await axios.post(url, data);
      localStorage.setItem("token", res.data);
      window.location = "/";
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div className="login-screen">
      <div className="login-background">
        <div className="login-pattern"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome to <span>MedPharmAI</span></h1>
            <p className="login-subtitle">Sign in to access your personalized dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <div className="input-icon">
                <Mail size={20} color="#FF0B55" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                onChange={handleChange}
                value={data.email}
                required
                className="login-input"
              />
            </div>
            
            <div className="input-group">
              <div className="input-icon">
                <Lock size={20} color="#FF0B55" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                value={data.password}
                required
                className="login-input"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <button type="submit" className="login-button">
              <span>Continue</span>
              <ArrowRight size={20} />
            </button>
          </form>
          
          <div className="register-cta">
            <p>New to MedPharmAI?</p>
            <Link to="/mobile-verification" className="register-link">
              <UserPlus size={16} />
              <span>Create account</span>
            </Link>
          </div>
        </div>
        
        <div className="login-graphics">
          <div className="graphic-circle"></div>
          <div className="graphic-circle"></div>
          <div className="graphic-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;