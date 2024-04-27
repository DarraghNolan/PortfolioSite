import React, { useState, useEffect } from 'react';
import projectsData from '../data/projects';
import socialsData from '../data/socials';
import '../index.css';
import { Link } from 'react-router-dom';
import ThreeDScene from './ThreeDScene';

const Login = () => {
  const [selectedTag, setSelectedTag] = useState('All'); // Initial tag is 'all'
  const [selectedSubtags, setSelectedSubtags] = useState([]);
  const [featuredProject, setFeaturedProject] = useState(null);
  const [featuredSocial, setFeaturedSocial] = useState([]);

  useEffect(() => {
    // Fetch the project you want to feature (replace 'projectId' with the actual project ID)
    const projectId = 8; // Replace with the actual project ID
    const project = projectsData.find((proj) => proj.id === projectId);
    setFeaturedProject(project);

    const social = socialsData;  // Corrected usage
    setFeaturedSocial(social);
  }, []);

  const tags = ['All', 'UI Art', 'Web Development', 'UX', 'Game Development', 'Illustration', '3D Animation', 'Mobile Applications'];

  // Extract unique subtags based on the selected primary tag
  const availableSubtags = Array.from(new Set(
    projectsData
      .filter((project) => project.tags.includes(selectedTag))
      .flatMap((project) => project.subTags)
  ));

  // Handle subtag selection
  const toggleSubtag = (subtag) => {
    if (selectedSubtags.includes(subtag)) {
      setSelectedSubtags(selectedSubtags.filter((tag) => tag !== subtag));
    } else {
      setSelectedSubtags([...selectedSubtags, subtag]);
    }
  };

  // Filter projects based on selected primary tag and subtags
  const filteredProjects = selectedTag === 'All'
    ? projectsData
    : projectsData.filter((project) =>
        project.tags.includes(selectedTag) &&
        (selectedSubtags.length === 0 || project.subTags.some((tag) => selectedSubtags.includes(tag)))
      );

  return (
    <div className="bg-midnight">
      <div className="container mx-auto p-8 bg-midnight text-white2">
        {/* <h1 className="text-6xl font-bold w-[10rem] mt-[10rem] mb-[-15rem] lg:mb-[-15rem] lg:mt-[8rem] lg:ml-5rem">
          Darragh Nolan
        </h1> */}
        <div className="grid grid-cols-2 gap-[1rem] w-[25rem] lg:h-[25rem] max-h-[15rem] ml-[-2.5rem] lg:gap-2 lg:mb-[-4.5rem] lg:ml-[0] lg:w-[30rem] mb-[-3.5rem]">
          {featuredProject && (
            <ThreeDScene
              key={featuredProject.id}
              model={featuredProject.ThreeDModels[2]}
              albedo={featuredProject.ThreeDAlbedos[2]}
              opacity={featuredProject.ThreeDOpacitys[2]}
              posX={featuredProject.modelProperties[2].posX}
              posY={featuredProject.modelProperties[2].posY}
              posZ={featuredProject.modelProperties[2].posZ}
              rotX={featuredProject.modelProperties[2].rotX}
              rotY={featuredProject.modelProperties[2].rotY}
              rotZ={featuredProject.modelProperties[2].rotZ}
              scale={featuredProject.modelProperties[2].scale}
              animSpeed={featuredProject.modelProperties[2].animSpeed}
            />
          )}
          {featuredProject && (
            <ThreeDScene
              key={featuredProject.id}
              model={featuredProject.ThreeDModels[1]}
              albedo={featuredProject.ThreeDAlbedos[1]}
              opacity={featuredProject.ThreeDOpacitys[1]}
              posX={featuredProject.modelProperties[1].posX}
              posY={featuredProject.modelProperties[1].posY}
              posZ={featuredProject.modelProperties[1].posZ}
              rotX={featuredProject.modelProperties[1].rotX}
              rotY={featuredProject.modelProperties[1].rotY}
              rotZ={featuredProject.modelProperties[1].rotZ}
              scale={featuredProject.modelProperties[1].scale}
              animSpeed={featuredProject.modelProperties[1].animSpeed}
            />
          )}
        </div>
        <div className="hidden">
          {featuredProject && (
            <ThreeDScene
              key={featuredProject.id}
              model={featuredProject.ThreeDModels[0]}
              albedo={featuredProject.ThreeDAlbedos[0]}
              opacity={featuredProject.ThreeDOpacitys[0]}
              posX={featuredProject.modelProperties[0].posX}
              posY={featuredProject.modelProperties[0].posY}
              posZ={featuredProject.modelProperties[0].posZ}
              rotX={featuredProject.modelProperties[0].rotX}
              rotY={featuredProject.modelProperties[0].rotY}
              rotZ={featuredProject.modelProperties[0].rotZ}
              scale={featuredProject.modelProperties[0].scale}
              animSpeed={featuredProject.modelProperties[0].animSpeed}
            />
          )}
        </div>
        <div className='lg:mb-[20rem] md:mb-[20rem] mb-[15rem]'>
          <img src='./imgs/BluNPinkBox.png' className='absolute w-[85vw] sm:h-[30vh] sm:min-h-[15rem] sm:max-h-[10rem] h-[20vh] md:w-[35rem]'/>
          <img src='./gifs/Signature.gif' className='absolute max-w-[90vw] mt-[2.25rem] ml-[0]'/>
        </div>
        <div className='hidden ml-[57vw] md:min-ml-[40rem] mt-[-27rem] justify-end md:block absolute'>
          {featuredSocial.map((social) => (
            <Link key={social.id} to={social.URL}>
              <div className='flex'>
                <div className='mx-[1rem] max-w-[5rem] min-w-[10rem] lg:min-w-[15rem] w-[13vw] text-right'>
                  <h2 className="text-xl text-blueLIGHT font-semibold mb-4 ">{social.title}</h2>
                  <p className="mb-4">{social.description}</p>
                </div>
                <img src={social.imageURL} alt={social.title} className="w-[6rem] h-[6rem] object-cover mb-4" />
              </div>              
            </Link>
          ))}
        </div>
        <h1 className="text-5xl font-bold mb-[2.5rem]">
          My Work
        </h1>
        <div className="mb-4 flex-auto content-center mt-[1.5rem]">
          {/* Display filter buttons */}
          <a> Filter By : </a>
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
          {(selectedTag != 'All') ? (
            <>
            <br/>
            <br/>
            <a>Tools:</a>
            {/* Display subtags based on the selected primary tag */}
            {selectedTag !== 'All' && availableSubtags.map((subtag) => (
              <button
                key={subtag}
                className={`mr-4 ml-[1rem] px-4 py-2 mb-2 rounded-full font-bold ${selectedSubtags.includes(subtag) ? 'bg-pink text-white2 border-[1px] border-white2' : 'bg-blueLIGHT text-midnight border-[1px] border-blueLIGHT'}`}
                onClick={() => toggleSubtag(subtag)}
              >
                {subtag}
              </button>
            ))}
          </>
          ) : null}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/detailsproject/${project.id}`}>
              <div className='border-solid border-[1px] border-pink p-[10px] m-[10px]' 
                // style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}
              >
                <h2 className="text-xl text-blueLIGHT font-semibold mb-4 ">{project.title}</h2>
                <p className="mb-4 ">{project.description}</p>
                <img src={project.imageURL} alt={project.title} className="w-full min-h-32 max-h-48 object-cover mb-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;