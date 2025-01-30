import React, { useState } from 'react';
import { Building2, Users, BarChart, Shield, ChevronRight, CheckCircle } from 'lucide-react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);

  const features = [
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Acompanhamento completo do ciclo de vida dos clientes"
    },
    {
      icon: BarChart,
      title: "Análise de Dados",
      description: "Relatórios detalhados e insights valiosos"
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Proteção total dos seus dados"
    }
  ];

  const benefits = [
    "Aumente sua produtividade em até 50%",
    "Reduza custos operacionais",
    "Tome decisões baseadas em dados",
    "Melhore a satisfação dos clientes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary">
      {/* Header */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Building2 className="text-white w-8 h-8" />
            <span className="text-white text-2xl font-bold">LimpCred</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-white">
            <a href="#features" className="hover:text-primary-light transition-colors">Recursos</a>
            <a href="#benefits" className="hover:text-primary-light transition-colors">Benefícios</a>
            <a href="#contact" className="hover:text-primary-light transition-colors">Contato</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Transforme sua Gestão Empresarial
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Uma plataforma completa para simplificar processos, aumentar produtividade
              e impulsionar resultados com decisões baseadas em dados.
            </p>
            
            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-flex items-center group">
                Comece Agora
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column - Auth Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg p-1 bg-gray-100">
                <button
                  onClick={() => setShowLogin(true)}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    showLogin
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setShowLogin(false)}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    !showLogin
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Cadastro
                </button>
              </div>
            </div>

            {showLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Recursos Poderosos
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}