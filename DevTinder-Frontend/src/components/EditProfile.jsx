import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import UserCard from "./UserCard";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [about, setAbout] = useState(user?.about || "");
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  const saveProfile = async () => {
    try {
      setError("");

      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
        },
        {
          withCredentials: true,
        }
      );

      // Update Redux Store
      dispatch(addUser(res.data.data));

      alert("Profile Updated Successfully!");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center py-10 px-6">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        
        {/* Edit Profile Form */}
        <div className="card w-96 bg-base-300 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl">
              Edit Profile
            </h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text">Photo URL</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text">Age</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text">Gender</span>
              </label>
              <select
                className="select select-bordered"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-control mt-3">
              <label className="label">
                <span className="label-text">About</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                rows="3"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-center mt-3">{error}</p>
            )}

            <button
              className="btn btn-primary mt-5"
              onClick={saveProfile}
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <UserCard
          user={{
            firstName,
            lastName,
            photoUrl,
            age,
            gender,
            about,
          }}
        />
      </div>
    </div>
  );
};

export default EditProfile;