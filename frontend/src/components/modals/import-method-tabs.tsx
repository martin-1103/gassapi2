import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link } from 'lucide-react';
import { ImportMethod } from '@/utils/import/types';

interface ImportMethodTabsProps {
  method: ImportMethod;
  onMethodChange: (method: ImportMethod) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlImport: () => void;
  importUrl: string;
  setImportUrl: (url: string) => void;
  isImporting: boolean;
  acceptedFormats: string;
}

export const ImportMethodTabs: React.FC<ImportMethodTabsProps> = ({
  method,
  onMethodChange,
  onFileUpload,
  onUrlImport,
  importUrl,
  setImportUrl,
  isImporting,
  acceptedFormats
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (importUrl.trim() && !isImporting) {
      onUrlImport();
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Import Method</Label>

      <Tabs value={method} onValueChange={(value) => onMethodChange(value as ImportMethod)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center space-y-3">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Choose a file to import</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: {acceptedFormats}
                </p>
              </div>
              <Button
                onClick={handleFileSelect}
                disabled={isImporting}
                variant="outline"
                className="mx-auto"
              >
                {isImporting ? 'Importing...' : 'Select File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="import-url" className="text-sm font-medium">
                API Documentation URL
              </Label>
              <Input
                id="import-url"
                type="url"
                placeholder="https://api.example.com/openapi.json"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={isImporting}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Enter URL to OpenAPI spec, Postman collection, or API documentation
              </p>
            </div>
            <Button
              type="submit"
              disabled={!importUrl.trim() || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Importing from URL...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Import from URL
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};