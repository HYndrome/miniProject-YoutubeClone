export const localMiddleware = (req, res, next) => {
  // console.log(req.session);
  res.locals.siteName = "Wetube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  // console.log(res.locals);
  next();
};
