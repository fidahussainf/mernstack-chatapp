import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import AuthForm from "./AuthForm";
import GradientBackground from "../UI/GradientBackground";
import { useAuth } from "../../hooks/useAuth";

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginFields: any[] = [
    {
      name: "email",
      label: "Email Address",
      icon: <UserOutlined className="text-white/70" />,
      type: "email",
      placeholder: "your@email.com",
      autoComplete: "email",
      rules: [
        { required: true, message: "Please enter your email address" },
        { type: "email", message: "Please enter a valid email address" },
      ],
    },
    {
      name: "password",
      label: "Password",
      icon: <LockOutlined className="text-white/70" />,
      type: "password",
      placeholder: "Enter your password",
      autoComplete: "current-password",
      rules: [
        { required: true, message: "Please enter your password" },
        { min: 6, message: "Password must be at least 6 characters" },
      ],
    },
  ];

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await login(values);
      toast.success("Welcome back! 🎉");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      const err = error as any;
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const footerLink = (
    <Link
      to="/register"
      className="text-blue-300 hover:text-blue-200 font-semibold transition-colors"
    >
      Create one
    </Link>
  );

  return (
    <GradientBackground>
      <AuthForm
        title="Welcome Back"
        subtitle="Sign in to your account"
        fields={loginFields}
        submitText="Sign In"
        loadingText="Signing you in..."
        onFinish={handleLogin}
        isLoading={isLoading}
        footerLink={footerLink}
        footerText="Don't have an account?"
      />
    </GradientBackground>
  );
};

export default Login;
