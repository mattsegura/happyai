import { useState } from 'react';
import { ChevronDown, User, GraduationCap, Users, Shield, Copy, Check } from 'lucide-react';
import { Card } from '../ui/card';

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  {
    email: 'demo@student.com',
    password: 'qwerty123',
    role: 'Student',
    description: 'Access student dashboard, pulse checks, leaderboard',
    icon: <GraduationCap className="w-4 h-4" />,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    email: 'demo@teacher.com',
    password: 'qwerty123',
    role: 'Teacher',
    description: 'View class analytics, create pulses, manage students',
    icon: <Users className="w-4 h-4" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    email: 'demo@admin.com',
    password: 'qwerty123',
    role: 'Admin',
    description: 'System administration, user management, reports',
    icon: <Shield className="w-4 h-4" />,
    color: 'from-red-500 to-orange-500'
  }
];

interface DemoAccountsProps {
  onSelectAccount?: (email: string, password: string) => void;
}

export function DemoAccounts({ onSelectAccount }: DemoAccountsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Quick Login Options
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {demoAccounts.map((account, index) => (
            <Card
              key={account.email}
              className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-400 dark:hover:border-blue-600"
              onClick={() => onSelectAccount?.(account.email, account.password)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 bg-gradient-to-r ${account.color} rounded-lg shadow-md`}>
                  {account.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {account.role}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                      Test Account
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {account.description}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-16">Email:</span>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {account.email}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(account.email, index * 2);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      >
                        {copiedIndex === index * 2 ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-16">Password:</span>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {account.password}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(account.password, index * 2 + 1);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      >
                        {copiedIndex === index * 2 + 1 ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Click card to auto-fill login form
                </p>
              </div>
            </Card>
          ))}

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Note:</strong> These test accounts are pre-configured for quick access. Contact your administrator if you need assistance setting up your own account.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}