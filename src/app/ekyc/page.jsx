"use client";

import { useState } from 'react';
import VNPTEkyc from '@/components/eKYC/VNPTEkyc';

export default function EkycPage() {
  const [result, setResult] = useState(null);

  const handleEkycResult = (res) => {
    setResult(res);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Xác thực danh tính (eKYC)
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <VNPTEkyc onResult={handleEkycResult} />
        </div>

        {result && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Kết quả xác thực</h2>
            <div className="overflow-x-auto bg-gray-900 text-green-400 p-4 rounded-lg">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
