'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  street: z.string().min(1, 'Street address is required'),
  zipcode: z.string().min(1, 'Zip code is required'),
  city: z.string().min(1, 'City is required'),
  nutzflaeche: z.string().min(1, 'Nutzfläche is required'),
  webhook_endpoint: z.enum(['make', 'n8n', 'custom'], {
    required_error: 'Please select a webhook endpoint',
  }),
  custom_webhook_url: z.string().optional(),
}).refine((data) => {
  if (data.webhook_endpoint === 'custom') {
    return data.custom_webhook_url && data.custom_webhook_url.length > 0;
  }
  return true;
}, {
  message: 'Custom webhook URL is required when using custom endpoint',
  path: ['custom_webhook_url'],
});

type FormData = z.infer<typeof formSchema>;

interface SubmissionResult {
  success: boolean;
  message: string;
  response?: unknown;
}

export default function WebhookForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: 'Test',
      last_name: 'Luciano',
      phone: '+34651558844',
      email: 'test@gmail.com',
      street: 'Calle falsa, 61',
      zipcode: '17481',
      city: 'Buenos aires',
      nutzflaeche: '50',
      webhook_endpoint: 'make',
      custom_webhook_url: '',
    },
  });

  const selectedEndpoint = watch('webhook_endpoint');
  const [selectedTestCase, setSelectedTestCase] = useState<number | null>(null);

  const generatePayload = (data: FormData) => {
    const now = new Date();
    return {
      action: 'sale:created',
      payload: {
        sale_id: Math.floor(Math.random() * 10000000),
        sale_date: now.toISOString(),
        lead_id: Math.floor(Math.random() * 10000000),
        title: 'Herr',
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        mobile: null,
        email: data.email,
        street: data.street,
        zipcode: data.zipcode,
        city: data.city,
        postal_address: null,
        subject: 'photovoltaics',
        service: 'power_system',
        comment: 'Importante: contactar el 23.05.2025\nCasa recién comprada. \nInterés en subvención. ',
        infos: {
          dachtyp: 'Tejado a 3 aguas',
          nutzflaeche: data.nutzflaeche,
          zeitpunkt_projektbegin: 'De 3 a 6 meses',
          ortstermin: now.toISOString().split('T')[0].split('-').reverse().join('.'),
          erreichbarkeit: 'De jornada completa',
          objekt: 'Adosado',
          dacheindeckung: 'Teja de barro tipo arabe',
          eigentumsverhaeltnisse: 'Propietario / Poder decisión',
          stromspeicher: 'Si',
          buy_rent: 'Comprar',
          largescaleconsumer: '151 a 250€',
          power_consumption: 'Conectada a la red',
          photovoltaic_system_interest: 'Ninguna petición especial',
        },
        price: '41.00',
        subscription_group: 'Cataluña',
        images: [],
        product: 'FV',
      },
    };
  };

  const getWebhookUrl = (endpoint: string, customUrl?: string) => {
    if (endpoint === 'custom' && customUrl) {
      return customUrl;
    }

    // Production webhook URLs for ELTEX automation workflows
    const urls = {
      make: process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/l40rs4j6o8qljifrsc12pvcngq9hczjq',
      n8n: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://primary-production-1cd8.up.railway.app/webhook/webhook-phone-automation',
    };
    return urls[endpoint as keyof typeof urls];
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const payload = generatePayload(data);
      const webhookUrl = getWebhookUrl(data.webhook_endpoint, data.custom_webhook_url);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        setResult({
          success: true,
          message: `Successfully sent to ${data.webhook_endpoint.toUpperCase()} webhook!`,
          response: responseData,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Failed to send webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const testCases = [
    {
      name: 'Spanish Number (+34)',
      phone: '+34651558844',
      description: 'Should trigger HTTP request to Make.com endpoint',
    },
    {
      name: 'Foreign Number (Argentina)',
      phone: '005411556699',
      description: 'Should trigger email alert to l.lemos@eltex.es',
    },
    {
      name: 'Spanish Local (tel: format)',
      phone: 'tel: 604112266',
      description: 'Should trigger HTTP request to Make.com endpoint',
    },
  ];

  const loadTestCase = (testCase: typeof testCases[0], index: number) => {
    setSelectedTestCase(index);
    reset({
      ...formSchema.parse({
        first_name: 'Test',
        last_name: 'Luciano',
        phone: testCase.phone,
        email: 'test@gmail.com',
        street: 'Calle falsa, 61',
        zipcode: '17481',
        city: 'Buenos aires',
        nutzflaeche: '50',
        webhook_endpoint: 'make',
      }),
    });
  };

  return (
    <div className="space-y-12">
      {/* Test Cases Section */}
      <div className="relative bg-white backdrop-blur-md rounded-3xl shadow-2xl border border-indigo-200/30 p-10 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-white rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/20 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

        <div className="relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full border border-indigo-200/50 mb-4">
              <span className="text-sm font-semibold text-indigo-700">🚀 Quick Start</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-blue-800 bg-clip-text text-transparent mb-3">
              Test Cases
            </h2>
            <p className="text-indigo-700 text-lg">Load pre-configured scenarios to test your automation workflows</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testCases.map((testCase, index) => (
              <div
                key={index}
                className={`group relative bg-white backdrop-blur-sm rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
                  selectedTestCase === index
                    ? 'border-indigo-500 shadow-2xl ring-2 ring-indigo-200 bg-gradient-to-br from-indigo-50/50 to-blue-50/50'
                    : 'border-indigo-200/40 hover:border-indigo-300/60 hover:shadow-2xl'
                }`}
              >
                {/* Card Background Effects */}
                <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-100/30 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`rounded-full shadow-sm transition-all duration-300 ${
                      selectedTestCase === index
                        ? 'w-4 h-4 ring-2 ring-white shadow-lg'
                        : 'w-3 h-3'
                    } ${
                      testCase.phone.match(/^(\+34|tel:\s*[67]|[67])/)
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}></div>
                    <h3 className={`font-bold text-lg transition-colors duration-300 ${
                      selectedTestCase === index ? 'text-indigo-700' : 'text-indigo-900'
                    }`}>{testCase.name}</h3>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-xl p-4 mb-4 shadow-inner">
                    <p className="text-sm font-mono text-green-400 font-medium">
                      {testCase.phone}
                    </p>
                  </div>

                  <p className="text-sm text-indigo-700 mb-6 leading-relaxed">
                    {testCase.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => loadTestCase(testCase, index)}
                    className={`group/btn w-full px-6 py-3 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden ${
                      selectedTestCase === index
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center">
                      {selectedTestCase === index ? (
                        <>
                          ✓ Loaded
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Load Test Case
                          <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative bg-white backdrop-blur-md rounded-3xl shadow-2xl border border-indigo-200/30 p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-white rounded-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full -translate-y-48 -translate-x-48"></div>

        <div className="relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full border border-indigo-200/50 mb-4">
              <span className="text-sm font-semibold text-indigo-700">📝 Form Data</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-blue-800 bg-clip-text text-transparent mb-3">
              Contact Information
            </h2>
            <p className="text-indigo-700 text-lg">Fill in the details to generate the webhook payload</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            {/* Personal Information */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-8 border border-indigo-100/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">Personal Details</h3>
                  <p className="text-sm text-indigo-700">Basic contact information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-indigo-800 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <input
                      {...register('first_name')}
                      className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm text-indigo-900 placeholder-indigo-500 shadow-sm hover:shadow-md"
                      placeholder="Enter first name"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.first_name && (
                    <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-indigo-800 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <input
                      {...register('last_name')}
                      className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm text-indigo-900 placeholder-indigo-500 shadow-sm hover:shadow-md"
                      placeholder="Enter last name"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.last_name && (
                    <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Number - Special Section */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-8 border-2 border-indigo-200/50 shadow-xl relative overflow-hidden">
              {/* Special Background Effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-900">Phone Number Detection</h3>
                    <p className="text-sm text-indigo-700 font-medium">Critical routing logic</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 mb-6 shadow-lg">
                  <div className="flex items-center text-white mb-3">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Smart Routing Logic</span>
                  </div>
                  <p className="text-indigo-100 text-sm leading-relaxed">
                    Spanish numbers → HTTP request to automation platform<br/>
                    Foreign numbers → Email alert to l.lemos@eltex.es
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-indigo-800 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      {...register('phone')}
                      className="w-full px-6 py-5 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm font-mono text-xl text-indigo-900 placeholder-indigo-500 shadow-lg hover:shadow-xl"
                      placeholder="Enter phone number (e.g., +34651558844)"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone.message}
                    </p>
                  )}

                  <div className="bg-white backdrop-blur-sm rounded-xl p-4 border border-indigo-200/50">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold text-indigo-800">Spanish Number Patterns</span>
                    </div>
                    <div className="text-xs text-indigo-800 space-y-1">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                        <code className="bg-indigo-100 px-2 py-1 rounded">+34</code> - International format
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                        <code className="bg-indigo-100 px-2 py-1 rounded">tel: 6/7</code> - Local with tel: prefix
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                        <code className="bg-indigo-100 px-2 py-1 rounded">6/7</code> - Local Spanish mobile
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-8 border border-indigo-100/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">Contact & Address</h3>
                  <p className="text-sm text-indigo-700">Communication and location details</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-indigo-800 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm text-indigo-900 placeholder-indigo-500 shadow-sm hover:shadow-md"
                      placeholder="Enter email address"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-indigo-800 mb-2">
                      Street Address *
                    </label>
                    <div className="relative">
                      <input
                        {...register('street')}
                        className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm text-indigo-900 placeholder-indigo-500 shadow-sm hover:shadow-md"
                        placeholder="Enter street address"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.street && (
                      <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-indigo-800 mb-2">
                      Zip Code *
                    </label>
                    <div className="relative">
                      <input
                        {...register('zipcode')}
                        className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm text-indigo-900 placeholder-indigo-500 shadow-sm hover:shadow-md"
                        placeholder="Enter zip code"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.zipcode && (
                      <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.zipcode.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-indigo-800 mb-2">
                      City *
                    </label>
                    <div className="relative">
                      <input
                        {...register('city')}
                        className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm text-indigo-900 placeholder-indigo-500 shadow-sm hover:shadow-md"
                        placeholder="Enter city"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.city && (
                      <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Information */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-8 border border-indigo-100/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">Technical Details</h3>
                  <p className="text-sm text-indigo-700">Solar panel installation specifications</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-indigo-800 mb-2">
                  Nutzfläche (m²) *
                </label>
                <div className="relative">
                  <input
                    {...register('nutzflaeche')}
                    className="w-full px-5 py-4 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white backdrop-blur-sm text-emerald-900 placeholder-emerald-500 shadow-sm hover:shadow-md"
                    placeholder="Enter area in square meters"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 text-sm font-medium">
                    m²
                  </div>
                </div>
                {errors.nutzflaeche && (
                  <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.nutzflaeche.message}
                  </p>
                )}
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="bg-white backdrop-blur-sm rounded-2xl p-8 border border-indigo-100/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">Webhook Configuration</h3>
                  <p className="text-sm text-indigo-700">Choose your automation platform</p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-sm font-bold text-indigo-800 mb-4">
                  Select Webhook Endpoint *
                </label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <label className="relative group cursor-pointer">
                    <input
                      {...register('webhook_endpoint')}
                      type="radio"
                      value="make"
                      className="sr-only peer"
                    />
                    <div className="p-8 border-2 border-indigo-200 rounded-2xl transition-all duration-300 peer-checked:border-indigo-500 peer-checked:bg-gradient-to-br peer-checked:from-indigo-50 peer-checked:to-blue-50 peer-checked:shadow-xl hover:border-indigo-300 hover:shadow-lg bg-white backdrop-blur-sm group-hover:-translate-y-1">
                      <div className="flex items-center space-x-6">
                        <div className="relative flex-shrink-0">
                          <div className={`w-6 h-6 border-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                            selectedEndpoint === 'make'
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-indigo-300'
                          }`}>
                            <div className={`w-2 h-2 bg-white rounded-full transition-opacity duration-200 ${
                              selectedEndpoint === 'make' ? 'opacity-100' : 'opacity-0'
                            }`}></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-indigo-900 text-xl mb-1">Make.com</div>
                          <div className="text-sm text-indigo-600 leading-relaxed">Professional automation platform</div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative group cursor-pointer">
                    <input
                      {...register('webhook_endpoint')}
                      type="radio"
                      value="n8n"
                      className="sr-only peer"
                    />
                    <div className="p-8 border-2 border-indigo-200 rounded-2xl transition-all duration-300 peer-checked:border-indigo-500 peer-checked:bg-gradient-to-br peer-checked:from-indigo-50 peer-checked:to-blue-50 peer-checked:shadow-xl hover:border-indigo-300 hover:shadow-lg bg-white backdrop-blur-sm group-hover:-translate-y-1">
                      <div className="flex items-center space-x-6">
                        <div className="relative flex-shrink-0">
                          <div className={`w-6 h-6 border-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                            selectedEndpoint === 'n8n'
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-indigo-300'
                          }`}>
                            <div className={`w-2 h-2 bg-white rounded-full transition-opacity duration-200 ${
                              selectedEndpoint === 'n8n' ? 'opacity-100' : 'opacity-0'
                            }`}></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-indigo-900 text-xl mb-1">n8n</div>
                          <div className="text-sm text-indigo-600 leading-relaxed">Open-source workflow automation</div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative group cursor-pointer">
                    <input
                      {...register('webhook_endpoint')}
                      type="radio"
                      value="custom"
                      className="sr-only peer"
                    />
                    <div className="p-8 border-2 border-indigo-200 rounded-2xl transition-all duration-300 peer-checked:border-indigo-500 peer-checked:bg-gradient-to-br peer-checked:from-indigo-50 peer-checked:to-blue-50 peer-checked:shadow-xl hover:border-indigo-300 hover:shadow-lg bg-white backdrop-blur-sm group-hover:-translate-y-1">
                      <div className="flex items-center space-x-6">
                        <div className="relative flex-shrink-0">
                          <div className={`w-6 h-6 border-2 rounded-full transition-all duration-200 flex items-center justify-center ${
                            selectedEndpoint === 'custom'
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-indigo-300'
                          }`}>
                            <div className={`w-2 h-2 bg-white rounded-full transition-opacity duration-200 ${
                              selectedEndpoint === 'custom' ? 'opacity-100' : 'opacity-0'
                            }`}></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-indigo-900 text-xl mb-1">Custom</div>
                          <div className="text-sm text-indigo-600 leading-relaxed">Your own webhook endpoint</div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.webhook_endpoint && (
                  <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.webhook_endpoint.message}
                  </p>
                )}

                {selectedEndpoint === 'custom' && (
                  <div className="space-y-3 mt-6 p-6 bg-white rounded-2xl border border-indigo-200">
                    <label className="block text-sm font-bold text-indigo-800 mb-2">
                      Custom Webhook URL *
                    </label>
                    <div className="relative">
                      <input
                        {...register('custom_webhook_url')}
                        type="url"
                        className="w-full px-5 py-4 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white backdrop-blur-sm text-indigo-900 placeholder-indigo-500 shadow-sm hover:shadow-md"
                        placeholder="https://your-webhook-endpoint.com/webhook"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {errors.custom_webhook_url && (
                      <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.custom_webhook_url.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-12">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative px-12 py-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white rounded-2xl hover:from-indigo-700 hover:via-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-2 hover:scale-105 font-bold text-xl overflow-hidden"
              >
                {/* Button Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                <div className="relative flex items-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-4 animate-spin" />
                      <span className="tracking-wide">Sending to Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 mr-4 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
                      <span className="tracking-wide">Send to Webhook</span>
                      <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`relative bg-white backdrop-blur-md rounded-3xl shadow-2xl border p-10 overflow-hidden transition-all duration-500 ${
          result.success
            ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-green-50/80'
            : 'border-red-200/50 bg-gradient-to-br from-red-50/80 to-rose-50/80'
        }`}>
          {/* Background Effects */}
          <div className={`absolute inset-0 rounded-3xl ${
            result.success
              ? 'bg-gradient-to-br from-emerald-100/30 to-green-100/30'
              : 'bg-gradient-to-br from-red-100/30 to-rose-100/30'
          }`}></div>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-32 translate-x-32 ${
            result.success
              ? 'bg-gradient-to-bl from-emerald-200/20 to-transparent'
              : 'bg-gradient-to-bl from-red-200/20 to-transparent'
          }`}></div>

          <div className="relative">
            <div className="flex items-center mb-6">
              {result.success ? (
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl mr-6 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl mr-6 shadow-lg">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                  {result.success ? '🎉 Success!' : '❌ Error'}
                </h3>
                <p className={`text-lg ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>
            </div>

            {result.response ? (
              <div className="mt-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-700 to-blue-800 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-indigo-800">Webhook Response</h4>
                </div>
                <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-6 shadow-inner border border-indigo-700">
                  <pre className="text-sm text-emerald-400 font-mono leading-relaxed overflow-x-auto">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
