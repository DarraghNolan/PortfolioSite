import React, { useEffect, useState, lazy, Suspense } from 'react'; // Import lazy and Suspense
import projectsData from '../data/projects';
import { useNavigate } from 'react-router-dom';

// Lazy load the ThreeDScene component
const ThreeDScene = lazy(() => import('./ThreeDScene'));

const DetailsProject = () => {
  const projectId = location.pathname.split("/")[2];
  const [project, setProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayedModel, setDisplayedModel] = useState(1);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const openOverlay = (image) => {
    setSelectedImage(image);
    setOverlayVisible(true);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const newIndex = (selectedIndex + direction + project.contentURL.length) % project.contentURL.length;
    setSelectedIndex(newIndex);
    setSelectedImage(project.contentURL[newIndex]);
  };

  const navigateModel = (direction) => {
    if (!project.ThreeDModels || !project.ThreeDAlbedos || !project.ThreeDOpacitys || !project.modelProperties) {
      // Ensure that necessary arrays are defined
      return;
    }
  
    const newIndex = (displayedModel + direction + project.ThreeDModels.length) % project.ThreeDModels.length;
  
    if (newIndex >= 0 && newIndex < project.modelProperties.length) {
      // Ensure that the newIndex is within the bounds of modelProperties array
      setDisplayedModel(newIndex);
    }
  };

  return (
    <div className="bg-midnight">
      <button className='fixed w-[10rem] h-[4rem] border-[1px] text-blueLIGHT border-solid border-pink mx-[4vw] my-[2rem] bg-midnight rounded-full' onClick={backToHome}>
        <h1 className='z-50'>
          Back To Home
        </h1>
      </button>
      {/* Overlay */}
      {overlayVisible && (
      <div>
        <div className="fixed inset-0 bg-midnight bg-opacity-80 z-50 flex justify-center items-center">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected"
              className="max-h-[95vh] w-fit max-w-[95vw]"
            />
          </div>
          <button 
            className='absolute top-0 right-0 m-4 w-[6rem] h-[4rem] border-[1px] text-blueLIGHT border-solid border-pink mx-[4vw] my-[2rem] bg-midnight rounded-full' 
            onClick={closeOverlay}
          >
            <h1 className='z-40'>
              Close
            </h1>
          </button>
          <button 
            className='absolute top-[88vh] sm:top-[50vh] right-0 m-4 w-[6rem] bg-opacity-60 h-[4rem] border-[1px] text-blueLIGHT border-solid border-pink mx-[4vw] my-[2rem] bg-midnight rounded-full' 
            onClick={() => navigateImage(1)}
          >
            <h1 className='z-40 text-5xl mt-[-0.5rem]'>
              &#8594;
            </h1>
          </button>
          <button 
            className='absolute top-[88vh] sm:top-[50vh] left-0 m-4 w-[6rem] bg-opacity-60 h-[4rem] border-[1px] text-blueLIGHT border-solid border-pink mx-[4vw] my-[2rem] bg-midnight rounded-full' 
            onClick={() => navigateImage(-1)}
          >
            <h1 className='z-40 text-5xl mt-[-0.5rem]'>
              &#8592;
            </h1>
          </button>
        </div>
      </div>        
      
      )}
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
      <div className='flex flex-wrap gap-8 my-[2rem]'>
          <h2 className='text-xl'>Tools used:</h2>
          {project.subTags.map((tools, index) => (
          <div key={index}>
            <h3 className='text-xl font-bold text-blueLIGHT'>
              {tools}
            </h3>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-8">
        {project.contentURL.map((content, index) => (
          <img
            key={index}
            src={content}
            alt={`Project ${index + 2}`}
            className="my-4 flex-auto object-cover sm:h-full w-fit lg:min-h-[50%] md:max-h-[12rem] lg:max-h-[17rem] xl:max-h-[22rem] 2xl:max-h-[27rem]"
            onClick={() => openOverlay(content)}
          />
        ))}
      </div>
      {project.credits && project.creditCategory && project.creditSource ? (
        <>
      <div className='flex flex-wrap gap-8 my-[2rem]'>
        <h2 className='text-xl'>Collaborators:</h2>
        <br/>
        {project.credits.map((name, index) => (
        <div key={index}>
          <a className='text-xl'>
            {project.creditCategory[index]}
          </a>
          <a className='text-xl'>: </a>
          <a className='text-xl text-pink underline font-bold' href={project.creditSource[index]}>
            {name}
          </a>
        </div>
        ))}
      </div>
        </>
      ) : null}
      
      <div>   
      {project.ThreeDModels && project.ThreeDAlbedos && project.ThreeDOpacitys ? (
        <div >
          <div className="relative">            
            <div className="gap-8 h-100 flex justify-center items-center">
              <button 
                className='top-[88vh] sm:top-[50vh] mr-[-1.5rem] sm:mr-0 left-0 m-4 w-[6rem] bg-opacity-60 h-[4rem] border-[1px] text-blueLIGHT border-solid border-pink mx-[4vw] my-[2rem] bg-midnight rounded-full' 
                onClick={() => navigateModel(-1)}
              >
                <h1 className='z-40 text-5xl mt-[-0.5rem]'>
                  &#8592;
                </h1>
              </button>
              {/* Wrap the ThreeDScene component with Suspense */}
              <Suspense fallback={<div>Loading 3D Scene...</div>}>
                <ThreeDScene 
                  key={displayedModel}
                  model={project.ThreeDModels[displayedModel]}
                  albedo={project.ThreeDAlbedos[displayedModel]}
                  opacity={project.ThreeDOpacitys[displayedModel]}
                  posX={project.modelProperties[displayedModel]?.posX || 0}
                  posY={project.modelProperties[displayedModel]?.posY || 0}
                  posZ={project.modelProperties[displayedModel]?.posZ || 0}
                  rotX={project.modelProperties[displayedModel]?.rotX || 0}
                  rotY={project.modelProperties[displayedModel]?.rotY || 0}
                  rotZ={project.modelProperties[displayedModel]?.rotZ || 0}
                  scale={project.modelProperties[displayedModel]?.scale || 1}
                  animSpeed={project.modelProperties[displayedModel]?.animSpeed || 1}
                  className="h-[20rem] w-fit"
                />
              </Suspense>
              <button 
                className='top-[88vh] sm:top-[50vh] ml-[-1.5rem] sm:ml-0 right-0 m-4 w-[6rem] bg-opacity-60 h-[4rem] border-[1px] text-blueLIGHT border-solid border-pink mx-[4vw] my-[2rem] bg-midnight rounded-full' 
                onClick={() => navigateModel(1)}
              >
                <h1 className='z-40 text-5xl mt-[-0.5rem]'>
                  &#8594;
                </h1>
              </button>
            </div>
          </div>
        </div>     
                
              ) : (
                <div></div>
              )}
          </div>
      </div>
    </div>
  );
};

export default DetailsProject;