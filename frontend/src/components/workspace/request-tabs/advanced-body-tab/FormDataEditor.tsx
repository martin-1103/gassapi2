import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormDataField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
  file?: File;
}

interface FormDataEditorProps {
  formData: FormDataField[];
  onChange: (formData: FormDataField[]) => void;
}

export function FormDataEditor({ formData, onChange }: FormDataEditorProps) {
  const addFormField = () => {
    const newField = {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text' as const,
      enabled: true,
    };
    onChange([...formData, newField]);
  };

  const updateField = (id: string, updates: Partial<FormDataField>) => {
    onChange(
      formData.map(field =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    );
  };

  const deleteField = (id: string) => {
    onChange(formData.filter(field => field.id !== id));
  };

  const handleFileSelect = (id: string, file: File) => {
    updateField(id, { file, value: file.name });
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='flex justify-between items-center p-4 border-b'>
        <h4 className='font-medium'>Form Data</h4>
        <Button size='sm' onClick={addFormField}>
          Add Field
        </Button>
      </div>

      <div className='flex-1 overflow-auto p-4'>
        {formData.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            No form fields added. Click &quot;Add Field&quot; to create one.
          </div>
        ) : (
          <div className='space-y-3'>
            {formData.map(field => (
              <div
                key={field.id}
                className='flex gap-2 items-center p-3 border rounded-lg'
              >
                <input
                  type='checkbox'
                  checked={field.enabled}
                  onChange={e =>
                    updateField(field.id, { enabled: e.target.checked })
                  }
                  className='rounded'
                />

                <Select
                  value={field.type}
                  onValueChange={(value: 'text' | 'file') =>
                    updateField(field.id, { type: value })
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

                <input
                  type='text'
                  placeholder='Key'
                  value={field.key}
                  onChange={e => updateField(field.id, { key: e.target.value })}
                  className='flex-1 px-3 py-2 border rounded'
                />

                {field.type === 'text' ? (
                  <input
                    type='text'
                    placeholder='Value'
                    value={field.value}
                    onChange={e =>
                      updateField(field.id, { value: e.target.value })
                    }
                    className='flex-1 px-3 py-2 border rounded'
                  />
                ) : (
                  <div className='flex-1 flex items-center gap-2'>
                    <input
                      type='file'
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(field.id, file);
                      }}
                      className='hidden'
                      id={`file-${field.id}`}
                    />
                    <label
                      htmlFor={`file-${field.id}`}
                      className='flex-1 px-3 py-2 border rounded cursor-pointer hover:bg-muted'
                    >
                      {field.file ? field.file.name : 'Choose file'}
                    </label>
                  </div>
                )}

                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => deleteField(field.id)}
                  className='text-red-600 hover:text-red-700'
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
