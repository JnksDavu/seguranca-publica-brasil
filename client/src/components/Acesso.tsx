import React from 'react';
import api from '../services/api';
import { SwaggerDocs } from './SwaggerDocs';

export function Acesso() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SwaggerDocs
        baseUrl={(api && api.defaults && api.defaults.baseURL) || undefined}
      />
    </div>
  );
}
