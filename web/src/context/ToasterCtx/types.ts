export type ToastProps = {
  id: number;
  title: string;
  intent: 'none' | 'success' | 'danger';
  duration?: number;
  remove: (id: number) => void;
};
