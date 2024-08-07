import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

const Header = () => {
  return (
    <nav className='flex justify-between items-center py-1'>
      <Link href="/">
        <div className='relative w-[150px] h-[75px]'> 
          <Image 
            src="/img/santander-logo.png" 
            alt="logo" 
            fill 
            className='object-contain' 
            sizes="(max-width: 1000px) 100vw, 50vw"
          />
        </div>
      </Link>
      {/* <SearchInput /> */}
    </nav>
  )
}

export default Header
