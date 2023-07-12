import multer from "multer";

export const localMiddleware = (req, res, next) => {
  res.locals.siteName = "Wetube";
  // req.session에 저장된 정보를 pug가 읽을 수 있는 req.locals로 옮겨주는 과정
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  // console.log(res.locals);
  // console.log(req.session);
  next();
};

export const protectorMiddleware = (req, res, next) => {
  // 로그인 되지 않은 유저에 대한 처리
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  // 로그인 되어 있는 유저에 대한 처리
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limit: {
    fileSize: 3000000,
  },
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limit: {
    fileSize: 20000000,
  },
});
