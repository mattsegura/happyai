import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, X, Search, Sparkles } from 'lucide-react';

type ClassMate = {
  id: string;
  full_name: string;
  class_id: string;
  class_name: string;
};

interface CreateHapiMomentProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateHapiMoment({ onClose, onCreated }: CreateHapiMomentProps) {
  const [classmates] = useState<ClassMate[]>([
    { id: 'student-1', full_name: 'Emma Thompson', class_id: 'class-1', class_name: 'Biology II' },
    { id: 'student-2', full_name: 'Liam Rodriguez', class_id: 'class-2', class_name: 'Economics 101' },
    { id: 'student-3', full_name: 'Sophia Kim', class_id: 'class-3', class_name: 'English Literature' },
  ]);
  const [selectedRecipient, setSelectedRecipient] = useState<ClassMate | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'write'>('select');

  const handleSubmit = async () => {
    if (!selectedRecipient || !message.trim()) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    onCreated();
  };

  const filteredClassmates = classmates.filter((cm) =>
    cm.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-pink-200 animate-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-pink-500 to-orange-600 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Hapi Moment</h2>
              <p className="text-pink-100 text-sm">Spread positivity to a classmate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'select' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a classmate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClassmates.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <p>No classmates found.</p>
                  </div>
                ) : (
                  filteredClassmates.map((classmate) => (
                    <button
                      key={`${classmate.id}-${classmate.class_id}`}
                      onClick={() => {
                        setSelectedRecipient(classmate);
                        setStep('write');
                      }}
                      className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:shadow-lg transition-all duration-300 text-left transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{classmate.full_name}</p>
                          <p className="text-sm text-gray-500">{classmate.class_name}</p>
                        </div>
                        <Heart className="w-6 h-6 text-pink-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 'write' && selectedRecipient && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <button
                onClick={() => setStep('select')}
                className="text-sm text-gray-600 hover:text-gray-800 font-semibold"
              >
                ← Change recipient
              </button>

              <div className="bg-white rounded-xl p-4 border-2 border-pink-200">
                <p className="text-sm text-gray-600 mb-1">Sending to:</p>
                <p className="text-lg font-bold text-gray-800">{selectedRecipient.full_name}</p>
                <p className="text-sm text-gray-500">{selectedRecipient.class_name}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something positive about this person... What did they do that made your day better?"
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400 resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{message.length}/300</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 border-2 border-yellow-300">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">
                    Both you and {selectedRecipient.full_name.split(' ')[0]} will earn 5 points!
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!message.trim() || loading}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none text-lg flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    <span>Send Hapi Moment</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
