import { useState } from 'react';
import { X, Hash, Check, AlertCircle } from 'lucide-react';
import { mockClasses, mockClassMembers } from '../../lib/mockData';
import { useAuth } from '../../contexts/AuthContext';

type JoinClassModalProps = {
  onClose: () => void;
  onClassJoined: () => void;
};

export function JoinClassModal({ onClose, onClassJoined }: JoinClassModalProps) {
  const { user } = useAuth();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const classData = mockClasses.find(c => c.class_code === classCode.trim().toUpperCase());

    if (!classData) {
      setError('Invalid class code. Please check with your teacher.');
      setLoading(false);
      return;
    }

    const alreadyEnrolled = mockClassMembers.some(
      m => m.user_id === user?.id && m.class_id === classData.id
    );

    if (alreadyEnrolled) {
      setError('You are already enrolled in this class.');
      setLoading(false);
      return;
    }

    mockClassMembers.push({
      id: `member-${Date.now()}`,
      user_id: user?.id || '',
      class_id: classData.id,
      class_points: 0,
      joined_at: new Date().toISOString(),
    });

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      onClassJoined();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Join with Class Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Successfully Joined!</h3>
            <p className="text-gray-600">Welcome to your new class</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Enter Class Code</h3>
                  <p className="text-gray-600 text-sm">
                    Ask your teacher for the unique class code and enter it below to join.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter Class Code"
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value.toUpperCase());
                  setError('');
                }}
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400 text-center text-xl font-semibold tracking-wider"
                maxLength={12}
              />
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !classCode.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Join Class</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
