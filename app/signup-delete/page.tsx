'use client';

import { SignUp } from '@clerk/nextjs';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useParams } from 'next/navigation';

export default function SignUpPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
              card: 'shadow-lg',
            }
          }}
          signInUrl={`/login`}
        />
      </div>
      <Footer />
    </div>
  );
}

