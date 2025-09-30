import React from 'react'
import Link from 'next/link'
import './static.css';
import { Search } from 'lucide-react';


const Header = () => {
  return (
    <div className="navbar-col-1">
      <div className="navbar-col-2">
        <div>
          <Link href={"/"}>
           <span className='header-logo'>OherBuy</span>
           </Link>
        </div>
        <div className="searchBar-col-1">
           <input type="text" placeholder='search for products' 
           className='searchBar'/>

           <div className="searchIcon">
            <Search className='icon-search'/>
           </div>
        </div>
      </div>
    </div>
  )
}

export default Header