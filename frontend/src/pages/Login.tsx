import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login: React.FC = () => {
  const { register, login, user } = useUser();
  const navigate = useNavigate();

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupInput, setSignupInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const hasRedirected = useRef(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const changeInputHandler = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "signup" | "login"
  ) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
      setRegisterError(null);
    } else {
      setLoginInput({ ...loginInput, [name]: value });
      setLoginError(null);
    }
  };

  const handleAuth = async (type: "signup" | "login") => {
    if (type === "signup") {
      setIsLoadingRegister(true);
      setRegisterError(null);
      try {
        await register(signupInput);
        toast.success("Registration successful! You are now logged in.");
        navigate("/"); // force redirect after register
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          "Registration failed. Please try again.";
        setRegisterError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingRegister(false);
      }
    } else {
      setIsLoadingLogin(true);
      setLoginError(null);
      try {
        await login(loginInput);
        toast.success("Login successful!");
        navigate("/"); // redirect after login
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          "Login failed. Please check your credentials.";
        setLoginError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingLogin(false);
      }
    }
  };

  useEffect(() => {
    if (user && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <Tabs
        defaultValue="login"
        className="w-[400px] bg-gray-800 rounded-lg shadow-xl"
        onValueChange={() => {
          setLoginError(null);
          setRegisterError(null);
        }}
      >
        <TabsList className="grid w-full grid-cols-2 bg-gray-700 p-1 rounded-t-lg">
          <TabsTrigger
            value="signup"
            className="text-white data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md"
          >
            SignUp
          </TabsTrigger>
          <TabsTrigger
            value="login"
            className="text-white data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md"
          >
            Login
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signup" className="p-4">
          <Card className="border-none bg-transparent text-white">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl font-bold text-center text-green-400">
                SignUp
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Create a new account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="signup-name" className="text-gray-300">
                  Name
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  name="username"
                  value={signupInput.username}
                  placeholder="eg. John Doe"
                  required
                  onChange={(e) => changeInputHandler(e, "signup")}
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-md"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={signupInput.email}
                  placeholder="eg. john.doe@example.com"
                  required
                  onChange={(e) => changeInputHandler(e, "signup")}
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-md"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  name="password"
                  value={signupInput.password}
                  placeholder="********"
                  required
                  onChange={(e) => changeInputHandler(e, "signup")}
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-md"
                />
              </div>
              {registerError && (
                <p className="text-red-400 text-sm">{registerError}</p>
              )}
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                disabled={isLoadingRegister}
                onClick={() => handleAuth("signup")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md py-2 transition-colors flex items-center justify-center"
              >
                {isLoadingRegister ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please Wait
                  </>
                ) : (
                  "SignUp"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="login" className="p-4">
          <Card className="border-none bg-transparent text-white">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-3xl font-bold text-center text-green-400">
                Login
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="login-email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  value={loginInput.email}
                  placeholder="eg. john.doe@example.com"
                  required
                  onChange={(e) => changeInputHandler(e, "login")}
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-md"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginInput.password}
                  placeholder="********"
                  required
                  onChange={(e) => changeInputHandler(e, "login")}
                  className="bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-md"
                />
              </div>
              {loginError && (
                <p className="text-red-400 text-sm">{loginError}</p>
              )}
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                disabled={isLoadingLogin}
                onClick={() => handleAuth("login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md py-2 transition-colors flex items-center justify-center"
              >
                {isLoadingLogin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please Wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
