import React from 'react';
import { useToast } from '../hooks/useToast';

const ToastExample = () => {
  const { toast } = useToast();

  const showSuccessToast = () => {
    toast.success('Operation completed successfully!');
  };

  const showErrorToast = () => {
    toast.error('An error occurred while processing your request.');
  };

  const showWarningToast = () => {
    toast.warning('Please review your input before proceeding.');
  };

  const showInfoToast = () => {
    toast.info('New updates are available for your application.');
  };

  const showCustomDurationToast = () => {
    toast.info('This toast will disappear in 10 seconds', 10000);
  };

  const showPersistentToast = () => {
    toast.warning('This toast will not auto-dismiss', 0);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Toast Notification Examples</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={showSuccessToast}>Show Success</button>
        <button onClick={showErrorToast}>Show Error</button>
        <button onClick={showWarningToast}>Show Warning</button>
        <button onClick={showInfoToast}>Show Info</button>
        <button onClick={showCustomDurationToast}>Show 10s Toast</button>
        <button onClick={showPersistentToast}>Show Persistent Toast</button>
      </div>
    </div>
  );
};

export default ToastExample;