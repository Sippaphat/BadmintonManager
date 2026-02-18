import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AuthPage = ({ onLoginSuccess, loading, t }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        {/* App Logo/Title */}
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce-slow">🏸</div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t('appTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your badminton games with ease
          </p>
        </div>
        
        {/* Features */}
        <div className="mb-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">👥</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Player Management
            </p>
          </div>
          <div>
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ELO Ratings
            </p>
          </div>
          <div>
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Fair Matchmaking
            </p>
          </div>
        </div>
        
        {/* Login Button */}
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onLoginSuccess}
              onError={() => {
                console.error('Login Failed');
              }}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
          Sign in with Google to get started
        </p>
      </Card>
    </div>
  );
};

export default AuthPage;
