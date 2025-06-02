import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectsData from '../data/projects.js'; // Ensure these paths are correct
import socialsData from '../data/socials.js';
import ThreeDScene from './ThreeDScene';

function Home() {
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedSubtags, setSelectedSubtags] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true); // Set to true to enable animation by default
  const [animSpeed, setAnimSpeed] = useState(1.15);
  const [featuredSocial, setFeaturedSocial] = useState([]);
  const [featuredProject, setFeaturedProject] = useState(null);

  useEffect(() => {
    const projectId = 8; // Replace with the actual project ID
    const project = projectsData.find((proj) => proj.id === projectId);
    setFeaturedProject(project);
    const social = socialsData; 
    setFeaturedSocial(social);
  }, []);

  const tags = ['All', 'Web Development', 'UX', 'Game Development', 'Illustration', '3D Animation', 'Mobile Applications', 'UI Art'];

  const availableSubtags = Array.from(new Set(
    projectsData
      .filter((project) => project.tags.includes(selectedTag))
      .flatMap((project) => project.subTags)
  ));

  const toggleSubtag = (subtag) => {
    if (selectedSubtags.includes(subtag)) {
      setSelectedSubtags(selectedSubtags.filter((tag) => tag !== subtag));
    } else {
      setSelectedSubtags([...selectedSubtags, subtag]);
    }
  };

  const filteredProjects = selectedTag === 'All'
    ? projectsData
    : projectsData.filter((project) =>
        project.tags.includes(selectedTag) &&
        (selectedSubtags.length === 0 || project.subTags.some((tag) => selectedSubtags.includes(tag)))
      );

  return (
    <div className="bg-midnight">
      <div className="container mx-auto p-8 bg-midnight text-white2 pb-20">
        {/* <div className="grid grid-cols-2 gap-[1rem] w-[25rem] lg:h-[25rem] max-h-[15rem] ml-[-2.5rem] lg:gap-2 lg:mb-[-4.5rem] lg:ml-[-2rem] lg:w-[30rem] mb-[-3.5rem]"></div> */}        
        <div className='md:mb-[23rem] mb-[15rem] mt-[3rem] flex justify-center mr-[305px] md:mr-[66.6vw] lg:grid lg:grid-cols-2 lg:mr-[0px]'>
          <div>
            <img src='./images/BluNPinkBox.png' className='absolute justify-center w-[300px] h-[150px] md:w-[520px] md:h-[280px]'/>
            <img src='./gifs/Signature.gif' className='absolute justify-center w-[310px] md:w-[580px] mt-[30px] md:mt-[60px] ml-[15px] md:ml-[10px]'/>
          </div>          
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-[16px] lg:w-[400px] lg:h-[240px] lg:ml-[100px] lg:mb-[-200px]">
            {featuredProject && (
              <ThreeDScene
                key={featuredProject.id}
                url={featuredProject.ThreeDModels[2]}
                albedo={featuredProject.ThreeDAlbedos[2]}
                opacity={featuredProject.ThreeDOpacitys[2]}
                metalness={featuredProject.ThreeDMetalness[2]}
                emissive={featuredProject.ThreeDEmissive[2]}
                posX={featuredProject.modelProperties[2].posX}
                posY={featuredProject.modelProperties[2].posY}
                posZ={featuredProject.modelProperties[2].posZ}
                rotX={featuredProject.modelProperties[2].rotX}
                rotY={featuredProject.modelProperties[2].rotY}
                rotZ={featuredProject.modelProperties[2].rotZ}
                scale={featuredProject.modelProperties[2].scale}
                animSpeed={animSpeed}
                isAnimating={isAnimating}
                camPosY={featuredProject.modelProperties[2].camPosY}
              />
            )}
            {featuredProject && (
              <ThreeDScene
                key={featuredProject.id}
                url={featuredProject.ThreeDModels[3]}
                albedo={featuredProject.ThreeDAlbedos[3]}
                opacity={featuredProject.ThreeDOpacitys[3]}
                metalness={featuredProject.ThreeDMetalness[3]}
                emissive={featuredProject.ThreeDEmissive[3]}
                posX={featuredProject.modelProperties[3].posX}
                posY={featuredProject.modelProperties[3].posY}
                posZ={featuredProject.modelProperties[3].posZ}
                rotX={featuredProject.modelProperties[3].rotX}
                rotY={featuredProject.modelProperties[3].rotY}
                rotZ={featuredProject.modelProperties[3].rotZ}
                scale={featuredProject.modelProperties[3].scale}
                animSpeed={animSpeed}
                isAnimating={isAnimating}
                camPosY={featuredProject.modelProperties[3].camPosY}
              />
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl text-center">
            Howya! My name is Darragh Nolan and I'm web developer from Dublin living in Edinburgh. I did my bachelor's degree is in <span className="font-bold">Game Design</span> and graduated in <span className="font-bold">2021</span>. I was a 3D animator for an indie games company called Blue Diamond, operating with an international team I helped them develop a game called <span className="font-bold">"Harbinger - The Wild Dawn"</span>.             
          </h2>
          <br/>
          <h2 className="text-xl text-center">
            During my time working there I also worked as a supervisor in a petrol station. I started my master's in <span className="font-bold">Creative Digital Media & UX</span> in <span className="font-bold">2022</span>. While I was doing my master's, I made a web application for my job at the petrol station to store all the theft reports they had.
          </h2>
          <h2 className="text-xl text-center font-bold italic">
            (There were a lot).
          </h2>
          <br/>
          <h2 className="text-xl text-center">
            After finishing my master's in <span className="font-bold">December 2023</span> I moved to Scotland in <span className="font-bold">May 2024</span> and started a web development company with a local business owner I met. I make websites now for small businesses around Edinburgh with the company, <span className="font-bold">Emerald Oak Studios</span>. 
          </h2>
        </div>
        <div className="fixed bottom-0 left-0 w-full bg-midnight border-t border-pink z-50">
          <div className="flex justify-evenly items-center py-4 z-50">
            {featuredSocial.map((social) => (
              <div
                key={social.id}
                className="cursor-pointer"
                onClick={() => window.open(social.URL, '_blank')}
              >
              <img 
                src={social.imageURL} 
                alt={social.title} 
                className="w-10 h-10 object-contain hover:opacity-75 transition-opacity duration-200" 
              />
            </div>
          ))}
        </div>
      </div>

        <h1 className="text-5xl font-bold mb-[80px] mt-[80px] italic flex justify-center content-center">
          My Work
        </h1>
        <div className="mb-4 flex-auto content-center mt-[1.5rem]">
          <a className="text-3xl md:text-sm"> Filter By : </a>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`mr-4 ml-[1rem] px-4 py-2 mb-2 rounded-full ${selectedTag === tag ? 'bg-midnight text-white2 border-[1px] border-blueLIGHT' : 'bg-blue-500 text-white2 border-[1px] border-pink'}`}
              onClick={() => {
                setSelectedTag(tag);
                setSelectedSubtags([]);
              }}
            >
              {tag}
            </button>
          ))}
          {(selectedTag !== 'All') && (
            <>
              <br/><br/>
              <a>Tools:</a>
              {availableSubtags.map((subtag) => (
                <button
                  key={subtag}
                  className={`mr-4 ml-[1rem] px-4 py-2 mb-2 rounded-full font-bold ${selectedSubtags.includes(subtag) ? 'bg-pink text-white2 border-[1px] border-white2' : 'bg-blueLIGHT text-midnight border-[1px] border-blueLIGHT'}`}
                  onClick={() => toggleSubtag(subtag)}
                >
                  {subtag}
                </button>
              ))}
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/detailsproject/${project.id}`}>
              <div className='border-solid border-[1px] border-pink p-[10px] m-[10px] shadow-none hover:shadow-lg hover:shadow-pink hover:inset-shadow-lg hover:border-[4px] text-xl hover:italic hover:text-2xl'>
                <h2 className="text-blueLIGHT font-semibold mb-4">{project.title}</h2>
                <p className="text-sm mb-4 not-italic">{project.description}</p>
                <img src={project.imageURL} alt={project.title} className="w-full min-h-32 max-h-48 object-cover mb-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

  // return (
  //   <div className="home-container">
  //     <div className="animation-container">
  //       {featuredProject && featuredProject.ThreeDModels.map((model, index) => (
  //         <ThreeDScene 
  //           key={index}
  //           url={model}
  //           albedo={featuredProject.ThreeDAlbedos[index]}
  //           opacity={featuredProject.ThreeDOpacitys[index]}
  //           posX={featuredProject.modelProperties[index].posX}
  //           posY={featuredProject.modelProperties[index].posY}
  //           posZ={featuredProject.modelProperties[index].posZ}
  //           rotX={featuredProject.modelProperties[index].rotX}
  //           rotY={featuredProject.modelProperties[index].rotY}
  //           rotZ={featuredProject.modelProperties[index].rotZ}
  //           isAnimating={isAnimating} 
  //           animSpeed={animSpeed} 
  //         />
  //       ))}
  //     </div>
  //     <button onClick={toggleAnimation}>
  //       {isAnimating ? 'Pause Animation' : 'Play Animation'}
  //     </button>
  //     <div>
  //       {/* <label>
  //         Animation Speed:
  //         <input
  //           type="range"
  //           min="0"
  //           max="3"
  //           step="0.1"
  //           value={animSpeed}
  //           onChange={handleSpeedChange}
  //         />
  //       </label>
  //       <span>{animSpeed.toFixed(1)}</span> */}
  //       {/* Display the current speed */}
  //     </div>
  //     <div className="other-content">
  //       {/* Other content of your home page */}
  //     </div>
  //   </div>
  // );

export default Home;
