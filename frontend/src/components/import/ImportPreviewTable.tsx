import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ImportResult } from '@/types/import-types';

interface ImportPreviewTableProps {
  importResult: ImportResult | null;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ 
  importResult 
}) => {
  if (!importResult) return null;

  return (
    <div className={`p-4 rounded-lg ${
      importResult.success 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-start gap-2">
        {importResult.success ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className={`font-medium mb-1 ${
            importResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {importResult.success ? 'Import Successful' : 'Import Failed'}
          </h4>
          <p className={`text-sm ${
            importResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {importResult.message}
          </p>
          
          {importResult.importedCount && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Imported:</span> {importResult.importedCount} items
            </div>
          )}
          
          {importResult.warnings && importResult.warnings.length > 0 && (
            <div className="mt-2">
              <h5 className="text-sm font-medium text-yellow-800 mb-1">Warnings:</h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                {importResult.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};