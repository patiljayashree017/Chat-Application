import { useDisclosure } from "@chakra-ui/hooks";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, useToast, Input, Box} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { FormControl} from "@chakra-ui/form-control";
import axios from "axios";
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgdeItem from '../UserAvatar/UserBadgeItem';

    const GroupChatModel = ({ children}) => {
     
    const { isOpen, onOpen, onClose } = useDisclosure();
    const[groupChatName,setGroupChatName] =useState();
    const[selectedUsers,setSelectedUsers] = useState([]);
    const[search, setSearch] = useState([]);
    const[searchResult,setSearchResult] = useState([]);
    const[loading, setLoading] = useState([false]);
    
         const toast = useToast();

         const { user, chats, setChats } = ChatState();

         

         const handleSearch = async (query) => {
           setSearch(query);
           if(!query) {
             return;
           }
          try {
                setLoading(true); 

                const config = {
                  headers: {
                    Authorization: `Bearer ${user.token}`,
                  },
                }; 
                const { data} = await axios.get(`/api/user?search=${search}`,config);
                
                setLoading(false);
                setSearchResult(data);
          } catch (error) { 
                   toast({
                     title: "Error Occured!",
                     description: "Failed to load the search results!",
                     status: "error", 
                     duration: 5000,
                     isCLosable: true,
                     position: "bottom-left",
                  });
                      
          } 
        };

              const handleSubmit = async() => {
        if (!groupChatName || !selectedUsers) {
          toast ({
            title: "Please fill all fields",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top"
          });
          return;
        }
        try{
          const config ={
            headers: {
              
              Authorization: `Bearer ${user.token}`,
            },
          };

          const { data } = await axios.post(
            "/api/chat/group",
            {
              name: groupChatName,
              users: JSON.stringify(selectedUsers.map((user)=> user._id)),
            },
            config
          ); 
           setChats([data, ...chats]);
           onClose();
           toast ({
            title: "New Group Chat Created!",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom"
          });


        } catch (error) {
          toast ({
            title: "Failed to Create the Chat!",
            description: error.response.data,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom"
          });

        }
      };
      
        const handleDelete = (delUser)=>{
            setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
        };
        const handleGroup = (userToAdd) => {
            if(selectedUsers.includes(userToAdd)) {
              toast({
                 title: "User already added",
                 status: "warning",
                 duration: 5000,
                 isClosable: true,
                 position: "top",
              });
            }  
              setSelectedUsers([...selectedUsers, userToAdd]);
        };
  
    return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader 
            fontSize="35"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
            >Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody
              d="flex"
              flexDir="column"
              alignItems="center">
               <FormControl>
                 <Input placeholder="Chat Name" mb={3}
                  onChange={(e) => setGroupChatName(e.target.value)}/>
               </FormControl> 
                  <FormControl>
                   <Input 
                   placeholder="Add Users"
                   mb={1}
                   onChange={(e) => handleSearch(e.target.value)}
                  /> 
                   </FormControl>
                   <Box  w="100%" d="flex" flexWrap="wrap">
                    {selectedUsers.map(u => (
                        <UserBadgdeItem key={user._id} user={u}
                         handleFunction={()=>handleDelete(u)}
                         />
                    ))}
                              {loading ? <div>Loading</div> : (
                                   searchResult?.slice(0,4)
                                   .map((user) => <UserListItem
                                    key={user._id} 
                                    user={user} 
                                    handleFunction={() => handleGroup(user)}
                                    />
                               ) )
                              }
                              </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={()=>handleSubmit()}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModel;