import React from 'react'
import Link from 'next/link'
import './static.css';
import { HeartIcon, Search,UserRoundPlus, ShoppingCart } from 'lucide-react';


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
            <div className="profilePic">
              <div className="mainProfile">
                <Link href={"/login"} className='svgPic'>
                 <UserRoundPlus />
                </Link>
              </div>
              <Link href={"/login"} className='profileLink-col-1'>
                <span className='profileLink'>Hello</span>
                <span className='profileLink2'>Sign In</span>
              </Link>
            </div>
            <div className="watchList-col-1">
              <Link href={"/watchlist"} className='watchListLink'>
              <HeartIcon/>
              <div className="heartIcon">
              <span>0</span>
              </div>
              </Link>
              <Link href={"/cart"} className='watchListLink'>
              <ShoppingCart />
              <div className="heartIcon">
              <span>0</span>
              </div>
              </Link>
            </div>
      </div>
    </div>
  )
}

export default Header