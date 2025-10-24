export const ResponseLoadingState = () => {
  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-sm text-muted-foreground'>Sending request...</p>
        </div>
      </div>
    </div>
  );
};