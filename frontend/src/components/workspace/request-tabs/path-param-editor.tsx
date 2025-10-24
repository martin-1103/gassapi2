import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { QueryParam } from '@/components/workspace/request-tabs/params-tab';

interface PathParamEditorProps {
  param: QueryParam;
  index: number;
  total: number;
  onUpdate: (updates: Partial<QueryParam>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onEncode: () => void;
  onDuplicate: () => void;
}

export function PathParamEditor({
  param,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
  onEncode,
  onDuplicate,
}: PathParamEditorProps) {
  return (
    <tr>
      <td className='py-2 px-4 align-middle'>
        <Checkbox
          checked={param.enabled}
          onCheckedChange={checked => onUpdate({ enabled: !!checked })}
        />
      </td>
      <td className='py-2 px-4 align-middle'>
        <Input
          placeholder='Parameter name'
          value={param.key}
          onChange={e => onUpdate({ key: e.target.value })}
          className='font-mono text-sm'
        />
      </td>
      <td className='py-2 px-4 align-middle'>
        <Input
          placeholder='Parameter value'
          value={param.value}
          onChange={e => onUpdate({ value: e.target.value })}
          className='font-mono text-sm'
        />
      </td>
      <td className='py-2 px-4 align-middle'>
        <Input
          placeholder='Description (optional)'
          value={param.description || ''}
          onChange={e => onUpdate({ description: e.target.value })}
          className='text-sm'
        />
      </td>
      <td className='py-2 px-4 align-middle'>
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onMove('up')}
                disabled={index === 0}
              >
                <ChevronUp className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move up</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onMove('down')}
                disabled={index === total - 1}
              >
                <ChevronDown className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move down</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='ghost'>
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onDuplicate}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEncode}>URL Encode</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className='text-destructive'>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
