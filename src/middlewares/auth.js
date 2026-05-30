const adminAuth = (req, res, next) => {
  console.log("admin is getting checked!");
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.status(401).send("unauthorized request");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  console.log("admin is getting checked!");
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.status(401).send("unauthorized request");
  } else {
    next();
  }
};
module.exports = {
  adminAuth,
  userAuth,
};
