export const checkDomain = async (domain: string, userId: string) => {
  const mockResult = {
    spf: "pass",
    dkim: "fail",
    dmarc: "pass",
  };

  return {
    domain,
    result: mockResult,
  };
};
