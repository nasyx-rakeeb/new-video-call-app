import React, { useState, useRef, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import c from "./Video.module.css";
import Peer from "simple-peer";

const Video = () => {
  const [userId, setUserId] = useState();
  const [reciever, setReciever] = useState();
  const [stream, setStream] = useState();
  const [calling, setCalling] = useState(false);
  const myVideo = useRef();
  const incommingVideo = useRef();

  const socket = useMemo(() => {
    // https://chatroultte.herokuapp.com
    return io("https://chatroultte.herokuapp.com", {
      withCredentials: true,
      extraHeaders: {
        "my-custom-header": "abcd",
      },
    });
  }, []);

  const peer1 = new Peer({
    initiator: true,
    trickle: false,
    stream: stream,
  });
  const peer2 = new Peer({
    initiator: true,
    trickle: false,
    stream: stream,
  });

  useEffect(() => {
    window.addEventListener("beforeunload", function (event) {
      socket.emit("unload", userId);
    });
    socket.on("me", (userId) => {
      setUserId(userId);
    });
  }, [socket, userId]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setStream(stream);
        incommingVideo.current.srcObject = stream;
        incommingVideo.current.addEventListener("loadedmetadata", () => {
          incommingVideo.current.play();
          incommingVideo.current.muted = true;
        });
      });
  }, []);

  socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  socket.on("user-connected", (userId) => {
    console.log(userId);
  });

  // socket.on("found-one", (userId) => {
  //   setReciever(userId);
  // });

  const callUser = (id) => {
    setCalling(true);

    peer1.on("signal", (data) => {
      peer2.signal(data);
    });

    peer2.on("signal", (data) => {
      peer1.signal(data);
    });
    peer2.on("stream", (stream) => {
      incommingVideo.current.srcObject = stream;
    });
  };

  const answerCall = () => {
    setCalling(true);

    peer1.on("signal", (data) => {
      peer2.signal(data);
    });

    peer2.on("signal", (data) => {
      peer1.signal(data);
    });
    peer1.on("stream", (stream) => {
      incommingVideo.current.srcObject = stream;
    });
  };

  socket.on("make-call", (userId) => {
    console.log("made call", userId);
    callUser(userId);
    myVideo.current.srcObject = stream;
    myVideo.current.addEventListener("loadedmetadata", () => {
      myVideo.current.play();
      myVideo.current.muted = true;
    });
  });

  socket.on("answer-call", (userId) => {
    console.log("recieve call", userId);

    setReciever(userId);
    answerCall(userId);
    myVideo.current.srcObject = stream;
    myVideo.current.addEventListener("loadedmetadata", () => {
      myVideo.current.play();
      myVideo.current.muted = true;
    });
  });
  socket.on("error", (err) => {
    console.log(err);
  });

  const handleSearch = () => {
    socket.emit("find-someone", userId);
  };
  return (
    <>
      <div className={c.container}>
        <video ref={incommingVideo} className={c.video} />
        <video ref={myVideo} className={c.video2} />

        <button onClick={handleSearch} className={c.button}>
          {calling ? "swipe" : "search"}
        </button>
      </div>
      {/* <input type="text" ref={textRef} /> */}
    </>
  );
};

export default Video;
