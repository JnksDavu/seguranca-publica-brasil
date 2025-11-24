import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  baseUrl?: string;
};

export function SwaggerDocs({ baseUrl }: Props) {
  // baseUrl pode ser algo como http://localhost:5000/api ou sem /api.
  const rawBase =
    baseUrl ||
    (import.meta as any)?.env?.VITE_API_BASE_URL ||
    window.location.origin;

  // Remove duplicação final / e /api para montar corretamente /api/docs/json
  const hostBase = rawBase.replace(/\/+$/, '').replace(/\/api$/i, '');
  const specUrl = `${hostBase}/api/docs/json`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
      <SwaggerUI
        url={specUrl}
        docExpansion="list"
        deepLinking
        persistAuthorization
        tryItOutEnabled
        supportedSubmitMethods={['get','post','put','delete','patch','options','head']}
        defaultModelsExpandDepth={0}
      />
    </div>
  );
}