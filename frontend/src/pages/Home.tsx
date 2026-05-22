import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-900 to-secondary">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            🏆 Velicham Fifa&apos;26 Prediction
          </h1>
          <p className="text-base sm:text-lg text-blue-100 mb-8 px-2">
            Predict match scores, earn points, and climb the leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-2">
            <Link
              to="/leaderboard"
              className="px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-blue-50 transition text-center min-h-[48px] flex items-center justify-center"
            >
              View leaderboard
            </Link>
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-blue-600 transition text-center min-h-[48px] flex items-center justify-center"
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-blue-600 transition text-center min-h-[48px] flex items-center justify-center"
              >
                Sign in to predict
              </Link>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">⚽ Make predictions</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Submit score predictions before each match deadline and earn points for accuracy.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">🏅 Climb the leaderboard</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Track your all-time and per-match rankings against other players.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
