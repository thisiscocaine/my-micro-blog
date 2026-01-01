import React, { PropsWithChildren } from 'react';

export function FormCard({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f5f7fb', padding: 16
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: '#fff', borderRadius: 14,
        padding: '24px 24px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
      }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{title}</div>
        {subtitle && <div style={{ color: '#6b7280', marginTop: 4 }}>{subtitle}</div>}
        <div style={{ marginTop: 16 }}>{children}</div>
      </div>
    </div>
  );
}
