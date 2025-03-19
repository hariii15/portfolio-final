import React from 'react';
import { useNavigate } from 'react-router-dom';
import Aurora from './welcome_animation';
import ShinyText from './shinyText';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className='z-10'>
      <Aurora
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <div className='absolute inset-0 flex flex-col items-center justify-center px-4'>
        <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center'>
          Hi, I'm <span className='font-bold text-pink-700'>Hari</span>,
        </h1>
        <h2 className='mt-2 sm:mt-3 md:mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl text-center'>
          and I'm a Emerging FullStack Developer.
        </h2>
        <a
          className='cursor-pointer border border-white mt-6 sm:mt-8 md:mt-9 p-2 md:p-3 text-sm sm:text-base md:text-lg'
          onClick={() => navigate('/hero')}
        >
          <ShinyText
            text="Know more about me"
            disabled={false}
            speed={3}
            className='custom-class border-white'
          />
        </a>
      </div>
    </div>
  );
};

export default Welcome;
