import { useState } from 'react';
import { BookTemplate, Search, Plus, Edit, Trash2, Copy, Clock, Star } from 'lucide-react';
import { PulseTemplate } from '../../lib/pulseTypes';

interface TemplateLibraryProps {
  onClose: () => void;
  onSelectTemplate: (template: PulseTemplate) => void;
}

const mockTemplates: Partial<PulseTemplate>[] = [
  {
    id: '1',
    template_name: 'Weekly Check-In',
    description: 'Quick 5-question pulse to check student understanding',
    category: 'check-in',
    usage_count: 24,
    created_at: new Date().toISOString(),
    template_data: {
      title: 'Week [X] Understanding Check',
      description: 'Let us know how you\'re doing with this week\'s material',
      questions: [
        {
          question_text: 'How confident do you feel about this week\'s topics?',
          question_type: 'slider',
          is_required: true,
          points_value: 10,
          configuration: { min: 0, max: 100, step: 10 },
        },
        {
          question_text: 'Which topic was most challenging?',
          question_type: 'multiple_choice_single',
          is_required: true,
          points_value: 10,
          configuration: {},
          options: [
            { option_text: 'Topic A', position: 0 },
            { option_text: 'Topic B', position: 1 },
            { option_text: 'Topic C', position: 2 },
          ],
        },
        {
          question_text: 'What questions do you still have?',
          question_type: 'open_ended',
          is_required: false,
          points_value: 5,
          configuration: { maxCharacters: 500 },
        },
      ],
    },
  },
  {
    id: '2',
    template_name: 'End of Unit Reflection',
    description: 'Comprehensive reflection on unit learning',
    category: 'reflection',
    usage_count: 15,
    created_at: new Date().toISOString(),
    template_data: {
      title: 'Unit [X] Reflection',
      questions: [
        {
          question_text: 'Rate your understanding of each learning objective',
          question_type: 'likert_scale',
          is_required: true,
          points_value: 20,
          configuration: {},
        },
        {
          question_text: 'What was your biggest takeaway?',
          question_type: 'short_answer',
          is_required: true,
          points_value: 15,
          configuration: { maxWords: 50 },
        },
      ],
    },
  },
  {
    id: '3',
    template_name: 'Quick Poll',
    description: 'Simple yes/no/maybe poll for quick feedback',
    category: 'survey',
    usage_count: 42,
    created_at: new Date().toISOString(),
    template_data: {
      title: 'Quick Question',
      questions: [
        {
          question_text: 'Do you feel prepared for the upcoming assessment?',
          question_type: 'yes_no_maybe',
          is_required: true,
          points_value: 5,
          configuration: {},
        },
      ],
    },
  },
];

export function TemplateLibrary({ onClose, onSelectTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'general', label: 'General' },
    { value: 'check-in', label: 'Check-In' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'survey', label: 'Survey' },
  ];

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch =
      template.template_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <BookTemplate className="w-8 h-8 mr-3 text-blue-600" />
              Template Library
            </h2>
            <p className="text-gray-600 mt-1">Choose a template to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-600 rotate-45" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === cat.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <BookTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Templates Found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => onSelectTemplate(template as PulseTemplate)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {template.template_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {template.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {template.template_data?.questions?.length || 0} questions
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <div className="flex items-center space-x-1 text-gray-600 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">Used {template.usage_count} times</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Edit template:', template.id);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Duplicate template:', template.id);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Delete template:', template.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
          >
            Close Library
          </button>
        </div>
      </div>
    </div>
  );
}
