// components/Team.js
import React from 'react';
import './Team.css';

const teamMembers = [
  {
    name: "Dr. Emily Zhang",
    role: "Chief AI Scientist",
    expertise: "Machine Learning, Drug Discovery"
  },
  {
    name: "Dr. Michael Patel",
    role: "Medical Director",
    expertise: "Radiology, Clinical Applications"
  }
];

const Team = () => {
  return (
    <section className="team-section">
      <h2>Meet Our Team</h2>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card">
            <div className="avatar-placeholder"></div>
            <h3>{member.name}</h3>
            <p className="role">{member.role}</p>
            <p className="expertise">{member.expertise}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;