import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  // console.log(req.body);
  const { email, username, password, password2, name, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  // $or expression은 mongodb에 사용하는 or 연산자
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken",
    });
  }
  try {
    await User.create({
      email,
      username,
      password,
      name,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  // check if account exists
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  // const exists = await User.exists({ username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists!",
    });
  }
  // chcck if password correct
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password!",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseURL = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseURL}?${params}`;
  // 아래 구문 해석 fetch가 끝나면 json응답을 받는다
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  // console.log(json);
  // res.send(JSON.stringify(json));
  if ("access_token" in tokenRequest) {
    // access api
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    // console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(emailData);
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    console.log(emailObj);
    if (!emailObj) {
      // set notification
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : userData.login,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const pageTitle = "Edit Profile";
  const {
    session: {
      user: { _id, email, username },
    },
    body: {
      name: updatedName,
      email: updatedEmail,
      username: updatedUsername,
      location: updatedLocation,
    },
  } = req;

  // 1. Confirm profile change
  // req.session의 정보와 req.body.session의 정보가 차이가 있으면 변경 사항이 있는 것
  // 2. Compare existing data with changed profile
  // 변경된 정보가, req.body session의 정보가 db에 있는 정보면 이미 존재하는 정보임
  if (username !== updatedUsername) {
    const exists = await User.exists({ username: updatedUsername });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle,
        errorMessage: "This username is already taken",
      });
    }
  }
  if (email !== updatedEmail) {
    const exists = await User.exists({ email: updatedEmail });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle,
        errorMessage: "This email is already taken",
      });
    }
  }

  // const id = req.session.user.id
  // const { name, email, username, location } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      name: updatedName,
      email: updatedEmail,
      username: updatedUsername,
      location: updatedLocation,
    },
    { new: true }
  );
  // 1. session의 정보를 직접 변경해주기
  // req.session.user = {
  //   ...req.session.user,
  //   name,
  //   email,
  //   username,
  //   location,
  // };
  // 2. 업데이트된 user의 정보를 가져와서 session 업데이트하기
  // { new: true } 를 해줘야지 mongoose에서 update된 정보를 가져올 수 있음
  req.session.user = updatedUser;
  return res.redirect("edit");
};

export const see = (req, res) => res.send("See User");
