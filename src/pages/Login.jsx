import React, { useState } from 'react';
import projectsData from '../data/projects';
import '../index.css';
import { Link } from 'react-router-dom';

const Login = () => {
  const [selectedTag, setSelectedTag] = useState('All'); // Initial tag is 'all'

  const filteredProjects = selectedTag === 'All' 
    ? projectsData 
    : projectsData.filter((project) => project.tags.includes(selectedTag));

  const tags = ['All', 'UI Art', '3D Animation', 'Illustration', '3D Modeling', 'Game Development', 'UX', 'Web Development'];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to My Portfolio</h1>
      <div className="mb-4">
        {/* Display filter buttons */}
        {tags.map((tag) => (
          <button
            key={tag}
            className={`mr-4 px-4 py-2 rounded-full ${selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
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
              <p className="text-gray-700 mb-4">{project.description}</p>
              <img src={project.imageURL} alt={project.title} className="w-full h-48 object-cover mb-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Login;