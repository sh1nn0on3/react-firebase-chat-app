import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import Logo from "../../assets/images/logo-full.png";
import Google from "../../assets/images/brands/google.png";
import Facebook from "../../assets/images/brands/facebook.png";

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { addDocument } from "../../firebase/service";
import { useContext } from "react";
import { AppContext } from "../../Context/AppProvider";
import { serverTimestamp } from "firebase/firestore";

const cx = classNames.bind(styles);

function Login() {
  const fbProvider = new FacebookAuthProvider(); //OK
  const googleProvider = new GoogleAuthProvider();

  const { isDesktop, isMobile } = useContext(AppContext);

  // Login with Facebook
  const handleFblogin = () => {
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        // The signed-in user info.
        const { user, _tokenResponse } = result;

        // If new user then write data to firestore
        if (_tokenResponse.isNewUser) {
          console.log("New User!");

          addDocument("users", {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            fullPath: "",
            uid: user.uid,
            providerId: _tokenResponse.providerId,
          });
        }

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        // const credential = FacebookAuthProvider.credentialFromResult(result);
        // const accessToken = credential.accessToken;
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);
        // ...
        console.error({ errorCode, errorMessage, email, credential });

        signOut(auth)
          .then(() => {
            console.log("Sign out successful");
          })
          .catch((error) => {
            console.error(error);
          });
      });
  };

  // Login with Google
  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const { user, _tokenResponse } = result;

        // If new user then write data to firestore
        if (_tokenResponse.isNewUser) {
          console.log("New User!");

          addDocument("users", {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            fullPath: "",
            uid: user.uid,
            providerId: _tokenResponse.providerId,
            stickers: [],
            active: serverTimestamp(),
          });
        }

        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.error({ errorCode, errorMessage, email, credential });

        signOut(auth)
          .then(() => {
            console.log("Sign out successful");
          })
          .catch((error) => {
            console.error(error);
          });
      });
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("login")}>
        {/* Login container */}
        <div className={cx("login_container", { isMobile: isMobile })}>
          {/* Header */}
          <div className={cx("login_header")}>
            <div className={cx("login_logo-wrapper")}>
              <img className={cx("login_logo")} src={Logo} alt="" />
            </div>
            <h1 className={cx("login_title")}>Đăng nhập vào Satellite</h1>
          </div>

          {/* Provider */}
          <ul className={cx("login_provider")}>
            <li
              onClick={handleGoogleLogin}
              className={cx("login_provider-item")}
            >
              <img
                className={cx("login_provider-item-img")}
                src={Google}
                alt=""
              />
            </li>
            <li onClick={handleFblogin} className={cx("login_provider-item")}>
              <img
                className={cx("login_provider-item-img")}
                src={Facebook}
                alt=""
              />
            </li>
          </ul>

          {/* Login with password */}
          <div className={cx("login_with-password")}>
            <p className={cx("login_description")}>
              Hoặc đăng nhập với email và mật khẩu của bạn:
            </p>
            <div className={cx("login_input-wrapper")}>
              <input
                className={cx("login_input")}
                type="text"
                placeholder="Email của bạn"
              />
              <input
                className={cx("login_input")}
                type="password"
                name=""
                id=""
                placeholder="Mật khẩu"
              />
            </div>
          </div>

          {/* Terms */}
          <p className={cx("login_terms")}>
            Việc bạn tiếp tục sử dụng trang web này đồng nghĩa bạn đồng ý với{" "}
            <span className={cx("text-highlight")}>Điều khoản sử dụng</span> của
            chúng tôi.
          </p>

          {/* Controls */}
          <div className={cx("login_controls")}>
            <button className={cx("login_controls-btn", " btn", "primary")}>
              Đăng nhập
            </button>
            <button className={cx("login_controls-btn", " btn", "border")}>
              Đăng ký
            </button>
          </div>
        </div>

        {/* Background image */}
        {isDesktop && (
          <div className={cx("login_cool-img-wrapper")}>
            <div className={cx("login_cool-img")}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
