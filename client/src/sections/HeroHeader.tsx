import React from 'react';
import heroImg from "../assets/heroheaderimage.png";

const HeroHeader: React.FC = () => {
  return (
    <section className="relative w-full h-full py-16 lg:py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-[60%] flex flex-col items-start space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Gjej rrugën tënde <br /> të arsimit në Kosovë
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
            Krahaso shkollat, zbulo programet dhe gjej përshtatjen më të mirë për ty — 
            nga parashkollori deri në universitet, në një vend të vetëm.
          </p>
          
          <button className="bg-[#99D98C] hover:bg-green-600 text-black font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md">
            Fillo kërkimin
          </button>
        </div>

        <div className="w-full lg:w-[30%] flex justify-center items-center">
          <div>
            <img 
              src={heroImg}
              alt="Arsimi në Kosovë" 
              className="w-full h-full"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroHeader;