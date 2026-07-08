import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/connectionSlice";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connection`, {
        withCredentials: true,
      });

      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0) {
    return (
      <h1 className="text-3xl font-bold text-center mt-20">
        No Connections Found
      </h1>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-24 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        My Connections
      </h1>

      <div className="space-y-5">
        {connections.map((connection) => (
          <div
            key={connection._id}
            className="flex items-center gap-6 bg-base-300 p-5 rounded-xl shadow-md"
          >
            <img
              src={connection.photoUrl}
              alt={connection.firstName}
              className="w-24 h-24 rounded-full object-cover"
            />

            <div className="flex-1">
              <h2 className="text-2xl font-semibold">
                {connection.firstName} {connection.lastName}
              </h2>

              <p className="text-sm text-gray-400">
                {connection.age} Years • {connection.gender}
              </p>

              <p className="mt-2">{connection.about}</p>

              {connection.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {connection.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="badge badge-primary badge-outline"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Connections;