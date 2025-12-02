import React from "react";
import { SignIn } from "@clerk/clerk-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-neutral-400">Sign in to continue to Cloud Ops Hub</p>
      </div>
      <SignIn 
        routing="path" 
        path="/login" 
        signUpUrl="/sign-up"
        appearance={{
          variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#171717',
            colorText: 'white',
            colorInputBackground: '#0a0a0a',
            colorInputText: 'white',
            colorTextSecondary: '#a3a3a3',
          },
          elements: {
            card: 'bg-neutral-900 border border-neutral-800 shadow-xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-neutral-400',
            socialButtonsBlockButton: 'text-white border-neutral-700 hover:bg-neutral-800',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-500 normal-case',
            footerActionLink: 'text-blue-400 hover:text-blue-300'
          }
        }}
      />
    </div>
  );
};

export default LoginPage;