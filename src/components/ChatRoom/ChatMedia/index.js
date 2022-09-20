import classNames from "classnames/bind";
import styles from "./ChatMedia.module.scss";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppProvider";

import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const cx = classNames.bind(styles);

function ChatMedia() {
  const { selectedPhoto, selectedRoomMessages, isMobile } =
    useContext(AppContext);
  const navigate = useNavigate();

  const [nav1, setNav1] = useState();
  const [nav2, setNav2] = useState();
  // const [currentIndex, setCurrentIndex] = useState();

  const slider1Ref = useRef();
  const slider2Ref = useRef();

  useEffect(() => {
    setNav1(slider1Ref.current);
    setNav2(slider2Ref.current);

    if (!selectedRoomMessages) {
      navigate(-1);
    }
  }, [navigate, selectedRoomMessages]);

  const roomPhotos = useMemo(() => {
    let includePhoto = [];
    if (selectedRoomMessages) {
      includePhoto = selectedRoomMessages.map((message) => {
        let isPhotoURL;
        if (message.messagePhotoURL) {
          isPhotoURL = message.messagePhotoURL;
        }
        return isPhotoURL;
      });
    }

    return includePhoto.filter((photo) => photo !== undefined);
  }, [selectedRoomMessages]);

  useEffect(() => {
    const index = roomPhotos.indexOf(selectedPhoto);
    slider1Ref.current.slickGoTo(index);
  }, [roomPhotos, selectedPhoto]);

  // Setting
  const settingCarousel = {
    // nextArrow: <NextArrow />,
    // prevArrow: <PrevArrow />,
    slidesToShow: 1,
    infinite: false,
    slidesToScroll: 1,
  };

  const settingsSliderNav = {
    className: "slider variable-width",
    // dots: true,
    infinite: false,
    centerMode: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    focusOnSelect: true,
  };

  return (
    <div className={cx("wrapper", { isMobile: isMobile })}>
      <button
        onClick={() => {
          navigate(-1);
        }}
        className={cx("back-btn")}
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
      <div className={cx("main-slider")}>
        <Slider asNavFor={nav2} ref={slider1Ref} {...settingCarousel}>
          {roomPhotos.map((photoURL, index) => (
            <div key={index} className={cx("media-img-wrap")}>
              {photoURL && (
                <div className={cx("img-background")}>
                  <img className={cx("media-img")} src={photoURL} alt="" />{" "}
                </div>
              )}
            </div>
          ))}
        </Slider>
      </div>

      <div className={cx("nav-slider")}>
        <Slider asNavFor={nav1} ref={slider2Ref} {...settingsSliderNav}>
          {roomPhotos.map((photoURL, index) => (
            <div key={index} className={cx("media-img-wrap")}>
              {photoURL && (
                <div className={cx("img-background")}>
                  <img className={cx("media-img")} src={photoURL} alt="" />
                </div>
              )}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default ChatMedia;
