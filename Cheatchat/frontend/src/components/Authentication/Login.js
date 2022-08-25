
import { Button} from "@chakra-ui/button";
import { FormControl, FormLabel} from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/react";
import React, { useState} from "react";
import axios from "axios";
import { useHistory } from "react-router";
import { useToast } from "@chakra-ui/toast";

 const Login = () => {
     const [show, setShow] = useState(false)
     const[email,setEmail] = useState();
     const[password,setPassword] = useState(); 
     const[loading, setLoading] = useState(false);

     const toast = useToast();
     const history = useHistory();

     const handleClick = () => setShow(!show);

     const submitHandler = async() => {
          setLoading(true);
          if(!email || !password) {
              toast ({
                title: "Please Fill all the Fields",
                status: "Warning",
                duration: 5000,
                isClosable: true,
                 position: "bottom",
              });
              setLoading(false);
              return;
          } 
          console.log(email,password);
          try{
             const config = {
                 headers: {
                    "content-type": "application/json",
                 },
             };
             const { data } = await axios.post(
                "/api/user/login", 
                {
                  email, 
                  password
                },
                config
             );
             console.log(JSON.stringify(data));
             toast({
                 title: "Login Successful",
                 status: "success",
                 duration: 5000,
                 isClosable: true,
                 position: "bottom", 
             });
             localStorage.setItem("userInfo",JSON.stringify(data));
             setLoading(false);
             history.push("/chat");
          } catch (error) {
             toast({
                title: "Error Occured",
                description: error.response.data.message,
                status: "error", 
                duration: 5000,
                isClosable: true,
                position: "bottom", 
             });
          }
     };
   return (
  <VStack spacing='5px'>
       
       <FormControl id="email" isRequired>
           <FormLabel>Email</FormLabel>
          <Input 
           placeholder="Enter Your Email"
           onChange={(e)=>setEmail(e.target.value)}
           />

       </FormControl> 
       <FormControl id="password" isRequired>
           <FormLabel>Password</FormLabel>
           <InputGroup>  
           <Input 
           type={ show ? "text" : "password"}
           placeholder="Enter Your Password"
           onChange={(e)=>setPassword(e.target.value)}
           /> 
           <InputRightElement width="4.5rem">
               <Button h="1.75rem" size="sm" onClick={handleClick}>
                   {show ? "Hide" : "show"}                 
               </Button> 
               </InputRightElement>
               </InputGroup>
       </FormControl>
        <Button  
          colorScheme="red"
          width="100%"
          style={{ marginTop: 15}}
          onClick={submitHandler}
        > Login
        </Button>
        <Button 
         varient="solid"
         colorScheme="blue"
         width="100%"
         onClick={() => { 
           setEmail("guest@example.com");
           setPassword("12341234");
         }}
         > 
          Get Guest User Credentials
          </Button>

          </VStack>
  );
  
}

export default Login