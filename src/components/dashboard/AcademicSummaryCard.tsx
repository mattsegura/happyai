import { useState } from 'react';
import { mockClassRiskIndicators } from '../../lib/mockData';
import { GraduationCap, AlertTriangle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

export function AcademicSummaryCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const riskIndicators = mockClassRiskIndicators;

  const highRiskCount = riskIndicators.filter(r => r.risk_level === 'high').length;
  const mediumRiskCount = riskIndicators.filter(r => r.risk_level === 'medium').length;
  const lowRiskCount = riskIndicators.filter(r => r.risk_level === 'low').length;

  // Calculate overall GPA (mock calculation)
  const overallGPA = 3.2;

  const highRiskClasses = riskIndicators.filter(r => r.risk_level === 'high');
  const mediumRiskClasses = riskIndicators.filter(r => r.risk_level === 'medium');

  return (
    <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Compact Summary View */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Academic</h3>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Key Metrics - Horizontal */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-0.5">GPA</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overallGPA.toFixed(2)}</div>
          </div>
          
          {highRiskCount > 0 && (
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-0.5">High Risk</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{highRiskCount}</div>
            </div>
          )}
          
          {mediumRiskCount > 0 && (
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-0.5">Medium</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mediumRiskCount}</div>
            </div>
          )}

          {highRiskCount === 0 && mediumRiskCount === 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">On track</span>
            </div>
          )}
        </div>

        {/* Quick Alert */}
        {(highRiskCount > 0 || mediumRiskCount > 0) && !isExpanded && (
          <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="text-xs text-orange-700 dark:text-orange-300">
                {highRiskCount > 0 && `${highRiskCount} high`}
                {highRiskCount > 0 && mediumRiskCount > 0 && ', '}
                {mediumRiskCount > 0 && `${mediumRiskCount} medium risk`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-5 space-y-3">
          {highRiskClasses.map((indicator) => (
            <div
              key={indicator.class_id}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{indicator.class_name}</h4>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">High Risk</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                {indicator.factors.slice(0, 2).map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm font-medium">
                Create Action Plan
              </button>
            </div>
          ))}

          {mediumRiskClasses.map((indicator) => (
            <div
              key={indicator.class_id}
              className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{indicator.class_name}</h4>
                  <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Medium Risk</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                {indicator.factors.slice(0, 2).map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {lowRiskCount > 0 && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-center">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {lowRiskCount} {lowRiskCount === 1 ? 'class' : 'classes'} on track
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
