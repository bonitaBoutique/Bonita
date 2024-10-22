import React from 'react';
import { Disclosure } from '@headlessui/react';
import backgroundImage from '../assets/img/banner.png';



export default function Header() {
  return (
    <Disclosure as="header" className="relative bg-cover bg-center h-[64rem]" style={{ backgroundImage: `url(${backgroundImage})` }}>
    
    </Disclosure>
  );
}



