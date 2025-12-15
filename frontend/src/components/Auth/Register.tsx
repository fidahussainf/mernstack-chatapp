import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import AuthForm from './AuthForm';
import GradientBackground from '../UI/GradientBackground';
import { authService } from '../../services/authService';

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const registerFields: any[] = [
    {
      name: "name",
      label: "Full Name",
      icon: <UserOutlined className="text-white/70" />,
      placeholder: "John Doe",
      autoComplete: "name",
      rules: [
        { required: true, message: 'Please enter your full name' },
        { min: 2, message: 'Name must be at least 2 characters' },
        { max: 50, message: 'Name must be less than 50 characters' }
      ],
    },
    {
      name: "email",
      label: "Email Address",
      icon: <MailOutlined className="text-white/70" />,
      type: "email",
      placeholder: "your@email.com",
      autoComplete: "email",
      rules: [
        { required: true, message: 'Please enter your email address' },
        { type: 'email', message: 'Please enter a valid email address' }
      ],
    },
    {
      name: "password",
      label: "Password",
      icon: <LockOutlined className="text-white/70" />,
      type: "password",
      placeholder: "Create a strong password",
      autoComplete: "new-password",
      rules: [
        { required: true, message: 'Please create a password' },
        { min: 6, message: 'Password must be at least 6 characters' },
        {
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }
      ],
    },
  ];

  const handleRegister = async (values: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      await authService.register(values);
      toast.success('Account created successfully! Welcome aboard! 🎉');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const err = error as any;
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const footerLink = (
    <Link to="/login" className="text-blue-300 hover:text-blue-200 font-semibold transition-colors">
      Sign in
    </Link>
  );

  return (
    <GradientBackground>
      <AuthForm
        title="Create Account"
        subtitle=""
        fields={registerFields}
        submitText="Create Account"
        loadingText="Creating your account..."
        onFinish={handleRegister}
        isLoading={isLoading}
        footerLink={footerLink}
        footerText="Already have an account?"
      />
    </GradientBackground>
  );
};

export default Register;