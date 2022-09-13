import classNames from "classnames/bind";
import styles from "./ChatWindow.module.scss";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faPaperPlane,
  faEllipsisVertical,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";

import { useContext, useState, useRef, useEffect, useMemo, memo } from "react";
import { AppContext } from "../../../Context/AppProvider";
import { AuthContext } from "../../../Context/AuthProvider";

import { addDocument } from "../../../firebase/service";
import useFirestore from "../../../hooks/useFirestore";

import Message from "../Message";
import InviteMemberModal from "../../Modals/InviteMemberModal";
import RoomControlsModal from "../../Modals/RoomControlsModal";

import messageSound from "../../../assets/sounds/message.wav";
import placeHolderImg from "../../../assets/images/user.png";

const cx = classNames.bind(styles);

function ChatWindow({ roomId }) {
  const {
    rooms,
    setSelectedRoomId,
    setIsInviteMemberVisible,
    isMobile,
    handleRoomMenuVisible,
  } = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  const { uid, displayName, photoURL } = useContext(AuthContext);

  const inputRef = useRef();
  const mesListRef = useRef();
  const LastMesListRef = useRef();

  // Hàm xử lý mở modal Invite Member
  const handleInviteMemberModal = () => {
    setIsInviteMemberVisible(true);
  };

  // ------ HANDLE SEND MESSAGE ------
  // Hàm xử lý input và gửi dữ liệu
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Xử lý scroll tin nhắn lên mỗi khi có tin nhắn mới
  useEffect(() => {
    if (mesListRef.current) {
      mesListRef.current.scrollTo({
        top: mesListRef.current.scrollHeight,
        left: 0,
        behavior: "instant",
      });
    }
  }, [currentMessage.id, roomId]);

  // useEffect(() => {
  //   if (LastMesListRef.current) {
  //     LastMesListRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //       inline: "nearest",
  //     });
  //   }
  // }, [currentMessage.id]);

  // Hàm xử lý sự kiện Submit gửi tin nhắn lên database
  const handleOnSubmit = () => {
    if (inputValue) {
      addDocument("messages", {
        text: inputValue,
        uid,
        photoURL,
        displayName,
        roomId: roomId,
      });
    }

    // Clear input and focus
    setInputValue("");
    inputRef.current.focus();
    // handleScroll();
  };

  const handleSendIcon = (value) => {
    if (value) {
      addDocument("messages", {
        text: value,
        uid,
        photoURL,
        displayName,
        roomId: roomId,
      });
    }

    // Clear input and focus
    setInputValue("");
    inputRef.current.focus();
    // handleScroll();
  };

  // Xử lý sự kiện nhấn nút Enter vào input
  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      handleOnSubmit();
    }
  };

  // HANDLE GET MESSAGES
  // Lấy message của phòng được selected
  const messagesCondition = useMemo(() => {
    // Kiểm tra xem tin nhắn có roomId
    // trùng với current roomId không
    return {
      fielName: "roomId",
      operator: "==",
      compareValue: roomId,
    };
  }, [roomId]);

  const messages = useFirestore("messages", messagesCondition);

  // Xử lý các tin nhắn liền kề cùng 1 người gửi
  const sideBySideMessages = useMemo(() => {
    let newMessages = [...messages];
    if (newMessages.length >= 3) {
      for (let i = 0; i < newMessages.length; i++) {
        if (i === 0) {
          console.log("inner messages 0000: ", newMessages[i].uid);
          if (newMessages[i].uid === newMessages[i + 1].uid) {
            newMessages[i].type = "first-message";
          } else newMessages[i].type = "default";
        } else if (i === newMessages.length - 1) {
          if (newMessages[i].uid === newMessages[i - 1].uid) {
            newMessages[i].type = "last-message";
          } else newMessages[i].type = "default";
        } else {
          if (
            newMessages[i].uid === newMessages[i + 1].uid &&
            newMessages[i].uid === newMessages[i - 1].uid
          ) {
            newMessages[i].type = "middle-message";
          } else if (newMessages[i].uid === newMessages[i + 1].uid) {
            newMessages[i].type = "first-message";
          } else if (newMessages[i].uid === newMessages[i - 1].uid) {
            newMessages[i].type = "last-message";
          } else {
            newMessages[i].type = "default";
          }
        }
      }
    } else if (newMessages.length === 2) {
      if (newMessages[0].uid === newMessages[1].uid) {
        newMessages[0].type = "first-message";
        newMessages[1].type = "last-message";
      } else {
        newMessages[0].type = "default";
        newMessages[1].type = "default";
      }
    } else {
      newMessages[0].type = "default";
    }
    return newMessages;
  }, [messages]);

  // Lấy ra phòng được selected
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId),
    [rooms, roomId]
  );

  // Phát âm báo mỗi lần có tin nhắn mới
  useEffect(() => {
    if (messages.length) {
      const messagesLength = messages.length;
      setCurrentMessage(messages[messagesLength - 1]);
    }
  }, [messages]);

  useEffect(() => {
    const audio = new Audio(messageSound);
    audio.volume = 0.5;
    audio.play();
  }, [currentMessage.id]);

  return (
    <>
      {selectedRoom && (
        <div className={cx("chat-window", { fixed: isMobile })}>
          {/*=========== Header ===========*/}
          <div className={cx("chat-window_header")}>
            {/* Room Name And Image */}
            <div className={cx("chat-window_header-info")}>
              {isMobile ? (
                <Link to={"/room-list"}>
                  <button
                    onClick={() => {
                      // Bỏ active room
                      setSelectedRoomId("");
                    }}
                    className={cx("back-btn")}
                  >
                    <FontAwesomeIcon icon={faAngleLeft} />
                  </button>
                </Link>
              ) : (
                false
              )}

              <img
                src={selectedRoom.photoURL || placeHolderImg}
                alt=""
                className={cx("chat-window_header-img")}
              />
              <div className={cx("chat-window_header-name-wrap")}>
                <h4 className={cx("chat-window_header-name")}>
                  {selectedRoom.name}
                </h4>
                <p className={cx("chat-desc")}>Đang hoạt động</p>
              </div>
            </div>

            {/* Invite Members And Room Controls */}
            <div className={cx("chat-window_header-users")}>
              <i
                onClick={handleInviteMemberModal}
                className={cx("header-user_icon", "icon-small")}
              >
                <FontAwesomeIcon icon={faCirclePlus} />
              </i>

              {/* Invite Members Modal */}
              <InviteMemberModal />

              {/* Room Controls Modal */}
              <RoomControlsModal>
                <i
                  onClick={handleRoomMenuVisible}
                  className={cx("header-user_icon")}
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </i>
              </RoomControlsModal>
            </div>
          </div>

          {/*=========== Message List ===========*/}

          <div ref={mesListRef} className={cx("message-list")}>
            {sideBySideMessages.map((message) => (
              <Message
                key={message.id}
                content={message.text}
                displayName={message.displayName}
                createAt={message.createAt}
                photoURL={message.photoURL}
                userId={message.uid}
                type={message.type}
              />
            ))}

            <span ref={LastMesListRef}></span>
          </div>

          {/*=========== Message Form ===========*/}
          <div className={cx("message-form")}>
            <input
              className={cx("message-form_input")}
              type="text"
              placeholder="Aa"
              spellCheck="false"
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp}
            />

            <div className={cx("button-wrap")}>
              {inputValue.trim() ? (
                <button
                  onClick={handleOnSubmit}
                  className={cx("message-form_btn", "btn", "rounded")}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSendIcon("😂");
                  }}
                  className={cx("message-form_btn", "btn", "rounded")}
                >
                  😂
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(ChatWindow);
