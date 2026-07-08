import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests, removeRequest } from "../utils/requestSlice";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);
  const [loading, setLoading] = useState(true);

  const reviewRequest = async (status, requestId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        {
          withCredentials: true,
        }
      );

      // Remove request from Redux after successful review
      dispatch(removeRequest(requestId));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user/requests/received`,
        {
          withCredentials: true,
        }
      );

      dispatch(addRequests(res.data.data));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <h1 className="text-3xl font-bold text-center mt-20">
        Loading...
      </h1>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <h1 className="text-3xl font-bold text-center mt-20">
        No Requests Found
      </h1>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-24 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Connection Requests
      </h1>

      <div className="space-y-5">
        {requests.map((request) => {
          const user = request.fromUserId;

          if (!user) return null;

          return (
            <div
              key={request._id}
              className="flex items-center gap-6 bg-base-300 p-5 rounded-xl shadow-md"
            >
              <img
                src={
                  user.photoUrl ||
                  "https://via.placeholder.com/100"
                }
                alt={user.firstName}
                className="w-24 h-24 rounded-full object-cover"
              />

              <div className="flex-1">
                <h2 className="text-2xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>

                <p className="text-sm text-gray-400">
                  {user.age || "N/A"} Years • {user.gender || "N/A"}
                </p>

                <p className="mt-2">
                  {user.about || "No bio available"}
                </p>

                {user.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {user.skills.map((skill, index) => (
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

              <div className="flex flex-col gap-2">
                <button
                  className="btn btn-success"
                  onClick={() =>
                    reviewRequest("accepted", request._id)
                  }
                >
                  Accept
                </button>

                <button
                  className="btn btn-error"
                  onClick={() =>
                    reviewRequest("rejected", request._id)
                  }
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;