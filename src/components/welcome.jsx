import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Aurora from './welcome_animation';
import ShinyText from './shinyText';

const Welcome = () => {
  const navigate = useNavigate();

  return (

      <div className='z-10 '>
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
        <div className='flex flex-col items-center justify-center text-3xl mt-56'>
          <h1>Hi, I'm <span className='font-bold text-pink-700'>Hari</span>,</h1>
          <h2 className='mt-4'>and I'm a Emerging FullStack Developer.</h2>
          <a className='cursor-pointer border border-white mt-9 p-3' onClick={() => navigate('/hero')}>
            <ShinyText text="Know more about me" disabled={false} speed={3} className='custom-class border-white' />
          </a>
        </div>
      </div>
  );
};

export default Welcome;
