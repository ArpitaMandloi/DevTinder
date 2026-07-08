import React from "react";

const UserCard = ({ user }) => {
  if (!user) return null;

  const { firstName, lastName, photoUrl, age, gender, about } = user;

  return (
    <div className="card w-80 bg-base-300 shadow-xl rounded-2xl">
      <figure>
        <img
          src={
            photoUrl ||
            "https://via.placeholder.com/320x350?text=No+Image"
          }
          alt={firstName}
          className="h-80 w-full object-cover"
        />
      </figure>

      <div className="card-body p-5">
        <h2 className="card-title text-xl font-bold">
          {firstName} {lastName}
        </h2>

        <p className="text-sm opacity-70">
          {age} Years • {gender}
        </p>

        <p className="text-sm mt-2 break-words">
          {about}
        </p>

        <div className="card-actions justify-between mt-5">
          <button className="btn btn-outline btn-error w-[48%]">
            Ignore
          </button>

          <button className="btn btn-success w-[48%]">
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;