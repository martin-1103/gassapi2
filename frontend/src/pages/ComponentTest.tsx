import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Halaman test untuk komponen shadcn/ui
 * Memastikan semua komponen bekerja dengan baik
 */
export default function ComponentTest() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className='min-h-screen p-8 space-y-8'>
      {/* Theme Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Toggle</CardTitle>
          <CardDescription>Test dark mode support</CardDescription>
        </CardHeader>
        <CardContent className='flex items-center gap-4'>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
          <Label>Dark Mode {isDark ? 'On' : 'Off'}</Label>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>All button styles and sizes</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-4'>
          <Button>Default</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='destructive'>Destructive</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='link'>Link</Button>
          <Button size='sm'>Small</Button>
          <Button size='lg'>Large</Button>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Input fields and controls</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' placeholder='Enter your name' />
          </div>
          <div className='flex items-center gap-2'>
            <Switch id='notifications' />
            <Label htmlFor='notifications'>Enable notifications</Label>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Badge variants</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Badge>Default</Badge>
          <Badge variant='secondary'>Secondary</Badge>
          <Badge variant='destructive'>Destructive</Badge>
          <Badge variant='outline'>Outline</Badge>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs Component</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='tab1' className='w-full'>
            <TabsList>
              <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
              <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
              <TabsTrigger value='tab3'>Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value='tab1' className='space-y-4'>
              <p>This is tab 1 content</p>
            </TabsContent>
            <TabsContent value='tab2' className='space-y-4'>
              <p>This is tab 2 content</p>
            </TabsContent>
            <TabsContent value='tab3' className='space-y-4'>
              <p>This is tab 3 content</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
