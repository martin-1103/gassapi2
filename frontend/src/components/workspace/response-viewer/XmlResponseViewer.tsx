import { ScrollArea } from '@/components/ui/scroll-area';
import { highlightSearch } from '@/lib/response/response-search';

interface XmlResponseViewerProps {
  formattedData: string;
  searchQuery: string;
  lineNumbers: boolean;
  wrapLines: boolean;
  getSyntaxHighlighterClass: () => string;
}

export const XmlResponseViewer = ({
  formattedData,
  searchQuery,
  lineNumbers,
  wrapLines,
  getSyntaxHighlighterClass,
}: XmlResponseViewerProps) => {
  return (
    <ScrollArea className='h-full px-4'>
      <pre
        className={`
          ${getSyntaxHighlighterClass()}
          ${lineNumbers ? 'line-numbers' : ''}
          ${wrapLines ? 'wrap-lines' : ''}
          text-xs
          p-4
          overflow-x-auto
          bg-background
          rounded
        `}
      >
        <code>
          {searchQuery
            ? highlightSearch(formattedData, searchQuery)
            : formattedData}
        </code>
      </pre>
    </ScrollArea>
  );
};
