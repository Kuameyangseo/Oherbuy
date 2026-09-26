import React from 'react'

const Hero = () => {
  const bg2 = '/images/bgman2.png'

  return (
    <div>
      <div 
        className="gap-10 bg-white dark:bg-green-900 mb-12 flex flex-col z-20 items-center overflow-hidden sm:flex-row"
      >
        <div className="w-full mx-auto px-6 sm:px-20 flex flex-col sm:flex-row justify-center gap-10 relative py-10 sm:py-16">
          <div className="w-full sm:w-2/3 lg:w-2/5 flex flex-col relative z-20">
            <span className="w-20 h-2 bg-gray-800 dark:bg-white mb-8 sm:mb-12" />
            <h1 className="font-bebas-neue uppercase text-5xl sm:text-8xl font-black flex flex-col leading-none dark:text-white text-gray-800">
              Be on
              <span className="text-4xl sm:text-7xl">Time</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-700 dark:text-white">
              Dimension of reality that makes change possible and understandable. An indefinite and homogeneous environment in which natural events and human existence take place.
            </p>
            <div className="flex mt-8">
              <a href="#" className="uppercase py-2 px-4 rounded-lg bg-green-500 border-2 border-transparent text-white text-md mr-4 hover:bg-green-400">
                Get started
              </a>
              <a href="#" className="uppercase py-2 px-4 rounded-lg bg-transparent border-2 border-green-500 text-green-500 dark:text-white hover:bg-green-500 hover:text-white text-md">
                Read more
              </a>
            </div>
          </div>
          <div className="justify-center items-center flex w-full sm:w-auto">
            <img src={bg2} alt="Hero" className="max-w-xs md:max-w-sm m-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
