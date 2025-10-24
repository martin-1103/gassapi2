import { useConsoleState } from '@/hooks/useConsoleState';
import { ConsoleEntry } from '@/types/console';

import ConsoleActions from './ConsoleActions';
import ConsoleFilter from './ConsoleFilter';
import ConsoleFooter from './ConsoleFooter';
import ConsoleLogViewer from './ConsoleLogViewer';
import ConsoleStats from './ConsoleStats';

interface ResponseConsoleTabProps {
  console: ConsoleEntry[];
}

export default function ResponseConsoleTab({
  console: consoleEntries,
}: ResponseConsoleTabProps) {
  const {
    activeTab,
    searchQuery,
    filteredEntries,
    stats,
    setActiveTab,
    setSearchQuery,
    copyConsoleEntry,
    exportLogs,
    clearConsole,
    testEntry,
  } = useConsoleState({ consoleEntries });

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <ConsoleStats stats={stats} totalEntries={consoleEntries.length} />
        <ConsoleActions
          consoleEntries={consoleEntries}
          stats={stats}
          onExport={exportLogs}
          onClear={clearConsole}
        />
      </div>

      {/* Filter Controls */}
      <ConsoleFilter
        activeTab={activeTab}
        searchQuery={searchQuery}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
      />

      {/* Console Content */}
      <div className='flex-1 px-4 pb-4'>
        <ConsoleLogViewer
          filteredEntries={filteredEntries}
          onCopyEntry={copyConsoleEntry}
          onTestEntry={testEntry}
        />
      </div>

      {/* Footer */}
      <ConsoleFooter
        totalEntries={consoleEntries.length}
        filteredEntries={filteredEntries.length}
        searchQuery={searchQuery}
      />
    </div>
  );
}
