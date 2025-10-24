import Badge from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Showcase komponen shadcn/ui yang sudah terinstall
 * Bisa dipakai sebagai referensi penggunaan komponen
 */
export function ComponentShowcase() {
  return (
    <div className='container mx-auto py-8 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold mb-2'>shadcn/ui Components</h1>
        <p className='text-muted-foreground'>
          Semua komponen sudah siap digunakan untuk API documentation tool
        </p>
      </div>

      <Separator />

      {/* Buttons */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Buttons</h2>
        <div className='flex flex-wrap gap-2'>
          <Button>Primary</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='destructive'>Destructive</Button>
          <Button variant='link'>Link</Button>
        </div>
      </section>

      <Separator />

      {/* Form Elements */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Form Elements</h2>
        <Card>
          <CardHeader>
            <CardTitle>Example Form</CardTitle>
            <CardDescription>
              Form controls dengan label dan input
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='nama@example.com' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='method'>HTTP Method</Label>
              <Select>
                <SelectTrigger id='method'>
                  <SelectValue placeholder='Pilih method' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='get'>GET</SelectItem>
                  <SelectItem value='post'>POST</SelectItem>
                  <SelectItem value='put'>PUT</SelectItem>
                  <SelectItem value='delete'>DELETE</SelectItem>
                  <SelectItem value='patch'>PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch id='airplane-mode' />
              <Label htmlFor='airplane-mode'>Enable feature</Label>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Tabs */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Tabs</h2>
        <Tabs defaultValue='request' className='w-full'>
          <TabsList>
            <TabsTrigger value='request'>Request</TabsTrigger>
            <TabsTrigger value='response'>Response</TabsTrigger>
            <TabsTrigger value='docs'>Documentation</TabsTrigger>
          </TabsList>
          <TabsContent value='request'>
            <Card>
              <CardContent className='pt-6'>
                <p>Request parameters akan ditampilkan di sini</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='response'>
            <Card>
              <CardContent className='pt-6'>
                <p>Response data akan ditampilkan di sini</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='docs'>
            <Card>
              <CardContent className='pt-6'>
                <p>API documentation akan ditampilkan di sini</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Badges & Progress */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Status Indicators</h2>
        <div className='flex flex-wrap gap-2'>
          <Badge>Default</Badge>
          <Badge variant='secondary'>200 OK</Badge>
          <Badge variant='outline'>Pending</Badge>
          <Badge variant='destructive'>Error</Badge>
        </div>
        <Progress value={66} className='w-full' />
      </section>

      <Separator />

      {/* Tooltip */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Tooltip</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='outline'>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip content di sini</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
    </div>
  );
}
