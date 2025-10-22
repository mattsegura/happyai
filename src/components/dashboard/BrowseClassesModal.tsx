import { useState } from 'react';
import { X, Users, GraduationCap, Search, Check } from 'lucide-react';
import { mockAvailableClasses } from '../../lib/mockData';

type AvailableClass = {
  id: string;
  name: string;
  description: string;
  teacher_name: string;
  class_code: string;
};

type BrowseClassesModalProps = {
  onClose: () => void;
  onClassJoined: () => void;
};

export function BrowseClassesModal({ onClose, onClassJoined }: BrowseClassesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningClassId, setJoiningClassId] = useState<string | null>(null);

  const classes: AvailableClass[] = mockAvailableClasses;

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinClass = async (classItem: AvailableClass) => {
    setJoiningClassId(classItem.id);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setJoiningClassId(null);
    onClassJoined();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Browse Available Classes
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No classes found matching your search</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">{classItem.name}</h3>
                      </div>
                      <p className="text-gray-600 mb-2">{classItem.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Teacher: {classItem.teacher_name}</span>
                        <span>Code: {classItem.class_code}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinClass(classItem)}
                    disabled={joiningClassId === classItem.id}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {joiningClassId === classItem.id ? (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
