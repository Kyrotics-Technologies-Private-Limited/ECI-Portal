import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from "react-hot-toast";
import { handleSendPasswordResetEmail, handleSignIn } from '../../utils/auth.jsx';

const Login = () => {
  const { userLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await handleSignIn(email, password);
        toast.success("Login Successful");
      } catch (error) {
        console.error(error)
        let message = "An error occurred. Please try again.";
        if (error.code) {
          switch (error.code) {
            case 'auth/invalid-credential': 
            message = "Invalid email or password.";
            break;
            case 'auth/invalid-email':
              message = "Email not found.";
              break;
            case 'auth/too-many-requests':
              message = "Too many login attempts. Please try again later.";
              break;
            case 'auth/user-not-found':
              message = "No user found with this email.";
              break;
            case 'auth/wrong-password':
              message = "Invalid email or password.";
              break;
            case 'auth/network-request-failed':
              message = "Check your Internet Connection.";
              break;
            default:
              message = error.message || message;
          }
        } else {
          message = error.message || message;
        }
        
        toast.error(message);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const onForgotPassword = async () => {
    if (email) {
      try {
        await handleSendPasswordResetEmail(email);
        toast.success('Password reset email sent!');
      } catch (error) {
        toast.error(error.message);
      }
    } else {
      toast.error('Please enter your email address first.');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <section className="relative flex flex-wrap lg:h-screen lg:items-center">
      {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}
      <div className="relative h-64 w-full sm:h-96 lg:h-full lg:w-1/2">
        <img
          alt=""
          src="login.png"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:w-1/2 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="hidden sm:mb-1 sm:flex sm:justify-center">
            <div className="">
              <a href="#" className="font-bold text-3xl text-indigo-600">
                <img src="/logo.png" alt="Bhashantaar Logo" style={{ height: '16rem', width: 'auto' }} />
              </a>
            </div>
          </div>
          <h2 className="mt-7 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mx-auto mb-0 mt-8 max-w-md space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter email"
              />
              <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="text-sm mb-2">
                <a href='#' onClick={onForgotPassword} className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter password"
              />
              <span className="absolute inset-y-0 end-0 grid place-content-center px-4" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isPasswordVisible ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825a10.974 10.974 0 01-1.875.175C7.603 19 3.328 15.52 2.457 10.96 3.94 6.922 8.053 4 12 4c1.034 0 2.033.118 2.997.344M15 12a3 3 0 01-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3.055 3L21 21m-2.094-2.094C17.73 19.667 14.959 21 12 21c-5.066 0-9.432-3.656-10.544-8.549C2.884 7.974 7.052 4.064 12 4c2.31 0 4.456.752 6.169 2.006L19 5.293m-2 2l-2 2"
                    />
                  )}
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Not a member?
              <a className="underline" href="#">Contact Us</a>
            </p>
            <button
              type="submit"
              disabled={isSigningIn}
              className="inline-block rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white"
            >
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
