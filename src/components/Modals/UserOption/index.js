import classNames from "classnames/bind";
import styles from "./UserOption.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCheck,
  faCircle,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useEffect, useRef, useState } from "react";

import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFile } from "../../../firebase/service";
import { auth, db } from "../../../firebase/config";

import { AppContext } from "../../../Context/AppProvider";
import Modal from "../Modal";

const cx = classNames.bind(styles);

function UserOption({ visible = false, setVisible }) {
  const [isShowInput, setIsShowInput] = useState(false);
  const [nameInputValue, setNameInputValue] = useState("");
  const { currentUser, setAlertVisible, setAlertContent } =
    useContext(AppContext);

  const inputImageRef = useRef();
  const nameInputRef = useRef();

  // Xử lý Sign Out
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleChangeUserAvatar = (e) => {
    const uploadPhoto = e.target.files[0];

    if (uploadPhoto) {
      // if (currentUser.fullPath !== "") {
      //   deleteFile(currentUser.fullPath);
      // }

      if (uploadPhoto.size <= 3000000) {
        uploadFile(
          uploadPhoto,
          `images/users-avatar/${currentUser.uid}`,
          (url, fullPath) => {
            // Update current user image
            const userRef = doc(db, "users", currentUser.id);
            updateDoc(userRef, {
              photoURL: url,
              fullPath: fullPath,
            });
          }
        );
      } else {
        setAlertVisible(true);
        setAlertContent({
          title: "Không tải tệp lên được",
          description:
            "File bạn đã chọn quá lớn. Kích thước ảnh đại diện tối đa là 3MB.",
        });
      }
    }

    // Đóng modal và xóa input
    inputImageRef.current.value = "";
  };

  const handleChangeUserName = () => {
    if (nameInputValue.trim() && nameInputValue !== currentUser.displayName) {
      const userRef = doc(db, "users", currentUser.id);
      updateDoc(userRef, {
        displayName: nameInputValue.trim(),
      });

      setNameInputValue("");
      setIsShowInput(false);
    }
    setIsShowInput(false);
  };

  const handleOnKeyDown = (e) => {
    if (e.key === "Enter") {
      handleChangeUserName();
    }
  };

  useEffect(() => {
    // Before change user name
    if (currentUser) {
      setNameInputValue(currentUser.displayName);
    }

    // Focus when click
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isShowInput, currentUser]);

  return (
    <Modal
      onCancel={() => {
        setVisible(false);
        setIsShowInput(false);
        setNameInputValue("");
      }}
      title="Tùy chọn"
      okButton={false}
      visible={visible}
    >
      <div className={cx("wrapper")}>
        <div className={cx("section", "no-boder")}>
          <h2 className={cx("section-name")}>Tài khoản</h2>
          <ul className={cx("option-list")}>
            <li className={cx("option-item")}>
              <input
                ref={inputImageRef}
                onChange={handleChangeUserAvatar}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                accept="image/*"
                type="file"
                style={{ display: "none" }}
                name=""
                id=""
              />
              {currentUser && (
                <>
                  <img
                    onClick={(e) => {
                      e.stopPropagation();
                      inputImageRef.current.click();
                    }}
                    className={cx("user-img")}
                    src={currentUser.photoURL}
                    title="Chọn ảnh đại diện"
                    alt=""
                  />
                  {isShowInput ? (
                    <div
                      onClick={() => {
                        nameInputRef.current.focus();
                      }}
                      className={cx("user-name-input-wrap")}
                    >
                      <div className={cx("user-name-input-container")}>
                        <p className={cx("user-name-input-tile")}>
                          Nhập tên mới
                        </p>
                        <input
                          ref={nameInputRef}
                          onChange={(e) => {
                            setNameInputValue(e.target.value);
                          }}
                          onKeyDown={handleOnKeyDown}
                          value={
                            nameInputValue.length <= 100 ? nameInputValue : ""
                          }
                          className={cx("user-name-input")}
                          type="text"
                        />
                      </div>
                      <span className={cx("name-input-count")}>
                        {nameInputValue.length}/100
                      </span>
                    </div>
                  ) : (
                    <h3
                      onClick={() => {
                        setIsShowInput(true);
                      }}
                      className={cx("user-name")}
                    >
                      {currentUser.displayName}
                      <span className={cx("user-name-label")}>
                        Sửa tên và ảnh đại diện
                      </span>
                    </h3>
                  )}
                </>
              )}

              {isShowInput ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeUserName();
                  }}
                  className={cx("submit-btn", "option-icon")}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsShowInput(true);
                  }}
                  className={cx("submit-btn", "option-icon")}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              )}
            </li>
          </ul>
        </div>

        <div className={cx("section")}>
          <ul className={cx("option-list")}>
            <li className={cx("option-item")}>
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faCircle} />
              </span>
              <h4 className={cx("option-name")}>
                Trạng thái hoạt động: ĐANG BẬT
              </h4>
            </li>
          </ul>
        </div>

        <div className={cx("section")}>
          <ul className={cx("option-list")}>
            <li
              onClick={() => {
                handleSignOut();
              }}
              className={cx("option-item")}
            >
              <span className={cx("option-icon")}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </span>
              <h4 className={cx("option-name")}>Đăng xuất</h4>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default UserOption;
