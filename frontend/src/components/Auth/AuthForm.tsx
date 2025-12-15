import React, { useState } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import type { Rule } from "antd/es/form";
import { MdMessage, MdVisibility, MdVisibilityOff } from "react-icons/md";

interface Field {
  name: string;
  label: string;
  icon?: React.ReactNode;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  rules?: Rule[];
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  fields: Field[];
  submitText: string;
  loadingText: string;
  onFinish: (values: any) => Promise<void>;
  isLoading: boolean;
  footerLink?: React.ReactNode;
  footerText?: string;
  form?: any;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  fields,
  submitText,
  loadingText,
  onFinish,
  isLoading,
  footerLink,
  footerText,
  form: formProp
}) => {
  const [form] = Form.useForm();
  const [passwordVisible, setPasswordVisible] = useState<{ [key: string]: boolean }>({});

  const handleFinish = async (values: any) => {
    await onFinish(values);
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setPasswordVisible(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const activeForm = formProp || form;

  return (
    <Card
      className="w-full max-w-md shadow-2xl border-0 backdrop-blur-lg bg-white/10 relative z-10"
    >
      <div className="text-center mb-5">
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
          <span
            className="text-white text-3xl"
            role="img"
            aria-label="Chat icon"
          >
           <MdMessage />
          </span>
        </div>
        <Typography.Title level={2} className="font-bold !mb-0">
          {title}
        </Typography.Title>
        <Typography.Text className="text-gray-500 text-sm">
          {subtitle}
        </Typography.Text>
      </div>

      <Form
        form={activeForm}
        name={title.toLowerCase().replace(/\s+/g, '-')}
        onFinish={handleFinish}
        layout="vertical"
        size="large"
        role="form"
        aria-label={`${title} form`}
      >
        {fields.map((field) => (
          <Form.Item
            key={field.name}
            name={field.name}
            label={<span className="font-medium">{field.label}</span>}
            rules={field.rules}
            className="!mb-0"
          >
            <Input
              prefix={field.icon}
              type={field.type === "password" ? (passwordVisible[field.name] ? "text" : "password") : field.type || "text"}
              placeholder={field.placeholder}
              className="bg-white/10 border-white/20 text-white placeholder-white/60 hover:border-white/40 focus:border-white/50 transition-colors"
              size="large"
              autoComplete={field.autoComplete}
              suffix={
                field.type === "password" ? (
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.name)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {passwordVisible[field.name] ? <MdVisibilityOff className="text-black"/> : <MdVisibility className="text-black"/>}
                  </button>
                ) : null
              }
            />
          </Form.Item>
        ))}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            className="bg-gradient-to-r mt-10 from-cyan-500 to-blue-600 border-0 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            {isLoading ? loadingText : submitText}
          </Button>
        </Form.Item>
      </Form>

      {footerLink && footerText && (
        <div className="mt-5 text-center">
          <Typography.Text className="text-gray-500">
            {footerText}{" "}
            {footerLink}
          </Typography.Text>
        </div>
      )}
    </Card>
  );
};


export default AuthForm;
