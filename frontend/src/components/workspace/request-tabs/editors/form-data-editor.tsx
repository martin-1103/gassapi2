import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BodyData } from '@/hooks/use-request-body-state';

interface FormDataEditorProps {
  bodyData: BodyData;
  addFormField: () => void;
  updateFormField: (id: string, updates: any) => void;
  deleteFormField: (id: string) => void;
  handleFileUpload: (id: string, file: File) => void;
}

export const FormDataEditor: React.FC<FormDataEditorProps> = ({
  bodyData,
  addFormField,
  updateFormField,
  deleteFormField,
  handleFileUpload,
}) => {
  return (
    <div className='h-full'>
      <div className='flex items-center justify-between mb-4'>
        <h4 className='font-medium'>Form Data</h4>
        <Button size='sm' onClick={addFormField}>
          <Plus className='w-4 h-4 mr-2' />
          Add Field
        </Button>
      </div>

      {bodyData.formData.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
          <Plus className='w-8 h-8 mb-2 opacity-50' />
          <p>No form fields added</p>
          <p className='text-sm'>
            Click "Add Field" to create form data
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>Enabled</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className='w-20'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bodyData.formData.map(field => (
              <TableRow key={field.id}>
                <TableCell>
                  <Checkbox
                    checked={field.enabled}
                    onCheckedChange={checked =>
                      updateFormField(field.id, { enabled: !!checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='text'
                    placeholder='Key'
                    value={field.key}
                    onChange={e =>
                      updateFormField(field.id, { key: e.target.value })
                    }
                    className='font-mono text-sm'
                  />
                </TableCell>
                <TableCell>
                  {field.type === 'text' ? (
                    <Input
                      type='text'
                      placeholder='Value'
                      value={field.value}
                      onChange={e =>
                        updateFormField(field.id, {
                          value: e.target.value,
                        })
                      }
                      className='font-mono text-sm'
                    />
                  ) : (
                    <div className='flex items-center gap-2'>
                      <Input
                        type='file'
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(field.id, file);
                        }}
                        className='text-sm'
                      />
                      {field.value && (
                        <span className='text-xs text-muted-foreground'>
                          {field.value}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={field.type}
                    onValueChange={(type: 'text' | 'file') =>
                      updateFormField(field.id, { type })
                    }
                  >
                    <SelectTrigger className='w-24'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='text'>Text</SelectItem>
                      <SelectItem value='file'>File</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => deleteFormField(field.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};