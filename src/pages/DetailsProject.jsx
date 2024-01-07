import React, { useEffect, useState } from 'react';
import projectsData from '../data/projects';
import '../index.css';

const DetailsProject = () => {
  const projectId = location.pathname.split("/")[2];
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      // Find the project with the matching id
      const selectedProject = projectsData.find(proj => proj.id === parseInt(projectId, 10));

      // Set the found project to the state
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

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
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
        className="lg:w-6/12 h-6/12 w-full h-4/12 my-4"
    />
  ) : (
    <img src={project.imageURL} alt={project.title} className="lg:w-6/12 h-6/12 w-full h-4/12 my-4" />
  )}

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {project.contentURL.map((content, index) => (
      <img key={index} src={content} alt={`Project ${index + 2}`} className="my-4 w-full" />
    ))}
  </div>
      {/* Add more project details as needed */}
    </div>
  );
};

export default DetailsProject;