import { useState, useRef, useMemo } from 'react';

export function useDialogState(initialData = null) {
  const resolveRef = useRef<any>(null);
  const [data, setData] = useState<any>(initialData);

  const [showAsync, onClose] = useMemo(() => {
    const showAsync = (data = undefined) => {
      setData(data === undefined ? true : data);

      return new Promise<any>(resolve => {
        resolveRef.current = resolve;
      });
    };

    const onClose = (val: any) => {
      resolveRef.current && resolveRef.current(val);
      setData(null);
    };

    return [showAsync, onClose];
  }, []);

  return {data, showAsync, onClose};
}