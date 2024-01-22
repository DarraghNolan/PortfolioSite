import React, { useEffect, useState } from 'react';
import projectsData from '../data/projects';
import ThreeDScene from './ThreeDScene'; // Import the modified ThreeDScene component
import { useNavigate } from 'react-router-dom';

const DetailsProject = () => {
  const projectId = location.pathname.split("/")[2];
  const [project, setProject] = useState(null);

  const navigate = useNavigate()

  useEffect(() => {
    const fetchProject = async () => {
      const selectedProject = projectsData.find(proj => proj.id === parseInt(projectId, 10));
      setProject(selectedProject);
    };
    fetchProject();
  }, [projectId]);

  if (!project) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Project not found</h1>
      </div>
    );
  }

  const backToHome = async (e) =>{
    e.preventDefault();
    try {
      navigate('/login');
    } catch (err) {
      console.log("Could not get back to home...");
    }
  };

  return (
    <div className="bg-midnight">
      <button className='fixed w-[10rem] h-[4rem] border-[1px] text-blueLIGHT border-solid border-pink mx-[4vw] my-[2rem] bg-midnight rounded-full' onClick={backToHome}>
        <h1>
          Back To Home
        </h1>
      </button>
      <div className="container mx-auto p-8 text-white2">
        <h1 className="text-4xl text-blueLIGHT font-bold mt-[5rem] mb-8">{project.title}</h1>
        <p>{project.description}</p>
        
        {project.videoURL ? (
        <iframe 
          width="560"
          height="315"
          src={project.videoURL}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="lg:w-full lg:h-[40rem] w-full h-[12rem] my-4"
      />
    ) : (
      <img src={project.imageURL} alt={project.title} className="lg:w-6/12 h-6/12 w-full h-4/12 my-4" />
    )}
    <div className="flex flex-wrap gap-8">
      {project.contentURL.map((content, index) => (
        <img
          key={index}
          src={content}
          alt={`Project ${index + 2}`}
          className="my-4 flex-auto object-cover sm:h-full w-fit lg:min-h-[50%] lg:max-h-[30rem] lg:max-w-[70rem] "
        />
      ))}
      </div>
      {/* <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 h-100">
        {project.ThreeDModels && project.ThreeDAlbedos && project.ThreeDOpacitys &&(
          project.ThreeDModels.map((model, index) => (
            <ThreeDScene 
              key={index}
              model={model}
              albedo={project.ThreeDAlbedos[index]}
              opacity={project.ThreeDOpacitys[index]}
              posX={project.modelProperties[index].posX}
              posY={project.modelProperties[index].posY}
              posZ={project.modelProperties[index].posZ}
              rotX={project.modelProperties[index].rotX}
              rotY={project.modelProperties[index].rotY}
              rotZ={project.modelProperties[index].rotZ}
              scale={project.modelProperties[index].scale}
              animSpeed={project.modelProperties[index].animSpeed}
              className="h-[20rem] w-fit"
            />
          ))
        )}</div> */}
      </div>
    </div>
  );
};

export default DetailsProject;