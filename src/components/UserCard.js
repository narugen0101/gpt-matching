import React from "react";

export const calculateAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const UserCard = ({ user, onClick, className }) => {
  const age = calculateAge(user.birthdate);
  return (
    <div className={`card card-compact w-96 bg-base-100 shadow-xl ${className}`} onClick={onClick}>
      <figure className="h-48 overflow-hidden">
        <img src={user.photo1} alt="User" className="w-full h-full object-cover" />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{user.name}</h2>
        <p>{age}歳</p>
      </div>
    </div>
  );
};

export default UserCard;
