import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useImportModalLogic } from '@/hooks/useImportModalLogic';
import { ImportFormatSelector } from '@/components/import/ImportFormatSelector';
import { ImportMethodTabs } from './import-method-tabs';
import { ImportResultComponent } from './import-result';
import { ImportProgress } from '@/components/import/ImportProgress';
import { ImportPreviewTable } from '@/components/import/ImportPreviewTable';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [state, actions] = useImportModalLogic(onImport);

  if (!isOpen) return null;

  // Determine accepted formats based on the import type
  const acceptedFormats =
    state.importType === 'postman'
      ? '.json'
      : state.importType === 'openapi'
        ? '.json,.yaml,.yml'
        : '.txt,.curl';

  const handleClearResult = () => {
    // Clear the import result but keep other state
    actions.resetState();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import API Collection
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <ImportFormatSelector
            importType={state.importType}
            setImportType={actions.setImportType}
          />

          <ImportMethodTabs
            method={state.importMethod}
            onMethodChange={actions.setImportMethod}
            onFileUpload={actions.handleFileUpload}
            onUrlImport={actions.handleUrlImport}
            importUrl={state.importUrl}
            setImportUrl={actions.setImportUrl}
            isImporting={state.isImporting}
            acceptedFormats={acceptedFormats}
          />

          <ImportProgress
            progress={state.importProgress}
            isImporting={state.isImporting}
          />

          {state.importResult && (
            <ImportResultComponent
              result={state.importResult}
              onClear={handleClearResult}
            />
          )}

          {state.importResult?.success && state.importResult.data && (
            <ImportPreviewTable importResult={state.importResult} />
          )}

          {/* Validation Errors */}
          {state.validationErrors && !state.validationErrors.isValid && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">Validation Errors</h4>
              <ul className="text-sm text-destructive/80 space-y-1">
                {state.validationErrors.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive/60 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}