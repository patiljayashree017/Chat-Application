import {
  Box,
  Text,
  IconButton,
  Spinner,
  FormControl,
  Input,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect} from "react";
import { ChatState } from "./Context/ChatProvider";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogic";
import ProfileModel from "./miscellaneous/ProfileModel";
import UpdateGroupChatModel from "./miscellaneous/UpdateGroupChatModel";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from 'socket.io-client';
import Lottie from 'react-lottie';
import animationData from "../animation/typing.json";

const ENDPOINT =  "https://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMeassge, setNewMessage] = useState(); 
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing,setTyping] = useState(false); 
  const [isTyping, setIsTyping] = useState(false);
  

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { 
       preserveAspectRatio: "xMidYMid slice",
    },
  };
  const toast = useToast();
  const { user, selectedChat, setSelectedChat } = ChatState();

  const fetchMessage = async () => {
        if(!selectedChat) return;
        try {
           const config = {
             headers: {
               Authorization: `Bearer ${user.token}`,
             },
           }; 
              setLoading(true);
           
                const {data} = await axios.get(`/api/message/${selectedChat._id}`,
                config 
                );
                  console.log(message);
                 setMessage(data);
                 setLoading(false);


                 socket.emit("join chat", selectedChat._id);
         }      catch (error) {
                toast({
                  title: "Error Occured!", 
                  description: "Failed to Load the Message", 
                  status: "error", 
                  duration: 5000, 
                  isClosable: true,
                  position: "bottom"
                });
        }
  }; 
        
     useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup",user);
        socket.on("connected",() => setSocketConnected(true));
        socket.on('typing',()=>setTyping(true));
        socket.on('stop typing',()=>setTyping(false));
     }, []);
     
     useEffect(() => {
         fetchMessage();

          selectedChatCompare = selectedChat;
     }, [selectedChat]);
     
         
      useEffect(() => {
           socket.on("message recieved", (newMessageRecieved) => {
              if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecived.chat._id){
                 // give notification
                  if(!notification.includes(newMessageRecieved)) {
                     setNotification([newMessageRecieved,...notification]);
                     setFetchAgain(!fetchAgain);
                  }
              } else {
                 setMessage([...message, newMessageRecieved]);
                }
           });
      });

  const sendMessage = async(event) => {
    console.log("sendmsg")
    if(event.key === "Enter" && newMeassge) { 
       socket.emit('stop typing',selectedChat._id);
        try{
            const config = {
              headers: {
                "Content-Type": "application/json",
                 Authorization: `Bearer ${user.token}`,
              },
            };
               setNewMessage("");
               const {data}= await axios.post
               (`/api/message`, 
                {
                 content: newMeassge,
                 chatId: selectedChat._id,
               },
                config
                );

                    socket.emit("new message", data);
                   setMessage([...message, data]);
                   }     catch(error) {
                     toast({
                         title: "Error Occured!",
                         description: "Failed to send message",
                         status: "Error",
                         duration: 5000,
                         isClosable: true,
                         position: "bottom",
                     });
                   }
    }
  }; 

      useEffect(() => {
          socket = io(ENDPOINT);
          socket.emit("setup", user);
          socket.on("connection",()=> setSocketConnected(true));
      }, []);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    //Typing Indicator Logic 
     if (!socketConnected) return;

     if(!typing) {
       setTyping(true)
       socket.emit("typing", selectedChat._id);
     } 
      let lastTypingTime = new Date().getTime()
      var  timerLength = 3000;

      setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;

        if (timeDiff >= timerLength && typing) {
          socket.emit("stop typing", selectedChat._id);
          setTyping(false);
        } 
      }, timerLength);
      };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            width="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModel user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                {
                  <UpdateGroupChatModel
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessage={fetch}
                  />
                }
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat message={message}/>
                </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              isRequired
              mt={3}>
            {isTyping?<div>
              <Lottie 
              options={defaultOptions}
              width={70}
              style={{ marginBottom: 15, marginLeft: 0}}
              />
            </div>: <></>}
              <Input
                 variant="filled"
                 bg="#E0E0E0"
                 placeholder="Enter a message.."
                 onChange={typingHandler}
                 value={newMeassge} 
                 />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="felx"
          alignItems="center"
          justifyContent="center"
          hight="100%"
        >
          <Text fontSize="3xl" pb={3} fontSize="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
