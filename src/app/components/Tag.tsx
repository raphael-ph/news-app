import React from 'react';

interface TagProps {
  data: string | number | null | undefined;
}

const Tag: React.FC<TagProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <div className='bg-black rounded-md px-2 py-1 shadow-md text-xs text-white'>
      {data}
    </div>
  );
}

export default Tag;
