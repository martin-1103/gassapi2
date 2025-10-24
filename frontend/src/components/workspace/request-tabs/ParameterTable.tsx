import { ChevronUp, ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Interface untuk query parameter
export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// Props interface untuk ParameterTable component
interface ParameterTableProps {
  params: QueryParam[];
  filteredParams: QueryParam[];
  searchTerm: string;
  onUpdate: (id: string, updates: Partial<QueryParam>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (param: QueryParam) => void;
}

// Component untuk menampilkan parameter dalam bentuk table
export function ParameterTable({
  params: _params,
  filteredParams,
  searchTerm,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
}: ParameterTableProps) {
  return (
    <div className='flex-1 overflow-hidden px-4 pb-4'>
      <ScrollArea className='h-full'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>Enabled</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className='w-24'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParams.map((param, index) => (
              <ParameterRow
                key={param.id}
                param={param}
                index={index}
                filteredParamsLength={filteredParams.length}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onMove={onMove}
                onDuplicate={onDuplicate}
              />
            ))}
          </TableBody>
        </Table>

        {filteredParams.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            {searchTerm ? 'No parameters found' : 'No parameters added yet'}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Embedded component untuk parameter row
interface ParameterRowProps {
  param: QueryParam;
  index: number;
  filteredParamsLength: number;
  onUpdate: (id: string, updates: Partial<QueryParam>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (param: QueryParam) => void;
}

function ParameterRow({
  param,
  index,
  filteredParamsLength,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
}: ParameterRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={param.enabled}
          onCheckedChange={checked =>
            onUpdate(param.id, { enabled: !!checked })
          }
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder='Parameter name'
          value={param.key}
          onChange={e => onUpdate(param.id, { key: e.target.value })}
          className='font-mono text-sm'
          disabled={!param.enabled}
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder='Parameter value'
          value={param.value}
          onChange={e => onUpdate(param.id, { value: e.target.value })}
          className='font-mono text-sm'
          disabled={!param.enabled}
        />
      </TableCell>
      <TableCell>
        <Input
          placeholder='Description (optional)'
          value={param.description || ''}
          onChange={e => onUpdate(param.id, { description: e.target.value })}
          className='text-sm'
          disabled={!param.enabled}
        />
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onMove(param.id, 'up')}
            disabled={index === 0}
          >
            <ChevronUp className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onMove(param.id, 'down')}
            disabled={index === filteredParamsLength - 1}
          >
            <ChevronDown className='w-4 h-4' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='ghost'>
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDuplicate(param)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(param.id)}
                className='text-destructive'
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
