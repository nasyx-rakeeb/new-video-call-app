import Peer from "simple-peer";

const callUser = (id, stream, socket, me, name, videoRef) => {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
  });

  peer.on("signal", (data) => {
    socket.emit("callUser", {
      userToCall: id,
      signalData: data,
      from: me,
      name: name,
    });
  });

  peer.on("stream", (stream) => {
    videoRef.current.srcObject = stream;
  });
};

export default callUser;
