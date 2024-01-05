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
      <img src={project.imageURL} alt={project.title} className="my-4" />
      {/* Add more project details as needed */}
    </div>
  );
};

export default DetailsProject;