export const checkProviderLock = (providerName, permissionList) => {
  const found = permissionList?.find(
    (item) =>
      item.type === "provider" &&
      item.provider?.toLowerCase() === providerName?.toLowerCase()
  );

  return found ? found.provider : null;
};