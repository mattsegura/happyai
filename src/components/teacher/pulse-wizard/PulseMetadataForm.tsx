interface PulseMetadataFormProps {
  classes: Array<{ id: string; name: string }>;
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  expiresIn: string;
  onExpiresInChange: (hours: string) => void;
  allowAnonymous?: boolean;
  onAllowAnonymousChange?: (allow: boolean) => void;
}

export function PulseMetadataForm({
  classes,
  selectedClassId,
  onClassChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  expiresIn,
  onExpiresInChange,
  allowAnonymous = false,
  onAllowAnonymousChange,
}: PulseMetadataFormProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Class <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedClassId}
          onChange={(e) => onClassChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-gray-800"
        >
          <option value="">Choose a class...</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pulse Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Week 5 Understanding Check"
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{title.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add any context or instructions for students..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-gray-800 placeholder:text-gray-400 resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{description.length}/500</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Expires In <span className="text-red-500">*</span>
        </label>
        <select
          value={expiresIn}
          onChange={(e) => onExpiresInChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-gray-800"
        >
          <option value="6">6 hours</option>
          <option value="12">12 hours</option>
          <option value="24">24 hours (1 day)</option>
          <option value="48">48 hours (2 days)</option>
          <option value="72">72 hours (3 days)</option>
          <option value="168">1 week</option>
          <option value="336">2 weeks</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Students will have this much time to complete the pulse</p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="anonymousToggle"
            checked={allowAnonymous}
            onChange={(e) => onAllowAnonymousChange?.(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-2 border-purple-300 text-purple-600 focus:ring-2 focus:ring-purple-400 cursor-pointer"
          />
          <div className="flex-1">
            <label htmlFor="anonymousToggle" className="font-semibold text-purple-900 cursor-pointer block mb-1">
              Allow Anonymous Responses
            </label>
            <p className="text-sm text-purple-800">
              When enabled, students can choose to submit their responses anonymously. Their names will be hidden from you and other students, helping them feel more comfortable sharing honest feedback.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for Creating Great Pulses</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep titles clear and specific</li>
          <li>• Use descriptions to provide context or instructions</li>
          <li>• Consider your students' schedules when setting expiration times</li>
          <li>• Mix different question types to keep engagement high</li>
        </ul>
      </div>
    </div>
  );
}
