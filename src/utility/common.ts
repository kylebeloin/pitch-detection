export function args(...args: any[]) {
  return args;
}

export function debounce(func: Function, wait: number) {
  let timeout: any;
  return function (this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

const eventLocation = (event: any) => {
  if (event.touches) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  return {
    x: event.clientX,
    y: event.clientY,
  };
};

export const getElementAtLocation = (x: number, y: number) => {
  return document.elementFromPoint(x, y);
};

export const getMousePosition = (event: any) => {
  const { x, y } = eventLocation(event);
  const element = getElementAtLocation(x, y) as HTMLElement;
  const rect = element?.getBoundingClientRect();
  return {
    x: x - rect?.left || 0,
    y: y - rect?.top || 0,
  };
};
