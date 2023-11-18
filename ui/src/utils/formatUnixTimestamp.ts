export const formatUnixTimestamp = (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    // @ts-ignore
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  