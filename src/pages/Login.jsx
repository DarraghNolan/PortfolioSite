import React, { useState, useEffect } from 'react';
import projectsData from '../data/projects';
import '../index.css';
import { Link } from 'react-router-dom';
import ThreeDScene from './ThreeDScene';

const Login = () => {
  const [selectedTag, setSelectedTag] = useState('All'); // Initial tag is 'all'
  const [featuredProject, setFeaturedProject] = useState(null);

  useEffect(() => {
    // Fetch the project you want to feature (replace 'projectId' with the actual project ID)
    const projectId = 8; // Replace with the actual project ID
    const project = projectsData.find((proj) => proj.id === projectId);
    setFeaturedProject(project);
  }, []);

  const filteredProjects = selectedTag === 'All' 
    ? projectsData 
    : projectsData.filter((project) => project.tags.includes(selectedTag));

  const tags = ['All', 'UI Art', 'Web Development', 'UX', 'Game Development', '3D Modeling', 'Illustration', '3D Animation'];

  return (
    <div className="bg-midnight">
      <div className="container mx-auto p-8 bg-midnight text-white2">
        <h1 className="text-6xl font-bold lg:mb-[5rem] mb-[6rem] lg:ml-5rem">
          Darragh Nolan
        </h1>
        <div className='ml-[65vw]'>
          {featuredProject && (
            <ThreeDScene
              key={featuredProject.id}
              model={featuredProject.ThreeDModels[0]}
              albedo={featuredProject.ThreeDAlbedos[0]}
            />
          )}
        </div>
        <div className="mb-4 flex-auto content-center">
          {/* Display filter buttons */}
          {tags.map((tag) => (
            <button
              key={tag}
              className={`mr-4 px-4 py-2 mb-2 rounded-full ${selectedTag === tag ? 'bg-blue-500 text-white2' : 'bg-white2 text-white3'}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/detailsproject/${project.id}`}>
              <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                <h2 className="text-xl font-semibold mb-4">{project.title}</h2>
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