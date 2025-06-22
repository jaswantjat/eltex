import WebhookForm from '@/components/WebhookForm';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header */}
      <div className="relative bg-white backdrop-blur-md border-b border-indigo-200/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <div className="relative">
              <Image
                src="/eltex-logo.svg"
                alt="ELTEX Logo"
                width={40}
                height={40}
                className="sm:w-12 sm:h-12 rounded-xl shadow-lg ring-2 ring-white/50"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            </div>
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-1">
                ELTEX Webhook Form
              </h1>
              <p className="text-xs sm:text-sm font-medium text-indigo-600/80 tracking-wide">
                Professional Automation Testing Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full border border-indigo-200/50 mb-6">
            <span className="text-sm font-medium text-indigo-700">✨ Advanced Webhook Testing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4 leading-tight">
            Test Your <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Automation Workflows</span>
          </h2>
          <p className="text-xl text-indigo-700 mb-2 max-w-3xl mx-auto leading-relaxed">
            Generate JSON payloads and verify Spanish vs Foreign number detection logic
          </p>
          <p className="text-lg text-indigo-600 max-w-2xl mx-auto">
            Compatible with Make.com, n8n, and custom webhook endpoints
          </p>
        </div>

        {/* Main Form */}
        <WebhookForm />
      </div>
    </div>
  );
}
