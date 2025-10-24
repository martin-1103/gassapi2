interface ConsoleFooterProps {
  totalEntries: number;
  filteredEntries: number;
  searchQuery: string;
}

export default function ConsoleFooter({
  totalEntries,
  filteredEntries,
  searchQuery,
}: ConsoleFooterProps) {
  return (
    <div className='px-4 py-2 border-t bg-muted/50'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <div className='flex items-center gap-4'>
          <span>Console entries: {totalEntries}</span>
          <span>Showing: {filteredEntries} filtered</span>
          {searchQuery && <span>Filtered by: &quot;{searchQuery}&quot;</span>}
        </div>
        <div className='flex items-center gap-4'>
          <span>Auto-refresh: Enabled</span>
          <span>Max entries: 1000</span>
          <span>Real-time: Active</span>
        </div>
      </div>
    </div>
  );
}
