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
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Select Class <span className="text-rose-500">*</span>
        </label>
        <select
          value={selectedClassId}
          onChange={(e) => onClassChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground"
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
        <label className="block text-sm font-medium text-foreground mb-2">
          Pulse Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g., Week 5 Understanding Check"
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground mt-1.5 text-right">{title.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add any context or instructions for students..."
          rows={3}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1.5 text-right">{description.length}/500</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Expires In <span className="text-rose-500">*</span>
        </label>
        <select
          value={expiresIn}
          onChange={(e) => onExpiresInChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground"
        >
          <option value="6">6 hours</option>
          <option value="12">12 hours</option>
          <option value="24">24 hours (1 day)</option>
          <option value="48">48 hours (2 days)</option>
          <option value="72">72 hours (3 days)</option>
          <option value="168">1 week</option>
          <option value="336">2 weeks</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1.5">Students will have this much time to complete the pulse</p>
      </div>

      <div className="rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50 p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="anonymousToggle"
            checked={allowAnonymous}
            onChange={(e) => onAllowAnonymousChange?.(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
          />
          <div className="flex-1">
            <label htmlFor="anonymousToggle" className="font-medium text-foreground text-sm cursor-pointer block mb-1">
              Allow Anonymous Responses
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When enabled, students can choose to submit their responses anonymously. Their names will be hidden from you and other students, helping them feel more comfortable sharing honest feedback.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 p-4">
        <h4 className="font-semibold text-foreground text-sm mb-2.5">Tips for Creating Great Pulses</h4>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex gap-2"><span className="text-primary">•</span><span>Keep titles clear and specific</span></li>
          <li className="flex gap-2"><span className="text-primary">•</span><span>Use descriptions to provide context or instructions</span></li>
          <li className="flex gap-2"><span className="text-primary">•</span><span>Consider your students' schedules when setting expiration times</span></li>
          <li className="flex gap-2"><span className="text-primary">•</span><span>Mix different question types to keep engagement high</span></li>
        </ul>
      </div>
    </div>
  );
}
