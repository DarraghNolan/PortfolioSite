import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import projectsData from '../data/projects.js';
import socialsData from '../data/socials.js';
import ThreeDScene from './ThreeDScene';
import Navbar from '../components/Navbar';
import SocialsBar from '../components/SocialsBar';

function Home() {
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedSubtags, setSelectedSubtags] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true); // Set to true to enable animation by default
  const [animSpeed, setAnimSpeed] = useState(1.15);
  const [featuredSocial, setFeaturedSocial] = useState([]);
  const [featuredProject, setFeaturedProject] = useState(null);
  const [gifKey, setGifKey] = useState(0);
  const { darkMode, toggleDarkMode } = useTheme(); // Use theme context

  useEffect(() => {
    const projectId = 8; // Replace with the actual project ID
    const project = projectsData.find((proj) => proj.id === projectId);
    setFeaturedProject(project);
    const social = socialsData; 
    setFeaturedSocial(social);
  }, []);

  // Add dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const tags = ['All', 'Web Dev', 'UX', 'Game Dev', 'Illustration', '3D Animation', 'Mobile Apps', 'UI Art'];

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
    <div className="bg-lightBG dark:bg-midnight transition-colors duration-500 min-h-screen">
      <Navbar />

      <div className="container mx-auto p-8 pt-20 bg-lightBG dark:bg-midnight text-midnight dark:text-white2 pb-20 transition-colors duration-500">
        {/* <div className="grid grid-cols-2 gap-[1rem] w-[25rem] lg:h-[25rem] max-h-[15rem] ml-[-2.5rem] lg:gap-2 lg:mb-[-4.5rem] lg:ml-[-2rem] lg:w-[30rem] mb-[-3.5rem]"></div> */}        
        <div className='md:mb-[23rem] mb-[15rem] mt-[3rem] flex justify-center mr-[305px] md:mr-[66.6vw] lg:grid lg:grid-cols-2 lg:mr-[0px]'>
          <div className='ml-[2.5vw]'>
            <img src='./images/BluNPinkBox.png' className='absolute justify-center w-[300px] h-[150px] md:w-[530px] md:h-[280px]'/>
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
        <div className="fixed bottom-0 left-0 w-full bg-lightBG dark:bg-midnight border-t border-pink z-50 transition-colors duration-500">
          <SocialsBar />
        </div>

        <h1 className="text-5xl font-bold mb-[80px] mt-[80px] italic flex justify-center content-center text-midnight dark:text-white2 transition-colors duration-500">
          My Work
        </h1>
        <div className="mb-4 mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
          {tags.map((tag) => {
            const isVisible = selectedTag === 'All' || tag === 'All' || tag === selectedTag;
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                className={`m-2 w-full px-4 py-2 mb-2 rounded-full hover:mb-0 lg:text-2xl lg:font-bold shadow-none text-xl hover:shadow-lg hover:inset-shadow-lg hover:border-[4px] hover:italic hover:text-2xl transition-all duration-300
                  ${isSelected
                    ? 'bg-lightBG dark:bg-midnight text-midnight dark:text-white2 border-[5px] border-blueLIGHT italic shadow-blueLIGHT shadow-lg font-bold hover:shadow-blueLIGHT hover:mb-[0.575rem]'
                    : 'bg-blue-500 text-midnight dark:text-white2 border-[1px] border-pink hover:shadow-pink hover:mb-0'
                  }
                  ${isVisible ? 'opacity-100' : 'opacity-25'}`}
                onClick={() => {
                  setSelectedTag(tag);
                  setSelectedSubtags([]);
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
        {(selectedTag !== 'All') && (
          <div className="grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-2 grid-cols-2 mb-12">
            {availableSubtags.map((subtag) => (
              <button
                key={subtag}
                className={`mr-4 ml-[1rem] mb-6 px-4 py-2 rounded-full font-bold hover:shadow-lg hover:inset-shadow-lg hover:shadow-blueLIGHT hover:italic transition-all duration-300 ${selectedSubtags.includes(subtag) ? 'bg-pink text-white2 border-[1px] border-pink italic shadow-pink shadow-lg hover:shadow-pink' : 'bg-blueLIGHT text-midnight border-[1px] border-blueLIGHT'}`}
                onClick={() => toggleSubtag(subtag)}
              >
                {subtag}
              </button>
            ))}
          </div>
        )}
        {selectedSubtags.length > 0 && (
          <p className="mb-6 ml-[1rem] text-base italic text-midnight dark:text-white2 transition-colors duration-300">
            Showing <span className="font-bold text-blueLIGHT">{selectedTag}</span> projects using <span className="font-bold text-pink">{selectedSubtags.join(' or ')}</span>:
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/detailsproject/${project.id}`} className="block relative"
              onMouseEnter={() => project.imageURL.endsWith('.gif') && setGifKey(k => k + 1)}>
              {/* Invisible spacer — maintains grid row height at collapsed size */}
              <div className="invisible pointer-events-none p-[10px] m-[10px]" aria-hidden="true">
                <h2 className="font-semibold mb-4">{project.title}</h2>
                <p className="text-sm mb-4 line-clamp-2">{project.description}</p>
                <img src={project.imageURL} alt="" className="w-full max-h-48 object-cover mb-4" />
              </div>
              {/* Actual card — absolutely positioned so expansion overlaps rows below */}
              <div className='group absolute top-0 left-0 right-0 bg-lightBG dark:bg-midnight overflow-hidden border-solid border-[1px] border-pink p-[10px] m-[10px] shadow-none hover:shadow-lg hover:shadow-pink hover:inset-shadow-lg hover:border-[4px] hover:z-20 text-xl hover:italic hover:text-2xl transition-all duration-300'>
                {/* Pattern overlay */}
                <div className="absolute inset-0 bg-repeat pointer-events-none opacity-15" style={{backgroundImage: "url('/images/pattern.webp')", backgroundSize: '48px 48px'}} />
                {/* Content */}
                <div className="relative">
                  <h2 className="text-blueLIGHT font-semibold mb-4">{project.title}</h2>
                  <p className="text-sm mb-4 not-italic text-midnight dark:text-white2 group-hover:text-base line-clamp-2 group-hover:line-clamp-none transition-colors duration-300">{project.description}</p>
                  {project.imageURL.endsWith('.gif') ? (
                    <div className="relative w-full max-h-48 group-hover:max-h-[800px] mb-4 transition-[max-height] duration-300 ease-in-out overflow-hidden">
                      <img src={project.contentURL[0]} alt={project.title} className="w-full h-full object-cover opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                      <img key={gifKey} src={project.imageURL} alt={project.title} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <img src={project.imageURL} alt={project.title} className="w-full max-h-48 group-hover:max-h-[800px] object-cover mb-4 transition-[max-height] duration-300 ease-in-out" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="m-[30vh]"></div>
      </div>
    </div>
  );
}

export default Home;
