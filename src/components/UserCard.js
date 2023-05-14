import React from "react";

const UserCard = ({ user, onClick }) => {
  return (
    <div className="card w-3/10 bg-primary text-primary-content" onClick={onClick}>
      <div className="card-body w-3/10">
        <img src={user.photo1} alt="Profile" className="w-full max-w-card-img max-h-card-img" />
        <h2 className="card-title">{user.name}</h2>
        <p>{user.age} years old</p>
        <div className="card-actions justify-end"></div>
      </div>
    </div>
  );
};

export default UserCard;
